import base64
import io
import os
from functools import lru_cache

import anthropic
from PIL import Image

MODEL = os.environ.get("TUTOR_MODEL", "claude-sonnet-4-6")


@lru_cache(maxsize=1)
def client() -> anthropic.Anthropic:
    return anthropic.Anthropic()


def image_block(image: Image.Image) -> dict:
    buf = io.BytesIO()
    image.save(buf, format="PNG")
    data = base64.standard_b64encode(buf.getvalue()).decode("utf-8")
    return {
        "type": "image",
        "source": {"type": "base64", "media_type": "image/png", "data": data},
    }


def cached_system(text: str) -> list[dict]:
    return [{"type": "text", "text": text, "cache_control": {"type": "ephemeral"}}]
