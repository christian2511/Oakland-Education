from typing import Literal, Optional

from pydantic import BaseModel, Field


class Geometry(BaseModel):
    screen_width_px: int = Field(gt=0)
    screen_height_px: int = Field(gt=0)
    image_width_px: int = Field(gt=0)
    image_height_px: int = Field(gt=0)
    orientation: str
    density_dpi: int = Field(gt=0)


class NormalizedPoint(BaseModel):
    x: float = Field(ge=0.0, le=1.0)
    y: float = Field(ge=0.0, le=1.0)


class NormalizedBox(BaseModel):
    x: float = Field(ge=0.0, le=1.0)
    y: float = Field(ge=0.0, le=1.0)
    width: float = Field(ge=0.0, le=1.0)
    height: float = Field(ge=0.0, le=1.0)


class TutorResponse(BaseModel):
    selection_detected: bool
    target_description: str
    point: NormalizedPoint
    bbox: NormalizedBox
    confidence: float = Field(ge=0.0, le=1.0)
    hint: str


class Understanding(BaseModel):
    """Semantic read of the student's work extracted by the vision layer."""

    content_kind: str
    sample_expression: str
    target: str
    domain: str = ""
    progress: str = ""
    misconceptions: list[str] = []


class HintResult(BaseModel):
    hint: str
    follow_up_questions: list[str] = []
    next_step: Literal["probe", "hint", "encourage", "review"] = "hint"


class SessionStartResponse(BaseModel):
    session_id: str
    started_at: str


class SessionTurnOut(BaseModel):
    timestamp: str
    target_description: str
    hint: str
    thumbnail_b64: Optional[str] = None


class SessionTranscript(BaseModel):
    session_id: str
    started_at: str
    ended_at: Optional[str] = None
    turns: list[SessionTurnOut] = []
