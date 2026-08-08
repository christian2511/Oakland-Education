import os
from abc import ABC, abstractmethod
from functools import lru_cache

from PIL import Image

from app.schemas import Understanding


class VisionAnalyzer(ABC):
    @abstractmethod
    def analyze(self, image: Image.Image, scenario: str = "1") -> Understanding: ...


_SCENARIOS = {
    "1": Understanding(
        content_kind="math_expression",
        sample_expression="3(x + 4) = 21",
        target="the +4 term",
        domain="algebra",
        progress="student distributed the 3 to x but not to the 4",
        misconceptions=["partial distribution over addition"],
    ),
    "2": Understanding(
        content_kind="fraction_addition",
        sample_expression="1/2 + 1/3 = ?",
        target="denominators 2 and 3",
        domain="fractions",
        progress="student is about to add numerators and denominators directly",
        misconceptions=["adding denominators directly"],
    ),
    "3": Understanding(
        content_kind="inequality",
        sample_expression="-2x > 6",
        target="inequality sign >",
        domain="inequalities",
        progress="student divided both sides by -2 without flipping the sign",
        misconceptions=["not flipping the inequality when dividing by a negative"],
    ),
}


class NoopVisionAnalyzer(VisionAnalyzer):
    def analyze(self, image: Image.Image, scenario: str = "1") -> Understanding:
        return _SCENARIOS.get(scenario, _SCENARIOS["1"]).model_copy(deep=True)


VISION_SYSTEM = """You are the vision layer of a math tutoring app for middle- and \
high-school students. You receive a screen capture of a student's handwritten math \
workspace. Red strokes are the student's transient "ask about this" annotation \
(usually a circle or underline); they are not part of the math work itself.

Extract a structured understanding of the work:
- content_kind: short snake_case label for the kind of content (e.g. math_expression, \
fraction_addition, inequality, word_problem, geometry_diagram).
- sample_expression: the most relevant expression or equation, transcribed exactly as \
written, in plain text (use / for fractions and ^ for exponents, no LaTeX).
- target: a short noun phrase naming the specific element the student marked with the \
red annotation (e.g. "the +4 term", "denominators 2 and 3").
- domain: the math domain (algebra, fractions, inequalities, geometry, ...).
- progress: one sentence on how far the student has gotten and what they did.
- misconceptions: the most likely misconception candidates given the visible work, \
most likely first. Empty list if the work looks correct so far.

Transcribe only what is actually visible. If the page is empty or unreadable, say so \
in progress and leave misconceptions empty."""


class AnthropicVisionAnalyzer(VisionAnalyzer):
    def analyze(self, image: Image.Image, scenario: str = "1") -> Understanding:
        from app.services.llm import MODEL, cached_system, client, image_block

        response = client().messages.parse(
            model=MODEL,
            max_tokens=2048,
            thinking={"type": "adaptive"},
            system=cached_system(VISION_SYSTEM),
            messages=[
                {
                    "role": "user",
                    "content": [
                        image_block(image),
                        {"type": "text", "text": "Analyze this student workspace."},
                    ],
                }
            ],
            output_format=Understanding,
        )
        if response.parsed_output is None:
            raise RuntimeError("vision model returned no parsable understanding")
        return response.parsed_output


@lru_cache(maxsize=1)
def get_analyzer() -> VisionAnalyzer:
    if os.environ.get("TUTOR_VISION_PROVIDER", "noop").lower() == "anthropic":
        return AnthropicVisionAnalyzer()
    return NoopVisionAnalyzer()
