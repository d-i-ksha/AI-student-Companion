from fastapi import FastAPI

from app.core.database import Base, engine
from app.models.user import User
from app.models.document import Document

from app.routes.auth import router as auth_router
from app.routes.documents import router as document_router
from app.routes.study import router as study_router

Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="AI Student Companion",
    description="AI-powered study and career assistant",
    version="1.0.0"
)


app.include_router(auth_router)

app.include_router(document_router)

app.include_router(study_router)

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