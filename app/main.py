from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.database import Base, engine
from app.models.user import User
from app.models.document import Document

from app.routes.auth import router as auth_router
from app.routes.documents import router as document_router
from app.routes.study import router as study_router
from app.routes.dashboard import router as dashboard_router

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Student Companion",
    description="AI-powered study and career assistant",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(document_router)
app.include_router(study_router)
app.include_router(dashboard_router)


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