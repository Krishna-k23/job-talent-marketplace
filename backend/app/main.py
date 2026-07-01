from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from fastapi.staticfiles import StaticFiles
from app.middleware.middleware import validate_user_role
from app.routers import auth, users, requirements, resources, contracts, billing, dashboard, notifications, messages, subscriptions, analytics, admin, superadmin
import os

# Create uploads directory if it doesn't exist
os.makedirs("uploads/resumes", exist_ok=True)

Base.metadata.create_all(bind=engine)

app = FastAPI(title="BenchAstra API", version="1.0.0", redirect_slashes=False)

# Configure CORS - Allow all for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "https://*.ngrok-free.dev",
        "https://*.ngrok-free.app",
    ],
    allow_origin_regex=r"https://.*\.(ngrok-free\.app|ngrok\.io|ngrok\.app)",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Mount static files BEFORE including routers
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.middleware("http")
async def role_validation_middleware(request: Request, call_next):
    return await validate_user_role(request, call_next)

# Include routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(requirements.router)
app.include_router(resources.router)
app.include_router(contracts.router)
app.include_router(billing.router)
app.include_router(dashboard.router)
app.include_router(notifications.router)
app.include_router(messages.router)
app.include_router(subscriptions.router)
app.include_router(analytics.router)
app.include_router(admin.router)  
app.include_router(superadmin.router)

@app.get("/")
def root():
    return {"message": "BenchAstra API", "version": "1.0.0"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}