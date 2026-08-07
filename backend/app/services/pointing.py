from PIL import Image

from app.schemas import NormalizedBox, NormalizedPoint


def locate(image: Image.Image, understanding: dict) -> tuple[NormalizedPoint, NormalizedBox, float]:
    """Return the normalized point + bbox of the region the tutor should discuss.

    Stub: returns a fixed centered target. Real implementation calls a pointing
    or grounding model that consumes the same frame used by vision.analyze().
    """
    return (
        NormalizedPoint(x=0.621, y=0.437),
        NormalizedBox(x=0.580, y=0.405, width=0.091, height=0.063),
        0.95,
    )
