import io
import json

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
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

    if pil.size != (geom.image_width_px, geom.image_height_px):
        # Not fatal, but the client contract says these should agree.
        pass

    understanding = vision.analyze(pil)
    point, bbox, confidence = pointing.locate(pil, understanding)
    hint_text = tutor.hint(understanding, target_description="the +4 term")

    return TutorResponse(
        selection_detected=True,
        target_description="the +4 term",
        point=point,
        bbox=bbox,
        confidence=confidence,
        hint=hint_text,
    )
