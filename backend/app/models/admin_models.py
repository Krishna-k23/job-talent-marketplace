from sqlalchemy import Column, Integer, String, DateTime, Boolean, Float, Text, ForeignKey, JSON, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base
import enum

class AdminLog(Base):
    """Admin action logs"""
    __tablename__ = "admin_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    admin_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    action = Column(String(100), nullable=False)
    target_type = Column(String(50))  # user, resource, requirement, etc.
    target_id = Column(Integer)
    details = Column(JSON)
    ip_address = Column(String(45))
    user_agent = Column(String(255))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    admin = relationship("User", foreign_keys=[admin_id])

class SystemSetting(Base):
    """System-wide settings"""
    __tablename__ = "system_settings"
    
    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(100), unique=True, nullable=False)
    value = Column(Text)
    category = Column(String(50))
    description = Column(Text)
    is_public = Column(Boolean, default=False)
    updated_by = Column(Integer, ForeignKey("users.id"))
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class UserActivityLog(Base):
    """User activity tracking"""
    __tablename__ = "user_activity_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    activity_type = Column(String(50))  # login, logout, created_requirement, etc.
    activity_metadata = Column(JSON)  # RENAMED from 'metadata' to 'activity_metadata'
    ip_address = Column(String(45))
    user_agent = Column(String(255))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", foreign_keys=[user_id])

class ServiceHealth(Base):
    """Service health monitoring"""
    __tablename__ = "service_health"
    
    id = Column(Integer, primary_key=True, index=True)
    service_name = Column(String(100), nullable=False)
    status = Column(String(20), default="healthy")  # healthy, degraded, down
    response_time = Column(Float, default=0.0)  # in milliseconds
    error_rate = Column(Float, default=0.0)
    uptime_percentage = Column(Float, default=99.9)  # ADD THIS COLUMN
    last_check = Column(DateTime(timezone=True), server_default=func.now())
    details = Column(JSON, default={})
    created_at = Column(DateTime(timezone=True), server_default=func.now())