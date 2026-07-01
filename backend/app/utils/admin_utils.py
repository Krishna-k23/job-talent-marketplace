from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from datetime import datetime, timedelta
from app.models.models import User, Requirement, Resource, Contract, Company
from app.models.admin_models import AdminLog, UserActivityLog
from typing import List, Dict, Any

def log_admin_action(db: Session, admin_id: int, action: str, target_type: str = None, target_id: int = None, details: Dict = None):
    """Log admin action"""
    log = AdminLog(
        admin_id=admin_id,
        action=action,
        target_type=target_type,
        target_id=target_id,
        details=details or {}
    )
    db.add(log)
    db.commit()
    return log

def get_analytics_overview(db: Session):
    """Get analytics overview"""
    total_users = db.query(User).count()
    total_clients = db.query(User).filter(User.role == "client").count()
    total_vendors = db.query(User).filter(User.role == "vendor").count()
    total_admins = db.query(User).filter(User.role.in_(["admin", "super_admin"])).count()
    total_requirements = db.query(Requirement).count()
    total_resources = db.query(Resource).count()
    total_contracts = db.query(Contract).count()
    
    # Calculate revenue from contracts
    total_revenue = db.query(func.sum(Contract.rate)).scalar() or 0
    
    # Active users today (based on activity logs)
    today = datetime.utcnow().date()
    active_users_today = db.query(UserActivityLog).filter(
        func.date(UserActivityLog.created_at) == today
    ).distinct(UserActivityLog.user_id).count()
    
    # If no activity logs, use a default
    if active_users_today == 0:
        active_users_today = max(1, total_users // 10)  # Assume 10% active
    
    # New users this week
    week_start = datetime.utcnow() - timedelta(days=7)
    new_users_this_week = db.query(User).filter(User.created_at >= week_start).count()
    
    # Growth percentage (compared to previous week)
    last_week_start = datetime.utcnow() - timedelta(days=14)
    last_week_end = datetime.utcnow() - timedelta(days=7)
    
    last_week_users = db.query(User).filter(
        and_(
            User.created_at >= last_week_start,
            User.created_at < last_week_end
        )
    ).count()
    
    growth_percentage = 0
    if last_week_users > 0:
        growth_percentage = ((new_users_this_week - last_week_users) / last_week_users) * 100
    
    return {
        "total_users": total_users,
        "total_clients": total_clients,
        "total_vendors": total_vendors,
        "total_admins": total_admins,
        "total_requirements": total_requirements,
        "total_resources": total_resources,
        "total_contracts": total_contracts,
        "total_revenue": total_revenue,
        "active_users_today": active_users_today,
        "new_users_this_week": new_users_this_week,
        "growth_percentage": growth_percentage
    }

def get_user_growth_data(db: Session, days: int = 30):
    """Get user growth data for last N days"""
    data = []
    start_date = datetime.utcnow() - timedelta(days=days)
    
    for i in range(days):
        date = start_date + timedelta(days=i)
        date_start = datetime(date.year, date.month, date.day, 0, 0, 0)
        date_end = datetime(date.year, date.month, date.day, 23, 59, 59)
        
        clients = db.query(User).filter(
            and_(
                User.role == "client",
                User.created_at >= date_start,
                User.created_at <= date_end
            )
        ).count()
        
        vendors = db.query(User).filter(
            and_(
                User.role == "vendor",
                User.created_at >= date_start,
                User.created_at <= date_end
            )
        ).count()
        
        total = clients + vendors
        
        data.append({
            "date": date.strftime("%Y-%m-%d"),
            "clients": clients,
            "vendors": vendors,
            "total": total
        })
    
    return data