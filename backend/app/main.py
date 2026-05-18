from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import auth, users, requirements, resources, contracts, billing, dashboard, notifications, messages, subscriptions, analytics

Base.metadata.create_all(bind=engine)

app = FastAPI(title="BenchBridge API", version="1.0.0", redirect_slashes=False)

# Configure CORS - Allow all for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173", "http://127.0.0.1:5174", "http://192.168.31.94:5173"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

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

@app.get("/")
def root():
    return {"message": "BenchBridge API", "version": "1.0.0"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}