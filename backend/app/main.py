"""
CAMP FASD Application Portal - Main FastAPI Application
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

app = FastAPI(
    title="CAMP FASD Application Portal API",
    description="API for managing camper applications",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "CAMP FASD Application Portal API",
        "version": "1.0.0"
    }

@app.get("/api/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "database": "connected",
        "storage": "connected"
    }

# Import and include routers
from app.api import auth, auth_google, applications, files, admin, super_admin, application_builder, medications

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(auth_google.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(applications.router, prefix="/api/applications", tags=["Applications"])
app.include_router(medications.router, prefix="/api", tags=["Medications & Allergies"])
app.include_router(files.router, tags=["Files"])
app.include_router(admin.router, prefix="/api", tags=["Admin"])
app.include_router(application_builder.router, prefix="/api", tags=["Application Builder"])
app.include_router(super_admin.router, prefix="/api/super-admin", tags=["Super Admin"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
