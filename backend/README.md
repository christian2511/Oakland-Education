# Oakland Tutor backend

FastAPI service that receives a composite screen frame + geometry metadata and
returns a tutor hint plus normalized point/bbox for on-device rendering.

## Run

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Contract

`POST /v1/tutor/query` — multipart:
- `image`: PNG of the composite frame (captured screen + student annotation).
- `geometry`: JSON matching `app.schemas.Geometry`.

Response: `app.schemas.TutorResponse` (see `app/schemas.py`).

The current implementation returns a **deterministic stub** so the Android
client can be integrated end-to-end before the vision + pointing services are
implemented. Real implementations belong in `app/services/`.
