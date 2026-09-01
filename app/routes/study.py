from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.document import Document
from app.services.ai_service import generate_summary


router = APIRouter(
    prefix="/study",
    tags=["Study Assistant"]
)


@router.post("/{document_id}/summary")
def create_summary(
    document_id: int,
    db: Session = Depends(get_db)
):
    # Find document
    document = db.query(Document).filter(
        Document.id == document_id
    ).first()

    if not document:
        raise HTTPException(
            status_code=404,
            detail="Document not found"
        )

    # Make sure text was extracted
    if not document.extracted_text:
        raise HTTPException(
            status_code=400,
            detail="No text found in this document"
        )

    # Send text to Gemini
    summary = generate_summary(
        document.extracted_text
    )

    return {
        "document_id": document.id,
        "filename": document.filename,
        "summary": summary
    }