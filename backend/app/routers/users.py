# app/routers/users.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database import get_db
from app.models import User
from app.schemas import UserResponse, UserUpdate
from app.dependencies import get_current_user

router = APIRouter(prefix="/users", tags=["Users"])

# Add this schema for profile picture
class ProfilePictureUpdate(BaseModel):
    profile_picture: str

@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=UserResponse)
def update_current_user(
    update_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    update_dict = update_data.model_dump(exclude_unset=True)
    
    for field, value in update_dict.items():
        if value is not None:
            setattr(current_user, field, value)
    
    db.commit()
    db.refresh(current_user)
    return current_user

@router.put("/me/profile-picture")
def update_profile_picture(
    data: ProfilePictureUpdate,  # Change this to accept JSON body
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Validate base64 image
    if not data.profile_picture or not data.profile_picture.startswith('data:image/'):
        raise HTTPException(status_code=400, detail="Invalid image format")
    
    # Check file size (approximate - base64 string length)
    if len(data.profile_picture) > 5 * 1024 * 1024:  # ~5MB for base64
        raise HTTPException(status_code=400, detail="Image too large (max 5MB)")
    
    current_user.profile_picture = data.profile_picture
    db.commit()
    db.refresh(current_user)
    
    return {"message": "Profile picture updated successfully"}

@router.delete("/me/profile-picture")
def delete_profile_picture(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    current_user.profile_picture = None
    db.commit()
    
    return {"message": "Profile picture removed successfully"}

@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.id != user_id and current_user.role.value not in ["admin"]:
        raise HTTPException(status_code=403, detail="Not authorized to view this user")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user