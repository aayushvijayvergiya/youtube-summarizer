from datetime import datetime

from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.database import Base
from pydantic import BaseModel
from typing import Any

# Request/Response Models
class VideoRequest(BaseModel):
    url: str
    max_length: int = 300
    format_type: str = "paragraph"  # "paragraph", "bullet", or "detailed"


class SummaryResponse(BaseModel):
    url: str
    title: str
    summary: str
    word_count: int


class SummarySaveRequest(BaseModel):
    url: str
    title: str
    summary: str


class SummarySaveResponse(BaseModel):
    message: str

class SummaryHistoryResponse(BaseModel):
    histories: list[dict[str, Any]]

class SummaryMetadata(Base):
    __tablename__ = "metadata"

    id = Column(Integer, primary_key=True, index=True)
    url = Column(String, index=True)
    createdAt = Column(DateTime, default=datetime.now, index=True)

class Summary(Base):
    __tablename__ = "summaries"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    summary = Column(String, index=True)
    summary_metadata_id = Column(Integer, ForeignKey("metadata.id"))
    summary_metadata = relationship("SummaryMetadata")
