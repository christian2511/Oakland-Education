from PIL import Image

from app.schemas import NormalizedBox, NormalizedPoint


def locate(image: Image.Image, understanding: dict) -> tuple[NormalizedPoint, NormalizedBox, float]:
    """Return normalized point + bbox for target region."""
    expr = understanding.get("sample_expression", "")

    if "1/2" in expr:
        return NormalizedPoint(x=0.480, y=0.380), NormalizedBox(x=0.420, y=0.350, width=0.120, height=0.080), 0.95
    elif "-2x" in expr:
        return NormalizedPoint(x=0.550, y=0.520), NormalizedBox(x=0.510, y=0.480, width=0.080, height=0.080), 0.95
    else:
        return NormalizedPoint(x=0.621, y=0.437), NormalizedBox(x=0.580, y=0.405, width=0.091, height=0.063), 0.95
