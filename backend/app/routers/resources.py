# app/routers/resources.py - Updated with file upload support
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import Optional, List
from app.database import get_db
from app.models import Contract, User, Resource, Match, Requirement
from app.schemas import ResourceCreate, ResourceUpdate, ResourceResponse
from app.dependencies import get_current_user, get_current_vendor
from app.utils.helpers import generate_resource_id
import shutil
import os
from datetime import datetime
import uuid

router = APIRouter(prefix="/resources", tags=["Resources"])

# Ensure upload directory exists
UPLOAD_DIR = "uploads/resumes"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.get("/", response_model=List[ResourceResponse])
def get_resources(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status: Optional[str] = None,
    search: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Both clients and vendors can view resources"""
    query = db.query(Resource)
    
    if current_user.role == "vendor":
        query = query.filter(Resource.vendor_id == current_user.id)
    
    if status:
        query = query.filter(Resource.status == status)
    
    if search:
        from sqlalchemy import func
        query = query.filter(
            (Resource.name.ilike(f"%{search}%")) |
            (Resource.skill_domain.ilike(f"%{search}%")) |
            (Resource.location.ilike(f"%{search}%")) |
            (func.array_to_string(Resource.skills, ',').ilike(f"%{search}%"))
        )
    
    resources = query.order_by(Resource.created_at.desc()).offset(skip).limit(limit).all()
    return resources

@router.get("/{resource_id}", response_model=ResourceResponse)
def get_resource(
    resource_id: int, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    resource = db.query(Resource).filter(Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    
    if current_user.role == "vendor" and resource.vendor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this resource")
    
    return resource

@router.post("/", response_model=ResourceResponse)
async def create_resource(
    name: str = Form(...),
    skill_domain: str = Form(...),
    experience: str = Form(...),
    experience_years: int = Form(...),
    availability: str = Form(...),
    availability_days: int = Form(0),
    base_rate: float = Form(...),
    location: str = Form(...),
    email: str = Form(""),
    phone: str = Form(""),
    summary: str = Form(""),
    skills: str = Form("[]"),  # JSON string
    status: str = Form("Available"),
    resume: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_vendor),
    db: Session = Depends(get_db)
):
    import json
    
    resource_id = generate_resource_id()
    
    # Parse skills from JSON string
    try:
        skills_list = json.loads(skills) if skills else []
    except:
        skills_list = []
    
    # Handle resume upload
    resume_url = None
    if resume and resume.filename:
        # Generate unique filename
        file_extension = os.path.splitext(resume.filename)[1]
        unique_filename = f"{uuid.uuid4()}_{datetime.now().strftime('%Y%m%d')}{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        
        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(resume.file, buffer)
        
        resume_url = f"/uploads/resumes/{unique_filename}"
    
    db_resource = Resource(
        resource_id=resource_id,
        vendor_id=current_user.id,
        name=name,
        skill_domain=skill_domain,
        experience=experience,
        experience_years=experience_years,
        availability=availability,
        availability_days=availability_days,
        base_rate=base_rate,
        location=location,
        email=email,
        phone=phone,
        summary=summary,
        resume_url=resume_url,
        skills=skills_list,
        status=status
    )
    
    db.add(db_resource)
    db.commit()
    db.refresh(db_resource)
    
    # Match with requirements
    match_with_requirements(db_resource, db)
    
    return db_resource

@router.put("/{resource_id}", response_model=ResourceResponse)
async def update_resource(
    resource_id: int,
    name: str = Form(...),
    skill_domain: str = Form(...),
    experience: str = Form(...),
    experience_years: int = Form(...),
    availability: str = Form(...),
    availability_days: int = Form(0),
    base_rate: float = Form(...),
    location: str = Form(...),
    email: str = Form(""),
    phone: str = Form(""),
    summary: str = Form(""),
    skills: str = Form("[]"),
    status: str = Form("Available"),
    resume: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_vendor),
    db: Session = Depends(get_db)
):
    import json
    
    db_resource = db.query(Resource).filter(Resource.id == resource_id).first()
    if not db_resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    
    if db_resource.vendor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this resource")
    
    # Parse skills from JSON string
    try:
        skills_list = json.loads(skills) if skills else []
    except:
        skills_list = []
    
    # Handle resume upload
    resume_url = db_resource.resume_url
    if resume and resume.filename:
        # Delete old resume if exists
        if resume_url:
            old_file_path = os.path.join(UPLOAD_DIR, os.path.basename(resume_url))
            if os.path.exists(old_file_path):
                os.remove(old_file_path)
        
        # Save new resume
        file_extension = os.path.splitext(resume.filename)[1]
        unique_filename = f"{uuid.uuid4()}_{datetime.now().strftime('%Y%m%d')}{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(resume.file, buffer)
        
        resume_url = f"/uploads/resumes/{unique_filename}"
    
    # Update fields
    db_resource.name = name
    db_resource.skill_domain = skill_domain
    db_resource.experience = experience
    db_resource.experience_years = experience_years
    db_resource.availability = availability
    db_resource.availability_days = availability_days
    db_resource.base_rate = base_rate
    db_resource.location = location
    db_resource.email = email
    db_resource.phone = phone
    db_resource.summary = summary
    db_resource.resume_url = resume_url
    db_resource.skills = skills_list
    db_resource.status = status
    
    db.commit()
    db.refresh(db_resource)
    return db_resource

@router.delete("/{resource_id}")
def delete_resource(
    resource_id: int,
    current_user: User = Depends(get_current_vendor),
    db: Session = Depends(get_db)
):
    try:
        db_resource = db.query(Resource).filter(Resource.id == resource_id).first()
        if not db_resource:
            raise HTTPException(status_code=404, detail="Resource not found")
        
        if db_resource.vendor_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized to delete this resource")
        
        # Delete resume file if exists
        if db_resource.resume_url:
            file_path = os.path.join(UPLOAD_DIR, os.path.basename(db_resource.resume_url))
            if os.path.exists(file_path):
                os.remove(file_path)
        
        db.query(Match).filter(Match.resource_id == resource_id).delete()
        db.query(Contract).filter(Contract.resource_id == resource_id).delete()
        db.delete(db_resource)
        db.commit()
        
        return {"message": "Resource deleted successfully", "success": True}
    except Exception as e:
        db.rollback()
        print(f"Error deleting resource: {e}")
        raise HTTPException(status_code=500, detail=f"Error deleting resource: {str(e)}")

def match_with_requirements(resource: Resource, db: Session):
    from app.routers.requirements import calculate_match_score
    
    requirements = db.query(Requirement).filter(Requirement.status == "Open").all()
    
    for req in requirements:
        score = calculate_match_score(req, resource)
        if score >= 70:
            existing_match = db.query(Match).filter(
                Match.requirement_id == req.id,
                Match.resource_id == resource.id
            ).first()
            
            if not existing_match:
                match = Match(
                    requirement_id=req.id,
                    resource_id=resource.id,
                    match_score=score
                )
                db.add(match)
    
    db.commit()