import base64
import io
import time
from datetime import datetime, timezone
from typing import Optional

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from PIL import Image

from app.schemas import (
    Geometry,
    SessionStartResponse,
    SessionTranscript,
    SessionTurnOut,
    TutorResponse,
)
from app.services import ai_ink, pointing, tutor, vision
from app.session import SessionRecord, SessionTurn, get_store

app = FastAPI(title="Oakland Tutor")

NOT_DETECTED_HINT = (
    "I couldn't tell what you circled — try drawing a tighter circle "
    "around the part you want help with."
)


def _iso(ts: float) -> str:
    return datetime.fromtimestamp(ts, tz=timezone.utc).isoformat()


def _thumbnail(image: Image.Image) -> str:
    thumb = image.copy()
    thumb.thumbnail((160, 160))
    buf = io.BytesIO()
    thumb.convert("RGB").save(buf, format="JPEG", quality=70)
    return base64.standard_b64encode(buf.getvalue()).decode("ascii")


def _transcript(record: SessionRecord) -> SessionTranscript:
    return SessionTranscript(
        session_id=record.session_id,
        started_at=_iso(record.started_at),
        ended_at=_iso(record.ended_at) if record.ended_at is not None else None,
        turns=[
            SessionTurnOut(
                timestamp=_iso(t.timestamp),
                target_description=t.target_description,
                hint=t.hint,
                thumbnail_b64=t.thumbnail_b64,
            )
            for t in record.turns
        ],
    )


@app.get("/healthz")
def healthz() -> dict:
    return {"ok": True}


@app.post("/v1/session/start", response_model=SessionStartResponse)
def session_start() -> SessionStartResponse:
    record = get_store().start()
    return SessionStartResponse(session_id=record.session_id, started_at=_iso(record.started_at))


@app.post("/v1/session/{session_id}/end", response_model=SessionTranscript)
def session_end(session_id: str) -> SessionTranscript:
    record = get_store().end(session_id)
    if record is None:
        raise HTTPException(status_code=404, detail="unknown or expired session")
    return _transcript(record)


@app.post("/v1/tutor/query", response_model=TutorResponse)
async def query(
    image: UploadFile = File(...),
    geometry: str = Form(...),
    scenario: Optional[str] = Form("1"),
    session_id: Optional[str] = Form(None),
) -> TutorResponse:
    try:
        Geometry.model_validate_json(geometry)
    except Exception as exc:
        raise HTTPException(status_code=422, detail=f"bad geometry: {exc}") from exc

    raw = await image.read()
    try:
        pil = Image.open(io.BytesIO(raw)).convert("RGB")
    except Exception as exc:
        raise HTTPException(status_code=422, detail=f"bad image: {exc}") from exc

    history: list[str] = []
    if session_id:
        record = get_store().get(session_id)
        if record is None:
            raise HTTPException(status_code=404, detail="unknown or expired session")
        history = [f"[{t.target_description}] {t.hint}" for t in record.turns]

    understanding = vision.get_analyzer().analyze(pil, scenario=scenario or "1")
    location = pointing.get_locator().locate(pil, understanding)
    detected = location.found and location.confidence >= pointing.MIN_CONFIDENCE
    target_desc = understanding.target or "the targeted area"

    if detected:
        result = tutor.get_reasoner().hint(pil, understanding, target_desc, history)
        hint_text = result.hint
    else:
        hint_text = NOT_DETECTED_HINT

    if session_id and detected:
        get_store().append_turn(
            session_id,
            SessionTurn(
                timestamp=time.time(),
                target_description=target_desc,
                hint=hint_text,
                thumbnail_b64=_thumbnail(pil),
            ),
        )

    return TutorResponse(
        selection_detected=detected,
        target_description=target_desc,
        point=location.point,
        bbox=location.bbox,
        confidence=location.confidence,
        hint=hint_text,
        ai_strokes=ai_ink.for_target(location.point, location.bbox) if detected else [],
    )
