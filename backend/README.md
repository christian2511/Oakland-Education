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
- `scenario` (optional): canned demo scenario id (`1`/`2`/`3`), used by the noop providers.
- `session_id` (optional): from `POST /v1/session/start`; enables session history.

Response: `app.schemas.TutorResponse` (see `app/schemas.py`). The response shape
mirrors the Android client's `TutorResponse.kt` exactly — do not add or remove
required fields without changing both sides.

### Sessions

- `POST /v1/session/start` → `{session_id, started_at}`.
- `POST /v1/session/{id}/end` → full transcript (hints, targets, timestamps,
  thumbnails). Sessions expire after 2 h idle.

## Providers

Each intelligence layer is selected with an env var; every one defaults to
`noop` (deterministic canned demos, no API key needed):

| Env var | Values | Layer |
|---|---|---|
| `TUTOR_VISION_PROVIDER` | `noop` / `anthropic` | `services/vision.py` — scene understanding |
| `TUTOR_POINTING_PROVIDER` | `noop` / `anthropic` | `services/pointing.py` — visual grounding |
| `TUTOR_REASONING_PROVIDER` | `noop` / `anthropic` | `services/tutor.py` — Socratic hint |
| `TUTOR_MODEL` | model id (default `claude-sonnet-4-6`; use `claude-opus-4-7` for max grounding precision, `claude-haiku-4-5` for cheapest) | shared |
| `TUTOR_SESSION_STORE` | `memory` (default) / `sqlite` | `app/session.py` |
| `TUTOR_SESSION_DB` | sqlite path (default `sessions.db`) | with `sqlite` store |

The `anthropic` providers read `ANTHROPIC_API_KEY` from the environment (never
checked in) and use structured outputs (`messages.parse`) with adaptive
thinking. Pointing results with confidence < 0.4 (or `found=false`) come back
as `selection_detected=false` so the client can show a "couldn't tell what you
circled" message.
