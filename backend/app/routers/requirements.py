from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from app.database import get_db
from app.models import User, Requirement, Resource, Match
from app.schemas import RequirementCreate, RequirementUpdate, RequirementResponse, MatchResponse
from app.dependencies import get_current_user, get_current_client
from app.utils.helpers import generate_requirement_id

router = APIRouter(prefix="/requirements", tags=["Requirements"])

@router.get("/", response_model=List[RequirementResponse])
def get_requirements(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Clients see their own requirements, Vendors see all open requirements"""
    query = db.query(Requirement)
    
    if current_user.role == "client":
        query = query.filter(Requirement.client_id == current_user.id)
    # Vendors can see all requirements for matching
    
    if status and status.lower() != "all":
        # DB stores "Open"/"Closed"; frontend sends "open"/"closed" or title-case
        from sqlalchemy import func as sqlfunc
        query = query.filter(sqlfunc.lower(Requirement.status) == status.lower())
    
    requirements = query.order_by(Requirement.created_at.desc()).offset(skip).limit(limit).all()
    
    for req in requirements:
        matches_count = db.query(Match).filter(Match.requirement_id == req.id).count()
        req.matches_count = matches_count
    
    return requirements

@router.get("/{requirement_id}", response_model=RequirementResponse)
def get_requirement(
    requirement_id: int, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    requirement = db.query(Requirement).filter(Requirement.id == requirement_id).first()
    if not requirement:
        raise HTTPException(status_code=404, detail="Requirement not found")
    
    if current_user.role == "client" and requirement.client_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this requirement")
    
    matches_count = db.query(Match).filter(Match.requirement_id == requirement_id).count()
    requirement.matches_count = matches_count
    
    return requirement

@router.post("/", response_model=RequirementResponse)
def create_requirement(
    requirement: RequirementCreate,
    current_user: User = Depends(get_current_client),
    db: Session = Depends(get_db)
):
    requirement_id = generate_requirement_id()
    
    db_requirement = Requirement(
        requirement_id=requirement_id,
        client_id=current_user.id,
        role=requirement.role,
        experience_min=requirement.experience_min,
        experience_max=requirement.experience_max,
        positions=requirement.positions,
        skills=requirement.skills,
        must_have_skills=requirement.must_have_skills,
        good_to_have_skills=requirement.good_to_have_skills,
        budget_min=requirement.budget_min,
        budget_max=requirement.budget_max,
        duration=requirement.duration,
        work_mode=requirement.work_mode,
        start_date=requirement.start_date,
        custom_start_date=requirement.custom_start_date,
        location=requirement.location,
        description=requirement.description,
        status="Open"
    )
    
    db.add(db_requirement)
    db.commit()
    db.refresh(db_requirement)
    
    match_resources(db_requirement, db)
    
    matches_count = db.query(Match).filter(Match.requirement_id == db_requirement.id).count()
    db_requirement.matches_count = matches_count
    
    return db_requirement

@router.put("/{requirement_id}", response_model=RequirementResponse)
def update_requirement(
    requirement_id: int,
    requirement: RequirementUpdate,
    current_user: User = Depends(get_current_client),
    db: Session = Depends(get_db)
):
    db_requirement = db.query(Requirement).filter(Requirement.id == requirement_id).first()
    if not db_requirement:
        raise HTTPException(status_code=404, detail="Requirement not found")
    
    if db_requirement.client_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this requirement")
    
    update_data = requirement.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_requirement, field, value)
    
    db.commit()
    db.refresh(db_requirement)
    
    matches_count = db.query(Match).filter(Match.requirement_id == requirement_id).count()
    db_requirement.matches_count = matches_count
    
    return db_requirement

@router.delete("/{requirement_id}")
def delete_requirement(
    requirement_id: int,
    current_user: User = Depends(get_current_client),
    db: Session = Depends(get_db)
):
    db_requirement = db.query(Requirement).filter(Requirement.id == requirement_id).first()
    if not db_requirement:
        raise HTTPException(status_code=404, detail="Requirement not found")
    
    if db_requirement.client_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this requirement")
    
    db.query(Match).filter(Match.requirement_id == requirement_id).delete()
    db.delete(db_requirement)
    db.commit()
    
    return {"message": "Requirement deleted successfully"}

@router.get("/{requirement_id}/matches", response_model=List[MatchResponse])
def get_requirement_matches(
    requirement_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    requirement = db.query(Requirement).filter(Requirement.id == requirement_id).first()
    if not requirement:
        raise HTTPException(status_code=404, detail="Requirement not found")
    
    matches = db.query(Match).filter(Match.requirement_id == requirement_id).all()
    
    result = []
    for match in matches:
        resource = db.query(Resource).filter(Resource.id == match.resource_id).first()
        if resource:
            result.append(MatchResponse(
                id=match.id,
                requirement_id=requirement.requirement_id,
                resource_id=resource.resource_id,
                match_score=match.match_score,
                status=match.status,
                resource_name=resource.name,
                resource_skills=resource.skills or [],
                resource_experience=resource.experience or "",
                resource_availability=resource.availability or "",
                resource_rate=resource.base_rate or 0,
                requirement_role=requirement.role
            ))
    
    return result

@router.put("/matches/{match_id}/status")
def update_match_status(
    match_id: int,
    status: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    match = db.query(Match).filter(Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    match.status = status
    db.commit()
    
    return {"message": f"Match status updated to {status}"}

def match_resources(requirement: Requirement, db: Session):
    resources = db.query(Resource).filter(Resource.status == "Available").all()
    
    for resource in resources:
        score = calculate_match_score(requirement, resource)
        if score >= 70:
            existing_match = db.query(Match).filter(
                Match.requirement_id == requirement.id,
                Match.resource_id == resource.id
            ).first()
            
            if not existing_match:
                match = Match(
                    requirement_id=requirement.id,
                    resource_id=resource.id,
                    match_score=score
                )
                db.add(match)
    
    db.commit()

def calculate_match_score(requirement: Requirement, resource: Resource) -> int:
    score = 0
    
    required_skills = set(requirement.skills or [])
    resource_skills = set(resource.skills or [])
    
    if required_skills and resource_skills:
        matched_skills = required_skills.intersection(resource_skills)
        skill_score = (len(matched_skills) / len(required_skills)) * 60
        score += skill_score
    elif required_skills:
        score += 0
    else:
        score += 30
    
    if requirement.experience_min and resource.experience_years:
        exp_years = resource.experience_years
        if exp_years >= requirement.experience_min:
            if requirement.experience_max:
                if exp_years <= requirement.experience_max:
                    score += 30
                else:
                    score += 20
            else:
                score += 30
        elif exp_years >= requirement.experience_min * 0.8:
            score += 15
    
    if resource.availability == "Immediate":
        score += 10
    elif resource.availability_days and resource.availability_days <= 15:
        score += 5
    
    return int(score)