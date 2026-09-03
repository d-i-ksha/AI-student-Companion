from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.document import Document
from app.models.user import User

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


@router.get("/")
def get_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    documents = db.query(Document).filter(
        Document.user_id == current_user.id
    ).all()

    return {
        "user": {
            "id": current_user.id,
            "name": current_user.name,
            "email": current_user.email
        },
        "stats": {
            "total_documents": len(documents)
        },
        "recent_documents": [
            {
                "id": document.id,
                "filename": document.filename
            }
            for document in documents[-5:]
        ]
    }