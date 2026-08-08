import io
import json
from typing import Optional

from fastapi import FastAPI, File, Form, HTTPException, Query, UploadFile
from PIL import Image

from app.schemas import Geometry, TutorResponse
from app.services import pointing, tutor, vision

app = FastAPI(title="Oakland Tutor")


@app.get("/healthz")
def healthz() -> dict:
    return {"ok": True}


@app.post("/v1/tutor/query", response_model=TutorResponse)
async def query(
    image: UploadFile = File(...),
    geometry: str = Form(...),
    scenario: Optional[str] = Form("1"),
) -> TutorResponse:
    try:
        geom = Geometry.model_validate_json(geometry)
    except Exception as exc:
        raise HTTPException(status_code=422, detail=f"bad geometry: {exc}") from exc

    raw = await image.read()
    try:
        pil = Image.open(io.BytesIO(raw)).convert("RGB")
    except Exception as exc:
        raise HTTPException(status_code=422, detail=f"bad image: {exc}") from exc

    understanding = vision.analyze(pil, scenario=scenario or "1")
    point, bbox, confidence = pointing.locate(pil, understanding)
    target_desc = understanding.get("target", "the targeted area")
    hint_text = tutor.hint(understanding, target_description=target_desc)

    return TutorResponse(
        selection_detected=True,
        target_description=target_desc,
        point=point,
        bbox=bbox,
        confidence=confidence,
        hint=hint_text,
    )
