import logging
import os
import re
from abc import ABC, abstractmethod
from functools import lru_cache

from PIL import Image

from app.schemas import HintResult, Understanding

rubric_log = logging.getLogger("tutor.rubric")

FALLBACK_HINT = HintResult(
    hint="Look closely at the part you circled — what operation is happening there, "
    "and what rule applies to it?",
    follow_up_questions=["What would be your very first step?"],
    next_step="probe",
)

_CANNED = {
    "1/2": HintResult(
        hint="Before adding fractions, what needs to be the same for both denominators?",
        follow_up_questions=["What number do both 2 and 3 divide into evenly?"],
        next_step="probe",
    ),
    "-2x": HintResult(
        hint="What happens to the inequality sign when you divide both sides by a negative number?",
        follow_up_questions=["Try checking your answer with x = -4. Does it work?"],
        next_step="probe",
    ),
    "default": HintResult(
        hint="What else does the 3 multiply inside the parentheses?",
        follow_up_questions=["How many terms are inside the parentheses?"],
        next_step="probe",
    ),
}


class TutorReasoner(ABC):
    @abstractmethod
    def hint(
        self,
        image: Image.Image,
        understanding: Understanding,
        target_description: str,
        session_history: list[str],
    ) -> HintResult: ...


class NoopTutorReasoner(TutorReasoner):
    """Deterministic replay path for the canned misconception demos."""

    def hint(
        self,
        image: Image.Image,
        understanding: Understanding,
        target_description: str,
        session_history: list[str],
    ) -> HintResult:
        expr = understanding.sample_expression
        for key, result in _CANNED.items():
            if key != "default" and key in expr:
                return result.model_copy(deep=True)
        return _CANNED["default"].model_copy(deep=True)


TUTOR_SYSTEM = """You are Lumina, a Socratic math tutor for middle- and high-school \
students in Oakland. The student circled part of their handwritten work and asked for \
help. You see their full workspace plus a structured analysis of it.

The Oakland tutoring rubric — follow it strictly:
1. NEVER give the final answer, a solved value, or the completed next line of work. \
Not even partially, not even "to check".
2. Ask one guiding question at a time, targeted at the exact element the student \
circled and at their most likely misconception.
3. One hint per turn. Keep it to at most two short sentences a young student can read \
quickly.
4. Adapt tone and vocabulary to the grade level implied by the work. Be warm and \
encouraging, never condescending.
5. If session history is provided, build on it: don't repeat an earlier hint, and if \
the student seems stuck on the same spot, try a smaller step or a concrete example \
with different numbers.

Return:
- hint: the one guiding question or nudge for this turn.
- follow_up_questions: 1-2 questions the tutor could ask next if the student stays stuck.
- next_step: probe (ask a diagnostic question), hint (nudge at the method), encourage \
(student is on track, cheer them on), or review (misconception is deep, revisit the \
underlying concept)."""

STRICT_RETRY_SUFFIX = """

IMPORTANT: Your previous attempt revealed the answer. This is a rubric violation. \
Rewrite the hint as a pure question that contains NO numeric result, no solved value, \
and no completed step. Guide, don't solve."""

# Bare "= digit" would false-positive on restating the problem's own equation
# (e.g. "3(x + 4) = 21"), so only flag solved-variable and "answer is" shapes.
_LEAK_PATTERNS = [
    re.compile(r"\banswer\s+is\b", re.IGNORECASE),
    re.compile(r"\b[a-hj-z]\s*=\s*-?\d", re.IGNORECASE),
    re.compile(r"\bequals\s+-?\d", re.IGNORECASE),
]


def _leaks_answer(hint: str) -> bool:
    return any(p.search(hint) for p in _LEAK_PATTERNS)


class AnthropicTutorReasoner(TutorReasoner):
    def hint(
        self,
        image: Image.Image,
        understanding: Understanding,
        target_description: str,
        session_history: list[str],
    ) -> HintResult:
        result = self._ask(image, understanding, target_description, session_history, strict=False)
        if not _leaks_answer(result.hint):
            return result

        rubric_log.warning("rubric violation: hint leaked answer, retrying strictly: %r", result.hint)
        result = self._ask(image, understanding, target_description, session_history, strict=True)
        if not _leaks_answer(result.hint):
            return result

        rubric_log.warning("rubric violation: strict retry still leaked, using fallback: %r", result.hint)
        return FALLBACK_HINT.model_copy(deep=True)

    def _ask(
        self,
        image: Image.Image,
        understanding: Understanding,
        target_description: str,
        session_history: list[str],
        strict: bool,
    ) -> HintResult:
        from app.services.llm import MODEL, cached_system, client, image_block

        history_text = (
            "Hints already given this session (oldest first):\n"
            + "\n".join(f"- {h}" for h in session_history[-6:])
            if session_history
            else "This is the first hint of the session."
        )
        prompt = (
            f"Structured analysis: {understanding.model_dump_json()}\n"
            f"The student circled: {target_description}\n"
            f"{history_text}\n"
            "Give the next Socratic hint."
        )
        system = TUTOR_SYSTEM + (STRICT_RETRY_SUFFIX if strict else "")

        response = client().messages.parse(
            model=MODEL,
            max_tokens=2048,
            thinking={"type": "adaptive"},
            system=cached_system(system),
            messages=[{"role": "user", "content": [image_block(image), {"type": "text", "text": prompt}]}],
            output_format=HintResult,
        )
        if response.parsed_output is None:
            raise RuntimeError("tutor model returned no parsable hint")
        return response.parsed_output


@lru_cache(maxsize=1)
def get_reasoner() -> TutorReasoner:
    if os.environ.get("TUTOR_REASONING_PROVIDER", "noop").lower() == "anthropic":
        return AnthropicTutorReasoner()
    return NoopTutorReasoner()
