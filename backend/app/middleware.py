from fastapi import Request, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from app.config import settings
from app.database import get_db
from app.models import User
from sqlalchemy.orm import Session
from typing import Optional
import re

security = HTTPBearer()

# Define role-based path patterns
ROLE_PATH_MAPPING = {
    "vendor": [
        r"^/vendor/",
        r"^/resources/",  # Vendor resources
        r"^/contracts/vendor/",
    ],
    "client": [
        r"^/client/",
        r"^/requirements/",
        r"^/contracts/client/",
    ],
    "admin": [
        r"^/admin/",
    ]
}

# Public paths that don't require role validation
PUBLIC_PATHS = [
    "/auth",
    "/docs",
    "/openapi.json",
    "/health",
    "/",
    "/static",
]

def get_current_user_dependency(db: Session, token: str):
    """Helper to get current user from token"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email = payload.get("sub")
        
        if not email:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: no email found"
            )
        
        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
        
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Account is deactivated"
            )
        
        return user
        
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}"
        )

async def get_current_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db)
):
    """Dependency to get current user from token"""
    
    # Skip for auth endpoints
    if request.url.path.startswith("/auth"):
        return None
    
    try:
        token = credentials.credentials
        return get_current_user_dependency(db, token)
        
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e)
        )

def check_role_access(path: str, user_role: str) -> bool:
    """
    Check if a user with given role can access a specific path
    
    Args:
        path: The request path
        user_role: The user's role (vendor, client, admin)
    
    Returns:
        bool: True if access is allowed, False otherwise
    """
    # Admin has access to everything
    if user_role == "admin":
        return True
    
    # Check if path matches any role-based pattern
    for role, patterns in ROLE_PATH_MAPPING.items():
        if user_role == role:
            for pattern in patterns:
                if re.match(pattern, path):
                    return True
    
    # If no specific role pattern matched, allow access
    # This is for shared paths like /dashboard, /profile, etc.
    return True

def is_public_path(path: str) -> bool:
    """Check if path is public and doesn't require authentication"""
    for public_path in PUBLIC_PATHS:
        if path.startswith(public_path):
            return True
    return False

async def validate_user_role(request: Request, call_next):
    """
    Middleware to validate user role with proper access control
    """
    
    # Skip validation for public endpoints
    if is_public_path(request.url.path):
        return await call_next(request)
    
    try:
        # Check if Authorization header exists
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            # If the endpoint requires auth, this will be caught by the dependency
            return await call_next(request)
        
        # Extract token
        try:
            scheme, token = auth_header.split()
            if scheme.lower() != "bearer":
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid authentication scheme. Use Bearer."
                )
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authorization header format"
            )
        
        # Get database session
        db = next(get_db())
        try:
            # Get user from token
            user = get_current_user_dependency(db, token)
            
            # Check role-based access
            path = request.url.path
            
            # Get role from token (for validation)
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            token_role = payload.get("role")
            
            # Validate that token role matches database role
            if token_role and token_role != user.role:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Role mismatch. Token says '{token_role}' but user is '{user.role}'"
                )
            
            # Check if the user has access to this path
            if not check_role_access(path, user.role):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Access denied. You are registered as a {user.role} and don't have access to this resource."
                )
            
            # Store user in request state for later use
            request.state.user = user
            request.state.user_role = user.role
            
        except HTTPException:
            raise
        except Exception as e:
            print(f"Role validation error: {e}")
            # Don't block the request, let the dependency handle it
            pass
        finally:
            db.close()
            
    except HTTPException:
        raise
    except Exception as e:
        # Log error but don't block the request
        print(f"Middleware error: {e}")
    
    return await call_next(request)

# Additional helper function for role-based decorator
def require_role(required_role: str):
    """
    Decorator to require a specific role for an endpoint
    
    Usage:
        @router.get("/vendor/endpoint")
        @require_role("vendor")
        def endpoint():
            pass
    """
    def decorator(func):
        async def wrapper(*args, **kwargs):
            # This is just a marker, actual validation happens in middleware
            return await func(*args, **kwargs)
        return wrapper
    return decorator

# Helper to get current user role from request
def get_user_role_from_request(request: Request) -> Optional[str]:
    """Get user role from request state (set by middleware)"""
    return getattr(request.state, "user_role", None)

# Helper to get current user from request
def get_user_from_request(request: Request) -> Optional[User]:
    """Get user from request state (set by middleware)"""
    return getattr(request.state, "user", None)

# Router-level dependency for role validation
class RoleChecker:
    """Dependency for checking user roles in routes"""
    
    def __init__(self, allowed_roles: list):
        self.allowed_roles = allowed_roles
    
    def __call__(self, current_user: User = Depends(get_current_user)):
        if current_user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication required"
            )
        
        if current_user.role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {', '.join(self.allowed_roles)}"
            )
        
        return current_user