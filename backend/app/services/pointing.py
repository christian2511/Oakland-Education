import os
from abc import ABC, abstractmethod
from dataclasses import dataclass
from functools import lru_cache

from PIL import Image
from pydantic import BaseModel

from app.schemas import NormalizedBox, NormalizedPoint, Understanding

MIN_CONFIDENCE = 0.4


@dataclass
class TargetLocation:
    point: NormalizedPoint
    bbox: NormalizedBox
    confidence: float
    found: bool


class TargetLocator(ABC):
    @abstractmethod
    def locate(self, image: Image.Image, understanding: Understanding) -> TargetLocation: ...


class NoopTargetLocator(TargetLocator):
    def locate(self, image: Image.Image, understanding: Understanding) -> TargetLocation:
        expr = understanding.sample_expression
        if "1/2" in expr:
            point = NormalizedPoint(x=0.480, y=0.380)
            bbox = NormalizedBox(x=0.420, y=0.350, width=0.120, height=0.080)
        elif "-2x" in expr:
            point = NormalizedPoint(x=0.550, y=0.520)
            bbox = NormalizedBox(x=0.510, y=0.480, width=0.080, height=0.080)
        else:
            point = NormalizedPoint(x=0.621, y=0.437)
            bbox = NormalizedBox(x=0.580, y=0.405, width=0.091, height=0.063)
        return TargetLocation(point=point, bbox=bbox, confidence=0.95, found=True)


class _RawLocation(BaseModel):
    """Model-facing schema; unconstrained floats so out-of-range output is clamped, not rejected."""

    found: bool
    x: float
    y: float
    bbox_x: float
    bbox_y: float
    bbox_width: float
    bbox_height: float
    confidence: float


POINTING_SYSTEM = """You are the visual grounding layer of a math tutoring app. You \
receive a screen capture of a student's math workspace. Red strokes are the student's \
"ask about this" annotation — usually a circle, underline, or arrow. You also receive \
a description of the element the student is asking about.

Locate the math content the red annotation refers to and return:
- found: true only if there is both a red annotation and actual math content at or \
near it. If the annotation circles empty space, or there is no red annotation at all, \
return found=false.
- x, y: the center of the annotated math content, normalized to 0..1 relative to the \
full image width and height.
- bbox_x, bbox_y, bbox_width, bbox_height: a tight normalized bounding box around the \
annotated math content (not around the red stroke itself).
- confidence: 0..1 — how sure you are that this box contains what the student is \
asking about.

Be precise: the box should cover the referenced term or symbol, not the whole line, \
unless the annotation clearly covers the whole line."""


def _clamp(value: float) -> float:
    return min(1.0, max(0.0, value))


class AnthropicTargetLocator(TargetLocator):
    def locate(self, image: Image.Image, understanding: Understanding) -> TargetLocation:
        from app.services.llm import MODEL, cached_system, client, image_block

        response = client().messages.parse(
            model=MODEL,
            max_tokens=1024,
            thinking={"type": "adaptive"},
            output_config={"effort": "medium"},
            system=cached_system(POINTING_SYSTEM),
            messages=[
                {
                    "role": "user",
                    "content": [
                        image_block(image),
                        {
                            "type": "text",
                            "text": (
                                f"The student is asking about: {understanding.target}\n"
                                f"Relevant expression: {understanding.sample_expression}\n"
                                "Locate it."
                            ),
                        },
                    ],
                }
            ],
            output_format=_RawLocation,
        )
        raw = response.parsed_output
        if raw is None:
            raise RuntimeError("pointing model returned no parsable location")

        x, y = _clamp(raw.x), _clamp(raw.y)
        bx, by = _clamp(raw.bbox_x), _clamp(raw.bbox_y)
        return TargetLocation(
            point=NormalizedPoint(x=x, y=y),
            bbox=NormalizedBox(
                x=bx,
                y=by,
                width=_clamp(min(raw.bbox_width, 1.0 - bx)),
                height=_clamp(min(raw.bbox_height, 1.0 - by)),
            ),
            confidence=_clamp(raw.confidence),
            found=raw.found,
        )


@lru_cache(maxsize=1)
def get_locator() -> TargetLocator:
    if os.environ.get("TUTOR_POINTING_PROVIDER", "noop").lower() == "anthropic":
        return AnthropicTargetLocator()
    return NoopTargetLocator()
