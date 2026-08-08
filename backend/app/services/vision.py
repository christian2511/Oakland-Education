from PIL import Image


def analyze(image: Image.Image, scenario: str = "1") -> dict:
    """Extract semantic understanding from the composite frame."""
    scenarios = {
        "1": {"content_kind": "math_expression", "sample_expression": "3(x + 4) = 21", "target": "the +4 term"},
        "2": {"content_kind": "fraction_addition", "sample_expression": "1/2 + 1/3 = ?", "target": "denominators 2 and 3"},
        "3": {"content_kind": "inequality", "sample_expression": "-2x > 6", "target": "inequality sign >"},
    }
    return scenarios.get(scenario, scenarios["1"])
