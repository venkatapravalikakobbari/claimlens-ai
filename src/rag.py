"""Local in-memory semantic retrieval for policy clauses."""

from dataclasses import dataclass
from math import sqrt

from src.gemini_client import GeminiClient
from src.models import PolicyClause


@dataclass(frozen=True)
class _EmbeddedClause:
	"""A policy clause and its precomputed embedding."""

	clause: PolicyClause
	embedding: list[float]


def _cosine_similarity(first: list[float], second: list[float]) -> float:
	"""Return cosine similarity, safely handling empty or zero vectors."""

	if not first or not second:
		return 0.0
	if len(first) != len(second):
		raise ValueError("Embedding vectors must have the same length.")

	dot_product = sum(left * right for left, right in zip(first, second))
	first_norm = sqrt(sum(value * value for value in first))
	second_norm = sqrt(sum(value * value for value in second))
	if first_norm == 0.0 or second_norm == 0.0:
		return 0.0
	return dot_product / (first_norm * second_norm)


class PolicyRetriever:
	"""Retrieve policy clauses using local cosine-similarity ranking."""

	def __init__(
		self,
		clauses: list[PolicyClause],
		gemini_client: GeminiClient,
	) -> None:
		"""Precompute one embedding for every supplied policy clause."""

		self._embedded_clauses = [
			_EmbeddedClause(
				clause=clause,
				embedding=gemini_client.get_embedding(
					f"{clause.clause_id}: {clause.title}\n{clause.text}"
				),
			)
			for clause in clauses
		]
		self._gemini_client = gemini_client

	def retrieve(self, query: str, top_k: int = 5) -> list[PolicyClause]:
		"""Return the most similar policy clauses for a non-empty query."""

		if not query or not query.strip():
			raise ValueError("query must be non-empty.")
		if top_k <= 0:
			raise ValueError("top_k must be greater than zero.")

		query_embedding = self._gemini_client.get_embedding(query)
		ranked = sorted(
			self._embedded_clauses,
			key=lambda item: _cosine_similarity(query_embedding, item.embedding),
			reverse=True,
		)
		return [item.clause for item in ranked[:top_k]]
