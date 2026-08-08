from app.schemas import AiStroke, NormalizedBox, NormalizedPoint

PAD = 1.08


def _clamp(value: float) -> float:
    return min(1.0, max(0.0, value))


def for_target(point: NormalizedPoint, bbox: NormalizedBox) -> list[AiStroke]:
    """Geometric marks for the located target: a circle inscribing the bbox."""
    center = NormalizedPoint(
        x=_clamp(bbox.x + bbox.width / 2),
        y=_clamp(bbox.y + bbox.height / 2),
    )
    return [
        AiStroke(
            kind="circle",
            center=center,
            rx=_clamp(max(bbox.width / 2 * PAD, 0.01)),
            ry=_clamp(max(bbox.height / 2 * PAD, 0.01)),
        )
    ]
