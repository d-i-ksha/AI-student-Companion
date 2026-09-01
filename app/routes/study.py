from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.core.database import get_db
from app.models.document import Document
from app.services.ai_service import (
    generate_summary,
    generate_questions,
    generate_quiz,
    answer_question
)


router = APIRouter(
    prefix="/study",
    tags=["Study Assistant"]
)


class QuestionRequest(BaseModel):
    question: str


# =========================
# AI SUMMARY
# =========================

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


# =========================
# AI QUESTION GENERATOR
# =========================

@router.post("/{document_id}/questions")
def create_questions(
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

    # Make sure text exists
    if not document.extracted_text:
        raise HTTPException(
            status_code=400,
            detail="No text found in this document"
        )

    # Generate questions using Gemini
    questions = generate_questions(
        document.extracted_text
    )

    return {
        "document_id": document.id,
        "filename": document.filename,
        "questions": questions
    }


# =========================
# AI QUIZ GENERATOR
# =========================

@router.post("/{document_id}/quiz")
def create_quiz(
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

    # Make sure text exists
    if not document.extracted_text:
        raise HTTPException(
            status_code=400,
            detail="No text found in this document"
        )

    # Generate quiz
    quiz = generate_quiz(
        document.extracted_text
    )

    return {
        "document_id": document.id,
        "filename": document.filename,
        "quiz": quiz
    }


# =========================
# ASK YOUR NOTES
# =========================

@router.post("/{document_id}/ask")
def ask_question(
    document_id: int,
    request: QuestionRequest,
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

    # Make sure text exists
    if not document.extracted_text:
        raise HTTPException(
            status_code=400,
            detail="No text found in this document"
        )

    # Ask Gemini
    answer = answer_question(
        document.extracted_text,
        request.question
    )

    return {
        "document_id": document.id,
        "filename": document.filename,
        "question": request.question,
        "answer": answer
    }