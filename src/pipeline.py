"""Claim review orchestration for deterministic evidence checks."""

import json
from pathlib import Path

from src.contradictions import detect_contradictions
from src.document_loader import load_claim_documents, load_policy_clauses
from src.gemini_client import GeminiClient
from src.metadata import extract_claim_metadata
from src.models import ClaimDocument, ClaimReview, Contradiction, RuleFinding
from src.rag import PolicyRetriever
from src.rules import check_policy_clause_applicability


_COMPLETENESS_RULES = {"POL-005", "POL-013"}
_CONSISTENCY_RULES = {"POL-011", "POL-012"}
_RECOMMENDATIONS = {
	"APPROVE",
	"REJECT",
	"REQUEST INFORMATION",
	"ESCALATE TO INVESTIGATOR",
}


def _build_retrieval_query(
	documents: list[ClaimDocument],
	findings: list[RuleFinding],
	contradictions: list[Contradiction],
) -> str:
	"""Build a deterministic claim-specific query for policy retrieval."""

	document_text = "\n\n".join(
		f"[{document.document_type}]\n{document.content}"
		for document in documents
	)
	finding_text = "\n".join(
		f"{finding.rule_id} ({finding.status}): {finding.description}"
		for finding in findings
	)
	contradiction_text = "\n".join(
		f"{contradiction.severity}: {contradiction.description}"
		for contradiction in contradictions
	)
	return (
		f"Claim evidence:\n{document_text}\n\n"
		f"Deterministic findings:\n{finding_text}\n\n"
		f"Contradictions:\n{contradiction_text}"
	)


def _classify_findings(
	findings: list[RuleFinding],
) -> tuple[list[RuleFinding], list[RuleFinding], list[RuleFinding]]:
	"""Group rule findings into completeness, consistency, and policy results."""

	completeness: list[RuleFinding] = []
	consistency: list[RuleFinding] = []
	policy: list[RuleFinding] = []

	for finding in findings:
		if finding.rule_id in _COMPLETENESS_RULES:
			completeness.append(finding)
		elif finding.rule_id in _CONSISTENCY_RULES:
			consistency.append(finding)
		else:
			policy.append(finding)

	return completeness, consistency, policy


def _format_findings(findings: list[RuleFinding]) -> str:
	"""Format deterministic findings for the reasoning prompt."""

	return "\n".join(
		f"- {finding.rule_id} [{finding.status}]: {finding.description}"
		for finding in findings
	) or "- None"


def _build_reasoning_prompt(
	review: ClaimReview,
	documents: list[ClaimDocument],
) -> str:
	"""Build an evidence-grounded prompt for investigation reasoning."""

	document_text = "\n\n".join(
		f"Source document: {Path(document.source_path).as_posix()}\n{document.content}"
		for document in documents
	)
	contradiction_text = "\n".join(
		f"- [{contradiction.severity}] {contradiction.description} "
		f"(sources: {Path(contradiction.source_a).as_posix()}, "
		f"{Path(contradiction.source_b).as_posix()})"
		for contradiction in review.contradictions
	) or "- None"
	clause_text = "\n\n".join(
		f"{clause.clause_id}: {clause.title}\n{clause.text}"
		for clause in review.retrieved_policy_clauses
	) or "None"

	return f"""You are assisting a human insurance claims investigator.

Use ONLY the supplied claim evidence and policy clauses. Never invent missing
facts. Never treat missing information as proof of failure. Never silently
resolve contradictions. Respect the deterministic findings exactly.

If material contradictions exist, recommend ESCALATE TO INVESTIGATOR.
If required information is missing, recommend REQUEST INFORMATION.
If a clearly supported exclusion or blocking condition exists, REJECT may be
recommended.
Recommend APPROVE only when the supplied evidence is complete, consistent,
and supports coverage. The human investigator remains the final
decision-maker.

		The rationale MUST cite evidence explicitly.
		Cite evidence using the exact supplied source path.
		Cite policy using the exact supplied POL-XXX clause ID.
Every material finding must cite at least one supplied claim document source;
when a policy requirement is involved, also cite the relevant supplied policy
clause ID. For contradictions, cite both conflicting source documents and the
relevant policy clause, such as POL-011 or POL-012. For missing information,
explicitly identify the missing document or field and cite the relevant policy
clause. Do not invent citations. If evidence is missing, explicitly state that
it is missing.

Return ONLY valid JSON with exactly this structure and no Markdown fences:
{{
  "recommendation": "APPROVE | REJECT | REQUEST INFORMATION | ESCALATE TO INVESTIGATOR",
  "rationale": "concise evidence-grounded explanation"
}}

Claim ID: {review.claim_id}

Claim documents:
{document_text}

Completeness findings:
{_format_findings(review.completeness_findings)}

Consistency findings:
{_format_findings(review.consistency_findings)}

Policy findings:
{_format_findings(review.policy_findings)}

Contradictions:
{contradiction_text}

Retrieved policy clauses:
{clause_text}
"""


def generate_investigation_reasoning(
	review: ClaimReview, documents: list[ClaimDocument]
) -> tuple[str, str]:
	"""Generate and safely parse a recommendation and rationale."""

	fallback = (
		"ESCALATE TO INVESTIGATOR",
		"The AI reasoning service was unavailable or could not be safely processed; human investigation is required.",
	)
	try:
		response = GeminiClient().generate_text(_build_reasoning_prompt(review, documents))
	except Exception as error:
		print(
			f"Gemini text generation failed: "
			f"{type(error).__name__}: {error}"
		)
		return fallback

	try:
		cleaned_response = response.strip()
		response_lines = cleaned_response.splitlines()
		if (
			len(response_lines) >= 2
			and response_lines[0].strip().lower() in {"```", "```json"}
			and response_lines[-1].strip() == "```"
		):
			cleaned_response = "\n".join(response_lines[1:-1]).strip()

		payload = json.loads(cleaned_response)
		recommendation = payload.get("recommendation")
		rationale = payload.get("rationale")
		if (
			type(recommendation) is not str
			or recommendation not in _RECOMMENDATIONS
			or type(rationale) is not str
			or not rationale.strip()
		):
			error = ValueError(
				"response must contain an allowed recommendation and non-empty rationale"
			)
			print(
				f"Gemini reasoning response validation failed: "
				f"{type(error).__name__}: {error}"
			)
			return fallback
		return recommendation, rationale.strip()
	except (json.JSONDecodeError, AttributeError, TypeError, ValueError) as error:
		print(
			f"Gemini reasoning response parsing failed: "
			f"{type(error).__name__}: {error}"
		)
		return fallback


def analyze_claim(claim_id: str) -> ClaimReview:
	"""Run the deterministic evidence review for a claim."""

	documents = load_claim_documents("data/claims", claim_id)
	claim_metadata = extract_claim_metadata(documents)
	clauses = load_policy_clauses("data/policy/motor_insurance_policy.md")
	findings = check_policy_clause_applicability(documents, clauses)
	contradictions = detect_contradictions(documents)
	completeness, consistency, policy = _classify_findings(findings)
	retrieval_query = _build_retrieval_query(documents, findings, contradictions)
	retriever = PolicyRetriever.build_or_load_index(
		clauses,
		GeminiClient(),
		"data/policy/policy_embeddings.json",
	)
	retrieved_policy_clauses = retriever.retrieve(retrieval_query, top_k=5)

	review = ClaimReview(
		claim_id=claim_id,
		claim_metadata=claim_metadata,
		completeness_findings=completeness,
		consistency_findings=consistency,
		policy_findings=policy,
		contradictions=contradictions,
		retrieved_policy_clauses=retrieved_policy_clauses,
	)
	review.recommendation, review.rationale = generate_investigation_reasoning(
		review, documents
	)
	return review
