def hint(understanding: dict, target_description: str) -> str:
    """Return pedagogical Socratic prompt."""
    expr = understanding.get("sample_expression", "")
    if "1/2" in expr:
        return "Before adding fractions, what needs to be the same for both denominators?"
    elif "-2x" in expr:
        return "What happens to the inequality sign when you divide both sides by a negative number?"
    else:
        return "What else does the 3 multiply inside the parentheses?"
