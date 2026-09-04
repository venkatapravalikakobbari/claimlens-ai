"""Data models used by the ClaimLens review pipeline."""

from dataclasses import dataclass, field


@dataclass
class ClaimDocument:
	"""A document belonging to an insurance claim."""

	claim_id: str
	document_type: str
	source_path: str
	content: str


@dataclass
class EvidenceItem:
	"""A factual statement extracted from a claim document."""

	claim_id: str
	statement: str
	source_document: str
	evidence_type: str


@dataclass
class PolicyClause:
	"""A clause from the applicable insurance policy."""

	clause_id: str
	title: str
	text: str


@dataclass
class RuleFinding:
	"""The result of evaluating a claim against a review rule."""

	rule_id: str
	description: str
	status: str
	evidence: list[EvidenceItem] = field(default_factory=list)


@dataclass
class Contradiction:
	"""A conflict between two pieces of claim evidence."""

	description: str
	source_a: str
	source_b: str
	severity: str


@dataclass
class ClaimReview:
	"""The structured result of reviewing a claim."""

	claim_id: str
	completeness_findings: list[RuleFinding] = field(default_factory=list)
	consistency_findings: list[RuleFinding] = field(default_factory=list)
	policy_findings: list[RuleFinding] = field(default_factory=list)
	contradictions: list[Contradiction] = field(default_factory=list)
	recommendation: str = ""
	rationale: str = ""
