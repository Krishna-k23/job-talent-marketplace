from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from typing import List, Optional
from datetime import datetime, timedelta
from app.database import get_db
from app.models.models import User, Requirement, Resource, Contract
from app.models.admin_models import AdminLog, SystemSetting, ServiceHealth
from app.schemas.admin_schemas import *
from app.middleware.admin_middleware import require_super_admin
from app.auth import get_password_hash
from app.utils.admin_utils import log_admin_action
import json

router = APIRouter(prefix="/superadmin", tags=["Super Admin"])

# ==================== USER MANAGEMENT (FULL ACCESS) ====================

@router.get("/users", response_model=List[AdminUserResponse])
async def get_all_users_super(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    role: Optional[str] = None,
    search: Optional[str] = None,
    is_active: Optional[bool] = None,
    current_user: User = Depends(require_super_admin),
    db: Session = Depends(get_db)
):
    """Get all users with full access (Super Admin only)"""
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
    
    users = query.order_by(User.created_at.desc()).offset(skip).limit(limit).all()
    
    # Get activity counts for each user
    result = []
    for user in users:
        activity_count = db.query(AdminLog).filter(AdminLog.admin_id == user.id).count()
        user_dict = AdminUserResponse.model_validate(user)
        user_dict.activity_count = activity_count
        result.append(user_dict)
    
    return result

@router.get("/users/{user_id}", response_model=AdminUserResponse)
async def get_user_details_super(
    user_id: int,
    current_user: User = Depends(require_super_admin),
    db: Session = Depends(get_db)
):
    """Get detailed user information (Super Admin only)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/users/{user_id}/deactivate")
async def deactivate_user(
    user_id: int,
    current_user: User = Depends(require_super_admin),
    db: Session = Depends(get_db)
):
    """Deactivate a user (Super Admin only)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot deactivate yourself"
        )
    
    user.is_active = False
    db.commit()
    
    log_admin_action(
        db=db,
        admin_id=current_user.id,
        action="user_deactivated",
        target_type="user",
        target_id=user.id,
        details={"email": user.email, "deactivated_by": current_user.email}
    )
    
    return {"message": f"User {user.email} deactivated successfully"}

@router.put("/users/{user_id}/activate")
async def activate_user(
    user_id: int,
    current_user: User = Depends(require_super_admin),
    db: Session = Depends(get_db)
):
    """Activate a user (Super Admin only)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.is_active = True
    db.commit()
    
    log_admin_action(
        db=db,
        admin_id=current_user.id,
        action="user_activated",
        target_type="user",
        target_id=user.id,
        details={"email": user.email, "activated_by": current_user.email}
    )
    
    return {"message": f"User {user.email} activated successfully"}

@router.put("/users/{user_id}/role")
async def change_user_role(
    user_id: int,
    new_role: str,
    current_user: User = Depends(require_super_admin),
    db: Session = Depends(get_db)
):
    """Change user role (Super Admin only)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot change your own role"
        )
    
    valid_roles = ["client", "vendor", "admin", "super_admin"]
    if new_role not in valid_roles:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid role. Must be one of: {', '.join(valid_roles)}"
        )
    
    old_role = user.role
    user.role = new_role
    
    # If changing to vendor, ensure vendor_name is set
    if new_role == "vendor" and not user.vendor_name:
        user.vendor_name = user.full_name or f"Vendor_{user.id}"
    
    db.commit()
    
    log_admin_action(
        db=db,
        admin_id=current_user.id,
        action="user_role_changed",
        target_type="user",
        target_id=user.id,
        details={
            "email": user.email,
            "old_role": old_role,
            "new_role": new_role,
            "changed_by": current_user.email
        }
    )
    
    return {"message": f"User {user.email} role changed from {old_role} to {new_role}"}

# ==================== SYSTEM MANAGEMENT ====================

@router.get("/system/health", response_model=List[ServiceHealthResponse])
async def get_system_health(
    current_user: User = Depends(require_super_admin),
    db: Session = Depends(get_db)
):
    """Get all service health statuses"""
    health_records = db.query(ServiceHealth).all()
    
    return health_records

@router.post("/system/health/check")
async def trigger_health_check(
    current_user: User = Depends(require_super_admin),
    db: Session = Depends(get_db)
):
    """Manually trigger service health check (Super Admin only)"""
    # This would trigger checks for all services
    # For now, we'll update the timestamp
    for service in db.query(ServiceHealth).all():
        service.last_check = datetime.utcnow()
    db.commit()
    
    log_admin_action(
        db=db,
        admin_id=current_user.id,
        action="health_check_triggered",
        target_type="system",
        details={"triggered_by": current_user.email}
    )
    
    return {"message": "Service health check triggered", "timestamp": datetime.utcnow().isoformat()}

@router.post("/system/health/update")
async def update_service_health(
    service_name: str,
    status: str,
    response_time: float,
    error_rate: float,
    details: Optional[dict] = None,
    current_user: User = Depends(require_super_admin),
    db: Session = Depends(get_db)
):
    """Update service health status (Super Admin only)"""
    valid_statuses = ["healthy", "degraded", "down"]
    if status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
        )
    
    service = db.query(ServiceHealth).filter(ServiceHealth.service_name == service_name).first()
    if not service:
        service = ServiceHealth(
            service_name=service_name,
            status=status,
            response_time=response_time,
            error_rate=error_rate,
            details=details or {},
            last_check=datetime.utcnow()
        )
        db.add(service)
    else:
        service.status = status
        service.response_time = response_time
        service.error_rate = error_rate
        service.details = details or {}
        service.last_check = datetime.utcnow()
    
    db.commit()
    
    log_admin_action(
        db=db,
        admin_id=current_user.id,
        action="service_health_updated",
        target_type="system",
        details={"service": service_name, "status": status}
    )
    
    return {"message": f"Service {service_name} health updated to {status}"}

# ==================== SYSTEM SETTINGS (FULL ACCESS) ====================

@router.get("/settings", response_model=List[SystemSettingResponse])
async def get_all_settings_super(
    current_user: User = Depends(require_super_admin),
    db: Session = Depends(get_db)
):
    """Get all system settings (Super Admin only)"""
    settings = db.query(SystemSetting).all()
    return settings

@router.put("/settings/{key}", response_model=SystemSettingResponse)
async def update_setting_super(
    key: str,
    setting_data: SystemSettingUpdate,
    current_user: User = Depends(require_super_admin),
    db: Session = Depends(get_db)
):
    """Update any system setting (Super Admin only)"""
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

# ==================== PAYMENT MANAGEMENT ====================

@router.get("/payments/settings")
async def get_payment_settings_super(
    current_user: User = Depends(require_super_admin),
    db: Session = Depends(get_db)
):
    """Get payment settings (Super Admin only)"""
    enabled_setting = db.query(SystemSetting).filter(SystemSetting.key == "payment_enabled").first()
    provider_setting = db.query(SystemSetting).filter(SystemSetting.key == "payment_provider").first()
    test_mode_setting = db.query(SystemSetting).filter(SystemSetting.key == "payment_test_mode").first()
    api_key_setting = db.query(SystemSetting).filter(SystemSetting.key == "payment_api_key").first()
    webhook_setting = db.query(SystemSetting).filter(SystemSetting.key == "payment_webhook_url").first()
    
    return {
        "enabled": enabled_setting.value == "true" if enabled_setting else False,
        "provider": provider_setting.value if provider_setting else "stripe",
        "test_mode": test_mode_setting.value == "true" if test_mode_setting else True,
        "api_key_configured": bool(api_key_setting and api_key_setting.value),
        "webhook_configured": bool(webhook_setting and webhook_setting.value),
        "api_key": api_key_setting.value if api_key_setting else None,
        "webhook_url": webhook_setting.value if webhook_setting else None
    }

@router.post("/payments/toggle")
async def toggle_payment_super(
    enabled: bool,
    current_user: User = Depends(require_super_admin),
    db: Session = Depends(get_db)
):
    """Enable or disable payment system (Super Admin only)"""
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

@router.post("/payments/configure")
async def configure_payment(
    provider: str,
    api_key: Optional[str] = None,
    webhook_url: Optional[str] = None,
    test_mode: bool = True,
    current_user: User = Depends(require_super_admin),
    db: Session = Depends(get_db)
):
    """Configure payment system (Super Admin only)"""
    # Update provider
    provider_setting = db.query(SystemSetting).filter(SystemSetting.key == "payment_provider").first()
    if not provider_setting:
        provider_setting = SystemSetting(
            key="payment_provider",
            value=provider,
            category="payment",
            description="Payment provider",
            updated_by=current_user.id
        )
        db.add(provider_setting)
    else:
        provider_setting.value = provider
        provider_setting.updated_by = current_user.id
    
    # Update API key
    if api_key:
        api_key_setting = db.query(SystemSetting).filter(SystemSetting.key == "payment_api_key").first()
        if not api_key_setting:
            api_key_setting = SystemSetting(
                key="payment_api_key",
                value=api_key,
                category="payment",
                description="Payment API Key",
                updated_by=current_user.id
            )
            db.add(api_key_setting)
        else:
            api_key_setting.value = api_key
            api_key_setting.updated_by = current_user.id
    
    # Update webhook URL
    if webhook_url:
        webhook_setting = db.query(SystemSetting).filter(SystemSetting.key == "payment_webhook_url").first()
        if not webhook_setting:
            webhook_setting = SystemSetting(
                key="payment_webhook_url",
                value=webhook_url,
                category="payment",
                description="Payment Webhook URL",
                updated_by=current_user.id
            )
            db.add(webhook_setting)
        else:
            webhook_setting.value = webhook_url
            webhook_setting.updated_by = current_user.id
    
    # Update test mode
    test_mode_setting = db.query(SystemSetting).filter(SystemSetting.key == "payment_test_mode").first()
    if not test_mode_setting:
        test_mode_setting = SystemSetting(
            key="payment_test_mode",
            value=str(test_mode).lower(),
            category="payment",
            description="Payment test mode",
            updated_by=current_user.id
        )
        db.add(test_mode_setting)
    else:
        test_mode_setting.value = str(test_mode).lower()
        test_mode_setting.updated_by = current_user.id
    
    db.commit()
    
    log_admin_action(
        db=db,
        admin_id=current_user.id,
        action="payment_configured",
        target_type="system_setting",
        details={
            "provider": provider,
            "test_mode": test_mode,
            "api_key_configured": bool(api_key),
            "webhook_configured": bool(webhook_url)
        }
    )
    
    return {"message": "Payment configuration updated successfully"}

# ==================== SYSTEM LOGS ====================

@router.get("/logs", response_model=List[AdminLogResponse])
async def get_system_logs(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=500),
    action: Optional[str] = None,
    target_type: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    current_user: User = Depends(require_super_admin),
    db: Session = Depends(get_db)
):
    """Get system logs with filters (Super Admin only)"""
    query = db.query(AdminLog)
    
    if action:
        query = query.filter(AdminLog.action == action)
    
    if target_type:
        query = query.filter(AdminLog.target_type == target_type)
    
    if start_date:
        query = query.filter(AdminLog.created_at >= start_date)
    
    if end_date:
        query = query.filter(AdminLog.created_at <= end_date)
    
    logs = query.order_by(AdminLog.created_at.desc()).offset(skip).limit(limit).all()
    
    result = []
    for log in logs:
        admin = db.query(User).filter(User.id == log.admin_id).first()
        result.append(AdminLogResponse(
            id=log.id,
            admin_id=log.admin_id,
            admin_name=admin.full_name or admin.email if admin else "Unknown",
            action=log.action,
            target_type=log.target_type,
            target_id=log.target_id,
            details=log.details,
            ip_address=log.ip_address,
            created_at=log.created_at
        ))
    
    return result