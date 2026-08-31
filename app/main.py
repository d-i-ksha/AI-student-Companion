from fastapi import FastAPI

from app.core.database import Base, engine
from app.models.user import User


Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="AI Student Companion",
    description="AI-powered study and career assistant",
    version="1.0.0"
)


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