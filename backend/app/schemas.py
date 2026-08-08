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


class AiStroke(BaseModel):
    """Semantic ink primitive rendered client-side (D-024, task 25).

    Geometry is normalized 0..1 in canvas space. Which fields apply depends
    on kind: circle uses center/rx/ry; arrow and underline use start/end;
    label uses anchor semantics via start + text/height (client support
    pending).
    """

    kind: Literal["circle", "arrow", "underline", "label"]
    center: Optional[NormalizedPoint] = None
    rx: Optional[float] = None
    ry: Optional[float] = None
    start: Optional[NormalizedPoint] = None
    end: Optional[NormalizedPoint] = None
    text: Optional[str] = None
    height: Optional[float] = None
    color: str = "#C4685E"
    width_dp: float = 4.0


class TutorResponse(BaseModel):
    selection_detected: bool
    target_description: str
    point: NormalizedPoint
    bbox: NormalizedBox
    confidence: float = Field(ge=0.0, le=1.0)
    hint: str
    ai_strokes: list[AiStroke] = []
    status: Literal["correct", "incorrect", "needs_review"] = "needs_review"
    misconception: Optional[str] = None


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
    status: Literal["correct", "incorrect", "needs_review"] = "needs_review"
    misconception: Optional[str] = None


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
