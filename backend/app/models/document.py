from sqlalchemy import Column, Integer, String, Text, ForeignKey
from app.core.database import Base


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    extracted_text = Column(Text, nullable=True)

'''Document
├── ID
├── User ID
├── Filename
├── File location
└── Extracted PDF text'''