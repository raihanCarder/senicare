"""Check-in related Pydantic models."""

from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class TriageStatus(str, Enum):
    GREEN = "Green"
    YELLOW = "Yellow"
    RED = "Red"


class Answers(BaseModel):
    dizziness: bool = False
    chest_pain: bool = False
    trouble_breathing: bool = False
    medication_taken: Optional[bool] = None


class CheckinStartRequest(BaseModel):
    pass


class CheckinStartResponse(BaseModel):
    checkin_id: str
    started_at: datetime


class CheckinCompleteRequest(BaseModel):
    answers: Answers
    transcript: Optional[str] = None


class CheckinResult(BaseModel):
    checkin_id: str
    triage_status: TriageStatus
    triage_reasons: List[str]
    completed_at: datetime


class FacialSymmetrySummary(BaseModel):
    duration_s: float
    total_frames: int
    valid_frames: int
    quality_ratio: float
    symmetry_mean: Optional[float] = None
    symmetry_std: Optional[float] = None
    symmetry_p90: Optional[float] = None


class FacialSymmetryResult(BaseModel):
    status: str
    reason: str
    combined_index: Optional[float] = None
    rollups: Dict[str, Dict[str, Any]] = Field(default_factory=dict)
    summary: Optional[FacialSymmetrySummary] = None
    error: Optional[str] = None


class CheckinUploadResponse(BaseModel):
    checkin_id: str
    uploaded_at: datetime
    files: List[str]
    facial_symmetry: Optional[FacialSymmetryResult] = None


class CheckinDetail(BaseModel):
    checkin_id: str
    senior_id: str
    status: str
    started_at: datetime
    completed_at: Optional[datetime] = None
    triage_status: Optional[TriageStatus] = None
    triage_reasons: List[str] = []
    transcript: Optional[str] = None
    facial_symmetry: Optional[FacialSymmetryResult] = None


class CheckinListResponse(BaseModel):
    senior_id: str
    items: List[CheckinDetail]


# Rebuild model to resolve forward references
CheckinUploadResponse.model_rebuild()
