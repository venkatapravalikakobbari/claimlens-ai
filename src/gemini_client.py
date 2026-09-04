"""Small wrapper around the Google GenAI client used by ClaimLens."""

import os
from typing import Any


EMBEDDING_MODEL = "gemini-embedding-001"
GENERATION_MODEL = "gemini-3.5-flash-lite"


class GeminiClient:
	"""Provide isolated access to Gemini embeddings."""

	def __init__(self) -> None:
		"""Create a Gemini client using the configured environment API key."""

		api_key = os.environ.get("GEMINI_API_KEY")
		if not api_key:
			raise RuntimeError(
				"GEMINI_API_KEY must be configured before using GeminiClient."
			)

		from google import genai

		self._client = genai.Client(api_key=api_key)

	def get_embedding(self, text: str) -> list[float]:
		"""Generate an embedding for non-empty text using Gemini."""

		if not text or not text.strip():
			raise ValueError("text must be non-empty when requesting an embedding.")

		response: Any = self._client.models.embed_content(
			model=EMBEDDING_MODEL,
			contents=text,
		)
		return [float(value) for value in response.embeddings[0].values]

	def generate_text(self, prompt: str) -> str:
		"""Generate text for a non-empty prompt using Gemini."""

		if not prompt or not prompt.strip():
			raise ValueError("prompt must be non-empty when generating text.")

		response: Any = self._client.models.generate_content(
			model=GENERATION_MODEL,
			contents=prompt,
		)
		text = getattr(response, "text", None)
		if not isinstance(text, str) or not text.strip():
			raise RuntimeError("Gemini returned no usable text response.")
		return text.strip()
