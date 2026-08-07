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
