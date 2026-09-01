from fastapi import FastAPI

from app.core.database import Base, engine
from app.models.user import User
from app.routes.auth import router as auth_router


Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="AI Student Companion",
    description="AI-powered study and career assistant",
    version="1.0.0"
)


app.include_router(auth_router)


@app.get("/")
def root():
    return {
        "message": "AI Student Companion API is running 🚀"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }