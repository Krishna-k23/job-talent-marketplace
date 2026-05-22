from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.database import get_db
from app.models import User, OTP
from app.schemas import LoginRequest, Token, UserCreate, UserResponse, OTPRequest, OTPVerifyRequest, PasswordResetRequest
from app.auth import verify_password, get_password_hash, create_access_token, create_refresh_token
from app.utils.email_service import generate_otp, send_otp_email

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=Token)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()
    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account is deactivated",
        )
    
    access_token = create_access_token(data={"sub": user.email, "role": user.role})
    refresh_token = create_refresh_token(data={"sub": user.email})
    
    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}

@router.post("/signup", response_model=UserResponse)
def signup(request: UserCreate, db: Session = Depends(get_db)):
    # Check if user exists
    existing_user = db.query(User).filter(User.email == request.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    
    # Hash password with error handling
    try:
        hashed_password = get_password_hash(request.password)
    except Exception as e:
        print(f"Password hashing error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error processing password",
        )
    
    # Create user
    user = User(
        email=request.email,
        hashed_password=hashed_password,
        full_name=request.full_name,
        phone=request.phone,
        role=request.role.value if hasattr(request.role, 'value') else request.role,
        company_id=None,  # Will create company separately if needed
        is_active=True,
        is_verified=False,
        vendor_name=request.vendor_name
    )
    
    # Create company if provided
    if request.company_name:
        from app.models import Company
        company = Company(
            name=request.company_name,
            website=request.website,
            industry=request.industry,
            size=request.company_size
        )
        db.add(company)
        db.flush()
        user.company_id = company.id
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Send OTP for verification
    otp_code = generate_otp()
    expires_at = datetime.utcnow() + timedelta(minutes=10)
    otp = OTP(
        email=user.email, 
        otp=otp_code, 
        purpose="verification", 
        expires_at=expires_at
    )
    db.add(otp)
    db.commit()
    
    send_otp_email(user.email, otp_code, "verification")
    
    return user

@router.post("/send-otp")
def send_otp(request: OTPRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    otp_code = generate_otp()
    expires_at = datetime.utcnow() + timedelta(minutes=10)
    
    # Invalidate old OTPs
    db.query(OTP).filter(
        OTP.email == request.email, 
        OTP.is_used == False
    ).update({"is_used": True})
    
    otp = OTP(
        email=request.email, 
        otp=otp_code, 
        purpose="password_reset", 
        expires_at=expires_at
    )
    db.add(otp)
    db.commit()
    
    send_otp_email(request.email, otp_code, "password_reset")
    
    return {"message": "OTP sent successfully"}

@router.post("/verify-otp")
def verify_otp(request: OTPVerifyRequest, db: Session = Depends(get_db)):
    otp_record = db.query(OTP).filter(
        OTP.email == request.email,
        OTP.otp == request.otp,
        OTP.is_used == False,
        OTP.expires_at > datetime.utcnow()
    ).first()
    
    if not otp_record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP",
        )
    
    otp_record.is_used = True
    db.commit()
    
    # If verification OTP, verify user
    if otp_record.purpose == "verification":
        user = db.query(User).filter(User.email == request.email).first()
        if user:
            user.is_verified = True
            db.commit()
    
    return {"message": "OTP verified successfully"}

@router.post("/resend-otp")
def resend_otp(request: OTPRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    # Generate new OTP
    otp_code = generate_otp()
    expires_at = datetime.utcnow() + timedelta(minutes=10)
    
    # Invalidate old OTPs
    db.query(OTP).filter(
        OTP.email == request.email, 
        OTP.is_used == False,
        OTP.purpose == "verification"
    ).update({"is_used": True})
    
    # Create new OTP
    otp = OTP(
        email=request.email, 
        otp=otp_code, 
        purpose="verification", 
        expires_at=expires_at
    )
    db.add(otp)
    db.commit()
    
    # Send OTP via email
    send_otp_email(request.email, otp_code, "verification")
    
    return {"message": "OTP resent successfully"}

@router.post("/reset-password")
def reset_password(request: PasswordResetRequest, db: Session = Depends(get_db)):
    # Verify OTP
    otp_record = db.query(OTP).filter(
        OTP.email == request.email,
        OTP.otp == request.otp,
        OTP.is_used == False,
        OTP.expires_at > datetime.utcnow(),
        OTP.purpose == "password_reset"
    ).first()
    
    if not otp_record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP",
        )
    
    otp_record.is_used = True
    db.commit()
    
    # Update password
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    user.hashed_password = get_password_hash(request.new_password)
    db.commit()
    
    return {"message": "Password reset successfully"}

@router.post("/refresh")
def refresh_token(refresh_token: str, db: Session = Depends(get_db)):
    from app.auth import verify_token
    
    try:
        payload = verify_token(refresh_token)
        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type",
            )
        
        email = payload.get("sub")
        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
            )
        
        new_access_token = create_access_token(data={"sub": user.email, "role": user.role})
        new_refresh_token = create_refresh_token(data={"sub": user.email})
        
        return {
            "access_token": new_access_token,
            "refresh_token": new_refresh_token,
            "token_type": "bearer"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )