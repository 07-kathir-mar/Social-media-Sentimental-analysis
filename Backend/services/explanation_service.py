from typing import List, Protocol


class ExplanationProvider(Protocol):
    def get_explanation(self, comments: List[str]) -> str:
        ...


class PlaceholderExplanationProvider:
    def get_explanation(self, comments: List[str]) -> str:
        return "Explanation will be generated based on comment trends."


class ExplanationService:
    def __init__(self, provider: ExplanationProvider | None = None):
        self.provider = provider or PlaceholderExplanationProvider()

    def get_explanation(self, comments: List[str]) -> str:
        return self.provider.get_explanation(comments)
