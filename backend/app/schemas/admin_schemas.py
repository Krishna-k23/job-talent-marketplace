from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

# Admin Enums
class AdminAction(str, Enum):
    USER_CREATED = "user_created"
    USER_UPDATED = "user_updated"
    USER_DELETED = "user_deleted"
    USER_ROLE_CHANGED = "user_role_changed"
    USER_DEACTIVATED = "user_deactivated"
    USER_ACTIVATED = "user_activated"
    RESOURCE_CREATED = "resource_created"
    RESOURCE_UPDATED = "resource_updated"
    RESOURCE_DELETED = "resource_deleted"
    REQUIREMENT_CREATED = "requirement_created"
    REQUIREMENT_UPDATED = "requirement_updated"
    REQUIREMENT_DELETED = "requirement_deleted"
    SYSTEM_SETTING_UPDATED = "system_setting_updated"
    PAYMENT_ENABLED = "payment_enabled"
    PAYMENT_DISABLED = "payment_disabled"

class UserRole(str, Enum):
    CLIENT = "client"
    VENDOR = "vendor"
    ADMIN = "admin"
    SUPER_ADMIN = "super_admin"

# Analytics Schemas
class AnalyticsOverview(BaseModel):
    total_users: int
    total_clients: int
    total_vendors: int
    total_admins: int
    total_requirements: int
    total_resources: int
    total_contracts: int
    total_revenue: float
    active_users_today: int
    new_users_this_week: int
    growth_percentage: float

class UserGrowthData(BaseModel):
    date: str
    clients: int
    vendors: int
    total: int

class RequirementAnalytics(BaseModel):
    by_role: List[Dict[str, Any]]
    by_status: List[Dict[str, Any]]
    weekly_activity: List[Dict[str, Any]]
    monthly_trend: List[Dict[str, Any]]

class VendorAnalytics(BaseModel):
    top_vendors: List[Dict[str, Any]]
    by_location: List[Dict[str, Any]]
    active_vendors: int
    total_resources: int

class ClientAnalytics(BaseModel):
    by_location: List[Dict[str, Any]]
    active_clients: int
    total_requirements: int

# Admin User Management
class AdminUserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    phone: Optional[str] = None
    role: UserRole = UserRole.CLIENT
    vendor_name: Optional[str] = None

class AdminUserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None
    vendor_name: Optional[str] = None
    password: Optional[str] = None

class AdminUserResponse(BaseModel):
    id: int
    email: str
    full_name: Optional[str] = None  # Changed to Optional
    phone: Optional[str] = None
    role: str
    is_active: bool
    is_verified: bool
    vendor_name: Optional[str] = None
    profile_picture: Optional[str] = None
    company_name: Optional[str] = None  # Changed to Optional
    created_at: datetime
    last_login: Optional[datetime] = None  # Already Optional
    activity_count: Optional[int] = 0
    
    class Config:
        from_attributes = True

# System Settings
class SystemSettingResponse(BaseModel):
    key: str
    value: str
    category: str
    description: Optional[str]
    is_public: bool
    updated_at: Optional[datetime]

class SystemSettingUpdate(BaseModel):
    value: str
    description: Optional[str] = None

# Payment Settings
class PaymentSettings(BaseModel):
    enabled: bool
    provider: str = "stripe"
    test_mode: bool = True
    api_key_configured: bool = False
    webhook_configured: bool = False

# Service Health
class ServiceHealthResponse(BaseModel):
    service_name: str
    status: str
    response_time: float
    error_rate: float
    last_check: datetime
    details: Optional[Dict[str, Any]]
    uptime_percentage: Optional[float] = None

# Admin Activity Log
class AdminLogResponse(BaseModel):
    id: int
    admin_id: int
    admin_name: str
    action: str
    target_type: Optional[str]
    target_id: Optional[int]
    details: Optional[Dict[str, Any]]
    ip_address: Optional[str]
    created_at: datetime

# Admin Dashboard Stats
class AdminDashboardStats(BaseModel):
    overview: AnalyticsOverview
    recent_users: List[AdminUserResponse]
    recent_activity: List[AdminLogResponse]
    requirements_by_role: List[Dict[str, Any]]
    user_growth: List[UserGrowthData]
    vendor_by_location: List[Dict[str, Any]]
    service_health: List[ServiceHealthResponse]