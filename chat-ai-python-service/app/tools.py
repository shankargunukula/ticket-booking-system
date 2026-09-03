from langchain_core.tools import tool

@tool
def calculate_lengths(text: str) -> int:
    """Calculates the character length of a given text string."""
    return len(text)
