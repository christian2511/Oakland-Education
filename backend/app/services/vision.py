from PIL import Image


def analyze(image: Image.Image) -> dict:
    """Extract semantic understanding from the composite frame.

    Stub: real implementation calls a multimodal vision model. For now returns
    a fixed understanding so the client integration path is exercised.
    """
    return {
        "content_kind": "math_expression",
        "sample_expression": "3(x + 4) = 21",
    }
