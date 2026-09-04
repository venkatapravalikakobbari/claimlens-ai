"""Local in-memory semantic retrieval for policy clauses."""

from dataclasses import dataclass
import json
from math import sqrt
from pathlib import Path

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
		index_path: str | Path | None = None,
	) -> None:
		"""Create a retriever, optionally loading or saving a local index."""

		self._gemini_client = gemini_client
		if index_path is not None and Path(index_path).is_file():
			self._embedded_clauses = self._load_index(index_path)
		else:
			self._embedded_clauses = [
				_EmbeddedClause(
					clause=clause,
					embedding=gemini_client.get_embedding(
						f"{clause.clause_id}: {clause.title}\n{clause.text}"
					),
				)
				for clause in clauses
			]
			if index_path is not None:
				self._save_index(index_path)

	@classmethod
	def build_or_load_index(
		cls,
		clauses: list[PolicyClause],
		gemini_client: GeminiClient,
		index_path: str | Path,
	) -> "PolicyRetriever":
		"""Load a local policy index or build it with Gemini embeddings."""

		return cls(clauses, gemini_client, index_path=index_path)

	def _save_index(self, index_path: str | Path) -> None:
		path = Path(index_path)
		path.parent.mkdir(parents=True, exist_ok=True)
		payload = [
			{
				"clause_id": item.clause.clause_id,
				"title": item.clause.title,
				"text": item.clause.text,
				"embedding": item.embedding,
			}
			for item in self._embedded_clauses
		]
		path.write_text(json.dumps(payload, indent=2), encoding="utf-8")

	@staticmethod
	def _load_index(index_path: str | Path) -> list[_EmbeddedClause]:
		path = Path(index_path)
		payload = json.loads(path.read_text(encoding="utf-8"))
		return [
			_EmbeddedClause(
				clause=PolicyClause(
					clause_id=entry["clause_id"],
					title=entry["title"],
					text=entry["text"],
				),
				embedding=[float(value) for value in entry["embedding"]],
			)
			for entry in payload
		]

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
