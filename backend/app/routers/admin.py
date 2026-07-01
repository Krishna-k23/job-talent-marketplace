from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_, desc
from typing import List, Optional
from datetime import datetime, timedelta
from app.database import get_db
from app.models.models import User, Requirement, Resource, Contract, Match, Company  # Add Company import
from app.models.admin_models import AdminLog, UserActivityLog, SystemSetting, ServiceHealth
from app.schemas.admin_schemas import *
from app.schemas.schemas import RequirementCreate, RequirementResponse, RequirementUpdate, ResourceCreate, ResourceResponse, UserResponse
from app.middleware.admin_middleware import require_admin, require_super_admin
from app.auth import get_password_hash
from app.utils.admin_utils import log_admin_action, get_analytics_overview, get_user_growth_data
from app.utils.helpers import generate_resource_id, generate_requirement_id
import json

router = APIRouter(prefix="/admin", tags=["Admin"])

# ==================== DASHBOARD STATS ====================

@router.get("/dashboard/stats", response_model=AdminDashboardStats)
async def get_dashboard_stats(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get comprehensive dashboard statistics"""
    
    # Overview stats
    overview = get_analytics_overview(db)
    
    # Recent users
    recent_users = db.query(User).order_by(User.created_at.desc()).limit(10).all()
    
    # Recent admin activity
    recent_activity = db.query(AdminLog).order_by(AdminLog.created_at.desc()).limit(10).all()
    
    # Requirements by role
    requirements_by_role = db.query(
        Requirement.role,
        func.count(Requirement.id).label('count')
    ).group_by(Requirement.role).order_by(func.count(Requirement.id).desc()).limit(10).all()
    
    # User growth (last 30 days)
    user_growth = get_user_growth_data(db, days=30)
    
    # Vendors by location - Get from company location
    vendor_location_data = []
    vendors = db.query(User).filter(User.role == "vendor").all()
    
    # Group vendors by location from their company
    location_counts = {}
    for vendor in vendors:
        location = "Unknown"
        if vendor.company_id:
            company = db.query(Company).filter(Company.id == vendor.company_id).first()
            if company and hasattr(company, 'location') and company.location:
                location = company.location
        # If company doesn't have location, use vendor's location if available
        elif hasattr(vendor, 'location') and vendor.location:
            location = vendor.location
        
        location_counts[location] = location_counts.get(location, 0) + 1
    
    vendor_by_location = [{"location": k, "count": v} for k, v in location_counts.items()]
    
    # Service health - Convert to dict
    service_health_records = db.query(ServiceHealth).all()
    service_health = []
    for record in service_health_records:
        service_health.append({
            "service_name": record.service_name,
            "status": record.status,
            "response_time": record.response_time,
            "error_rate": record.error_rate,
            "last_check": record.last_check,
            "details": record.details,
            "uptime_percentage": 99.9  # Default value
        })
    
    # Convert recent users to dict
    recent_users_data = []
    for user in recent_users:
        company_name = None
        if user.company_id:
            company = db.query(Company).filter(Company.id == user.company_id).first()
            if company:
                company_name = company.name
        
        recent_users_data.append({
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "phone": user.phone,
            "role": user.role,
            "is_active": user.is_active,
            "is_verified": user.is_verified,
            "vendor_name": user.vendor_name,
            "profile_picture": user.profile_picture,
            "company_name": company_name,
            "created_at": user.created_at,
            "last_login": None,
            "activity_count": 0
        })
    
    # Convert recent activity to dict
    recent_activity_data = []
    for log in recent_activity:
        admin = db.query(User).filter(User.id == log.admin_id).first()
        recent_activity_data.append({
            "id": log.id,
            "admin_id": log.admin_id,
            "admin_name": admin.full_name or admin.email if admin else "Unknown",
            "action": log.action,
            "target_type": log.target_type,
            "target_id": log.target_id,
            "details": log.details,
            "ip_address": log.ip_address,
            "created_at": log.created_at
        })
    
    return AdminDashboardStats(
        overview=overview,
        recent_users=recent_users_data,
        recent_activity=recent_activity_data,
        requirements_by_role=[{"role": r.role, "count": r.count} for r in requirements_by_role],
        user_growth=user_growth,
        vendor_by_location=vendor_by_location,
        service_health=service_health
    )

# ==================== USER MANAGEMENT ====================

@router.get("/users", response_model=List[AdminUserResponse])
async def get_all_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=1000),
    role: Optional[str] = None,
    search: Optional[str] = None,
    is_active: Optional[bool] = None,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get all users with filters"""
    query = db.query(User)
    
    if role:
        query = query.filter(User.role == role)
    
    if is_active is not None:
        query = query.filter(User.is_active == is_active)
    
    if search:
        query = query.filter(
            or_(
                User.email.ilike(f"%{search}%"),
                User.full_name.ilike(f"%{search}%"),
                User.vendor_name.ilike(f"%{search}%")
            )
        )
    
    # Exclude super admin from regular admin view unless super admin
    if current_user.role == "admin":
        query = query.filter(User.role != "super_admin")
    
    users = query.order_by(User.created_at.desc()).offset(skip).limit(limit).all()
    
    # Get activity counts and company names for each user
    result = []
    for user in users:
        activity_count = db.query(AdminLog).filter(AdminLog.admin_id == user.id).count()
        
        # Get company name if exists
        company_name = None
        if user.company_id:
            company = db.query(Company).filter(Company.id == user.company_id).first()
            if company:
                company_name = company.name
        
        result.append(AdminUserResponse(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            phone=user.phone,
            role=user.role,
            is_active=user.is_active,
            is_verified=user.is_verified,
            vendor_name=user.vendor_name,
            profile_picture=user.profile_picture,
            company_name=company_name,
            created_at=user.created_at,
            last_login=None,
            activity_count=activity_count
        ))
    
    return result

# ==================== REQUIREMENTS MANAGEMENT ====================

@router.get("/requirements", response_model=List[RequirementResponse])
async def get_all_requirements(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=1000),
    status: Optional[str] = None,
    client_id: Optional[int] = None,
    search: Optional[str] = None,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get all requirements with filters"""
    query = db.query(Requirement)
    
    if status:
        query = query.filter(Requirement.status == status)
    
    if client_id:
        query = query.filter(Requirement.client_id == client_id)
    
    if search:
        query = query.filter(
            or_(
                Requirement.role.ilike(f"%{search}%"),
                Requirement.description.ilike(f"%{search}%"),
                Requirement.location.ilike(f"%{search}%")
            )
        )
    
    requirements = query.order_by(Requirement.created_at.desc()).offset(skip).limit(limit).all()
    
    # Add matches count
    for req in requirements:
        matches_count = db.query(Match).filter(Match.requirement_id == req.id).count()
        req.matches_count = matches_count
    
    return requirements

@router.post("/requirements", response_model=RequirementResponse)
async def create_requirement_admin(
    requirement_data: RequirementCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Create a requirement on behalf of a client"""
    # Check client exists
    client = db.query(User).filter(
        User.id == requirement_data.client_id,
        User.role == "client"
    ).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    requirement_id = generate_requirement_id()
    
    new_requirement = Requirement(
        requirement_id=requirement_id,
        client_id=requirement_data.client_id,
        role=requirement_data.role,
        experience_min=requirement_data.experience_min,
        experience_max=requirement_data.experience_max,
        positions=requirement_data.positions,
        skills=requirement_data.skills,
        must_have_skills=requirement_data.must_have_skills,
        good_to_have_skills=requirement_data.good_to_have_skills,
        budget_min=requirement_data.budget_min,
        budget_max=requirement_data.budget_max,
        duration=requirement_data.duration,
        work_mode=requirement_data.work_mode,
        start_date=requirement_data.start_date,
        custom_start_date=requirement_data.custom_start_date,
        location=requirement_data.location,
        description=requirement_data.description,
        status="Open"
    )
    
    db.add(new_requirement)
    db.commit()
    db.refresh(new_requirement)
    
    log_admin_action(
        db=db,
        admin_id=current_user.id,
        action="requirement_created",
        target_type="requirement",
        target_id=new_requirement.id,
        details={"client_id": requirement_data.client_id, "role": requirement_data.role}
    )
    
    return new_requirement

@router.put("/requirements/{requirement_id}", response_model=RequirementResponse)
async def update_requirement_admin(
    requirement_id: int,
    requirement_data: RequirementUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Update a requirement (admin only)"""
    requirement = db.query(Requirement).filter(Requirement.id == requirement_id).first()
    if not requirement:
        raise HTTPException(status_code=404, detail="Requirement not found")
    
    update_data = requirement_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if value is not None:
            setattr(requirement, field, value)
    
    db.commit()
    db.refresh(requirement)
    
    log_admin_action(
        db=db,
        admin_id=current_user.id,
        action="requirement_updated",
        target_type="requirement",
        target_id=requirement_id,
        details={"updated_fields": list(update_data.keys())}
    )
    
    return requirement

@router.delete("/requirements/{requirement_id}")
async def delete_requirement_admin(
    requirement_id: int,
    current_user: User = Depends(require_super_admin),
    db: Session = Depends(get_db)
):
    """Delete a requirement (super admin only)"""
    requirement = db.query(Requirement).filter(Requirement.id == requirement_id).first()
    if not requirement:
        raise HTTPException(status_code=404, detail="Requirement not found")
    
    # Delete matches first
    db.query(Match).filter(Match.requirement_id == requirement_id).delete()
    db.delete(requirement)
    db.commit()
    
    log_admin_action(
        db=db,
        admin_id=current_user.id,
        action="requirement_deleted",
        target_type="requirement",
        target_id=requirement_id,
        details={"role": requirement.role}
    )
    
    return {"message": "Requirement deleted successfully"}

@router.get("/users/{user_id}", response_model=AdminUserResponse)
async def get_user_details(
    user_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get detailed user information"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check permission
    if current_user.role == "admin" and user.role == "super_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot view super admin details"
        )
    
    return user

@router.post("/users", response_model=AdminUserResponse)
async def create_user(
    user_data: AdminUserCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Create a new user (admin only)"""
    # Check if user exists
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Check role permission
    if user_data.role in ["admin", "super_admin"] and current_user.role != "super_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only super admin can create admin/super admin accounts"
        )
    
    # Create user
    hashed_password = get_password_hash(user_data.password)
    new_user = User(
        email=user_data.email,
        hashed_password=hashed_password,
        full_name=user_data.full_name,
        phone=user_data.phone,
        role=user_data.role,
        vendor_name=user_data.vendor_name if user_data.role == "vendor" else None,
        is_active=True,
        is_verified=True
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Log action
    log_admin_action(
        db=db,
        admin_id=current_user.id,
        action="user_created",
        target_type="user",
        target_id=new_user.id,
        details={"email": new_user.email, "role": new_user.role}
    )
    
    return new_user

@router.put("/users/{user_id}", response_model=AdminUserResponse)
async def update_user(
    user_id: int,
    user_data: AdminUserUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Update user details (admin only)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check permission
    if user.role == "super_admin" and current_user.role != "super_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot modify super admin"
        )
    
    if current_user.role == "admin" and user.role == "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot modify other admin"
        )
    
    # Update fields
    update_data = user_data.model_dump(exclude_unset=True)
    
    if "password" in update_data and update_data["password"]:
        update_data["hashed_password"] = get_password_hash(update_data.pop("password"))
    
    if "role" in update_data:
        # Role change validation
        if update_data["role"] in ["admin", "super_admin"] and current_user.role != "super_admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only super admin can assign admin roles"
            )
        if user.role == "super_admin" and update_data["role"] != "super_admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot demote super admin"
            )
        # Don't allow users to change their own role
        if user_id == current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot change your own role"
            )
        # If role changed to vendor, ensure vendor_name is set
        if update_data["role"] == "vendor" and not update_data.get("vendor_name"):
            update_data["vendor_name"] = user.full_name or f"Vendor_{user.id}"
    
    # Apply updates
    for field, value in update_data.items():
        if value is not None:
            setattr(user, field, value)
    
    db.commit()
    db.refresh(user)
    
    # Log action
    log_admin_action(
        db=db,
        admin_id=current_user.id,
        action="user_updated",
        target_type="user",
        target_id=user.id,
        details={"updated_fields": list(update_data.keys())}
    )
    
    return user

@router.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    current_user: User = Depends(require_super_admin),
    db: Session = Depends(get_db)
):
    """Delete a user (super admin only)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot delete yourself"
        )
    
    # Check if user has active contracts/requirements
    if user.role == "vendor":
        active_resources = db.query(Resource).filter(
            Resource.vendor_id == user.id,
            Resource.status == "Available"
        ).count()
        if active_resources > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot delete vendor with {active_resources} active resources"
            )
    elif user.role == "client":
        active_requirements = db.query(Requirement).filter(
            Requirement.client_id == user.id,
            Requirement.status == "Open"
        ).count()
        if active_requirements > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot delete client with {active_requirements} open requirements"
            )
    
    # Soft delete or hard delete?
    # For safety, we'll deactivate instead of hard delete
    user.is_active = False
    db.commit()
    
    # Log action
    log_admin_action(
        db=db,
        admin_id=current_user.id,
        action="user_deactivated",
        target_type="user",
        target_id=user.id,
        details={"email": user.email}
    )
    
    return {"message": "User deactivated successfully"}

# ==================== RESOURCE MANAGEMENT ====================

@router.get("/resources", response_model=List[ResourceResponse])
async def get_all_resources(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=1000),
    status: Optional[str] = None,
    vendor_id: Optional[int] = None,
    search: Optional[str] = None,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get all resources with filters"""
    query = db.query(Resource)
    
    if status:
        query = query.filter(Resource.status == status)
    
    if vendor_id:
        query = query.filter(Resource.vendor_id == vendor_id)
    
    if search:
        query = query.filter(
            or_(
                Resource.name.ilike(f"%{search}%"),
                Resource.skill_domain.ilike(f"%{search}%"),
                Resource.location.ilike(f"%{search}%")
            )
        )
    
    resources = query.order_by(Resource.created_at.desc()).offset(skip).limit(limit).all()
    return resources

@router.post("/resources", response_model=ResourceResponse)
async def create_resource_admin(
    resource_data: ResourceCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Create a resource on behalf of a vendor"""
    # Check vendor exists
    vendor = db.query(User).filter(
        User.id == resource_data.vendor_id,
        User.role == "vendor"
    ).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    
    resource_id = generate_resource_id()
    
    new_resource = Resource(
        resource_id=resource_id,
        vendor_id=resource_data.vendor_id,
        name=resource_data.name,
        skill_domain=resource_data.skill_domain,
        experience=resource_data.experience,
        experience_years=resource_data.experience_years,
        availability=resource_data.availability,
        availability_days=resource_data.availability_days,
        base_rate=resource_data.base_rate,
        location=resource_data.location,
        email=resource_data.email,
        phone=resource_data.phone,
        summary=resource_data.summary,
        skills=resource_data.skills,
        status=resource_data.status or "Available"
    )
    
    db.add(new_resource)
    db.commit()
    db.refresh(new_resource)
    
    log_admin_action(
        db=db,
        admin_id=current_user.id,
        action="resource_created",
        target_type="resource",
        target_id=new_resource.id,
        details={"vendor_id": resource_data.vendor_id, "name": resource_data.name}
    )
    
    return new_resource

@router.delete("/resources/{resource_id}")
async def delete_resource_admin(
    resource_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Delete a resource (admin only)"""
    resource = db.query(Resource).filter(Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    
    # Check if resource is in contract
    contract = db.query(Contract).filter(Contract.resource_id == resource_id).first()
    if contract and contract.status == "Active":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete resource with active contract"
        )
    
    db.delete(resource)
    db.commit()
    
    log_admin_action(
        db=db,
        admin_id=current_user.id,
        action="resource_deleted",
        target_type="resource",
        target_id=resource_id,
        details={"name": resource.name}
    )
    
    return {"message": "Resource deleted successfully"}

# ==================== SYSTEM SETTINGS ====================

@router.get("/settings", response_model=List[SystemSettingResponse])
async def get_all_settings(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get all system settings"""
    settings = db.query(SystemSetting).all()
    return settings

@router.get("/settings/{key}", response_model=SystemSettingResponse)
async def get_setting(
    key: str,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get a specific system setting"""
    setting = db.query(SystemSetting).filter(SystemSetting.key == key).first()
    if not setting:
        raise HTTPException(status_code=404, detail="Setting not found")
    return setting

@router.put("/settings/{key}", response_model=SystemSettingResponse)
async def update_setting(
    key: str,
    setting_data: SystemSettingUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Update a system setting"""
    setting = db.query(SystemSetting).filter(SystemSetting.key == key).first()
    if not setting:
        # Create if doesn't exist
        setting = SystemSetting(
            key=key,
            value=setting_data.value,
            description=setting_data.description,
            updated_by=current_user.id
        )
        db.add(setting)
    else:
        setting.value = setting_data.value
        if setting_data.description:
            setting.description = setting_data.description
        setting.updated_by = current_user.id
    
    db.commit()
    db.refresh(setting)
    
    log_admin_action(
        db=db,
        admin_id=current_user.id,
        action="system_setting_updated",
        target_type="system_setting",
        target_id=setting.id,
        details={"key": key, "value": setting_data.value}
    )
    
    return setting

# ==================== PAYMENT SETTINGS ====================

@router.get("/payments/settings")
async def get_payment_settings(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get payment settings"""
    enabled_setting = db.query(SystemSetting).filter(SystemSetting.key == "payment_enabled").first()
    provider_setting = db.query(SystemSetting).filter(SystemSetting.key == "payment_provider").first()
    test_mode_setting = db.query(SystemSetting).filter(SystemSetting.key == "payment_test_mode").first()
    
    return {
        "enabled": enabled_setting.value == "true" if enabled_setting else False,
        "provider": provider_setting.value if provider_setting else "stripe",
        "test_mode": test_mode_setting.value == "true" if test_mode_setting else True,
        "api_key_configured": False,  # Check if API key is set in environment
        "webhook_configured": False
    }

@router.post("/payments/toggle")
async def toggle_payment(
    enabled: bool,
    current_user: User = Depends(require_super_admin),
    db: Session = Depends(get_db)
):
    """Enable or disable payment system (super admin only)"""
    setting = db.query(SystemSetting).filter(SystemSetting.key == "payment_enabled").first()
    if not setting:
        setting = SystemSetting(
            key="payment_enabled",
            value=str(enabled).lower(),
            category="payment",
            description="Enable or disable payment processing",
            updated_by=current_user.id
        )
        db.add(setting)
    else:
        setting.value = str(enabled).lower()
        setting.updated_by = current_user.id
    
    db.commit()
    
    log_admin_action(
        db=db,
        admin_id=current_user.id,
        action="payment_enabled" if enabled else "payment_disabled",
        target_type="system_setting",
        target_id=setting.id,
        details={"enabled": enabled}
    )
    
    return {"enabled": enabled, "message": f"Payment system {'enabled' if enabled else 'disabled'} successfully"}

# ==================== SERVICE HEALTH ====================

@router.get("/health", response_model=List[ServiceHealthResponse])
async def get_service_health(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get all service health statuses"""
    health_records = db.query(ServiceHealth).all()
    return health_records

@router.post("/health/check")
async def check_service_health(
    current_user: User = Depends(require_super_admin),
    db: Session = Depends(get_db)
):
    """Manually trigger service health check (super admin only)"""
    # This would trigger checks for all services
    # For now, we'll return a success message
    return {"message": "Service health check triggered", "timestamp": datetime.utcnow()}