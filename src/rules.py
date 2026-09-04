"""Deterministic policy checks for claim evidence."""

from datetime import date, datetime
import re

from src.models import ClaimDocument, EvidenceItem, PolicyClause, RuleFinding


PASS = "PASS"
FAIL = "FAIL"
MISSING = "MISSING"
UNKNOWN = "UNKNOWN"
NOT_APPLICABLE = "NOT_APPLICABLE"
APPLICABLE = "APPLICABLE"


def create_evidence_item(
	claim_id: str,
	statement: str,
	source_document: str,
	evidence_type: str,
) -> EvidenceItem:
	"""Create an evidence item with the supplied source details."""

	return EvidenceItem(
		claim_id=claim_id,
		statement=statement,
		source_document=source_document,
		evidence_type=evidence_type,
	)


def check_required_documents(
	documents: list[ClaimDocument], required_document_types: list[str]
) -> RuleFinding:
	"""Check whether each requested document type is present."""

	present = {document.document_type.casefold() for document in documents}
	missing = [
		document_type
		for document_type in required_document_types
		if document_type.casefold() not in present
	]
	evidence = [
		create_evidence_item(
			document.claim_id,
			f"Document type '{document.document_type}' is present.",
			document.source_path,
			"DOCUMENT_PRESENT",
		)
		for document in documents
		if document.document_type.casefold() in {
			required.casefold() for required in required_document_types
		}
	]
	status = PASS if not missing else MISSING
	description = (
		"All required document types are present."
		if not missing
		else f"Missing required document types: {', '.join(missing)}."
	)
	return RuleFinding("POL-005", description, status, evidence)


def check_reporting_window(
	incident_date: date, reported_date: date, reporting_window_days: int
) -> RuleFinding:
	"""Check whether reporting occurred within the permitted day count."""

	elapsed_days = (reported_date - incident_date).days
	status = PASS if 0 <= elapsed_days <= reporting_window_days else FAIL
	description = (
		f"Incident date: {incident_date.isoformat()}; reported date: "
		f"{reported_date.isoformat()}; elapsed days: {elapsed_days}; "
		f"allowed days: {reporting_window_days}."
	)
	return RuleFinding("POL-004", description, status)


def check_claim_amount(claim_amount: float, insured_value: float) -> RuleFinding:
	"""Check whether the claim amount exceeds the insured value."""

	status = PASS if claim_amount <= insured_value else FAIL
	description = (
		f"Claim amount: {claim_amount}; insured value: {insured_value}; "
		f"exceeds insured value: {'yes' if status == FAIL else 'no'}."
	)
	return RuleFinding("POL-006", description, status)


def _claim_id(documents: list[ClaimDocument]) -> str:
	return documents[0].claim_id if documents else "UNKNOWN"


def _evidence(
	documents: list[ClaimDocument], statement: str, evidence_type: str
) -> list[EvidenceItem]:
	return [
		create_evidence_item(
			document.claim_id, statement, document.source_path, evidence_type
		)
		for document in documents
	]


def _combined_text(documents: list[ClaimDocument]) -> str:
	return "\n".join(document.content for document in documents).casefold()


def _parse_date(value: str) -> date | None:
	for format_ in ("%d-%b-%Y", "%d/%m/%Y", "%Y-%m-%d"):
		try:
			return datetime.strptime(value, format_).date()
		except ValueError:
			continue
	return None


def _labeled_date(text: str, label: str) -> date | None:
	match = re.search(
		rf"{re.escape(label)}\s*:\s*(\d{{1,2}}[-/]\w{{3}}[-/]\d{{4}}|\d{{1,2}}/\d{{1,2}}/\d{{4}}|\d{{4}}-\d{{2}}-\d{{2}})",
		text,
		re.IGNORECASE,
	)
	return _parse_date(match.group(1)) if match else None


def _finding(
	rule_id: str,
	description: str,
	status: str,
	documents: list[ClaimDocument],
	evidence_type: str = "DOCUMENT_TEXT",
) -> RuleFinding:
	evidence = _evidence(documents, description, evidence_type) if documents else []
	return RuleFinding(rule_id, description, status, evidence)


_DAMAGE_ITEM_PATTERN = re.compile(
	r"\b(?P<location>front|rear|left|right|side|rear-left|rear-right|"
	r"front-left|front-right)?\s*"
	r"(?P<item>bumper|headlight|fender|door|engine|windshield|window|"
	r"bonnet|hood|mirror|wheel|tyre|tire|radiator|grille)\b",
	re.IGNORECASE,
)


def _damage_items(document: ClaimDocument) -> set[tuple[str, str]]:
	"""Extract explicitly named damage components and their locations."""

	items: set[tuple[str, str]] = set()
	for match in _DAMAGE_ITEM_PATTERN.finditer(document.content):
		location = (match.group("location") or "unspecified").casefold()
		item = match.group("item").casefold()
		items.add((location, item))
	return items


def _damage_conflict(
	document_items: list[tuple[ClaimDocument, set[tuple[str, str]]]],
) -> str | None:
	"""Return a conflict description when explicit damage evidence disagrees."""

	for index, (document_a, items_a) in enumerate(document_items):
		for document_b, items_b in document_items[index + 1 :]:
			components_a = {item for _, item in items_a}
			components_b = {item for _, item in items_b}
			for component in components_a & components_b:
				locations_a = {location for location, item in items_a if item == component}
				locations_b = {location for location, item in items_b if item == component}
				if locations_a != locations_b:
					return (
						f"Damage conflict: {document_a.source_path} reports "
						f"{sorted(locations_a)} {component}, while "
						f"{document_b.source_path} reports {sorted(locations_b)} "
						f"{component}."
					)

			if components_a and components_b and not (components_a & components_b):
				return (
					f"Damage conflict: {document_a.source_path} reports "
					f"{sorted(components_a)}, while {document_b.source_path} reports "
					f"{sorted(components_b)}."
				)
	return None


def _claim_amount(text: str) -> float | None:
	match = re.search(r"claim amount\s*:\s*[^\d]*(\d[\d,]*)", text, re.IGNORECASE)
	return float(match.group(1).replace(",", "")) if match else None


def _insured_value(clause: PolicyClause) -> float | None:
	match = re.search(
		r"(?:insured declared value|\bidv\b)\s*(?:\([^)]*\))?\s*"
		r"(?:is|of|:)?\s*[^\d]*(\d[\d,]*)",
		clause.text,
		re.IGNORECASE,
	)
	return float(match.group(1).replace(",", "")) if match else None


def _explicit_intoxication(text: str) -> bool:
	"""Return whether the text explicitly states intoxication or impairment."""

	pattern = (
		r"(?:driver|person|insured)\s+(?:was|is|appeared)\s+"
		r"(?:intoxicated|impaired|under the influence)|"
		r"(?:intoxication|impairment)\s+(?:was|is)\s+confirmed|"
		r"tested\s+positive\s+for\s+(?:alcohol|intoxication|a prohibited substance)"
	)
	return bool(re.search(pattern, text, re.IGNORECASE))


def check_policy_clause_applicability(
	documents: list[ClaimDocument], clauses: list[PolicyClause]
) -> list[RuleFinding]:
	"""Apply simple deterministic checks for the supplied policy clauses."""

	text = _combined_text(documents)
	claim_id = _claim_id(documents)
	is_accident = bool(re.search(r"accident|collision", text))
	is_theft = bool(re.search(r"\btheft\b|\bstolen\b", text))
	findings: list[RuleFinding] = []

	for clause in clauses:
		if clause.clause_id == "POL-001":
			status = PASS if is_accident else NOT_APPLICABLE if is_theft else UNKNOWN
			findings.append(_finding(clause.clause_id, "Accident or collision evidence is present." if is_accident else "No explicit accident or collision evidence was found.", status, documents))
		elif clause.clause_id == "POL-002":
			status = PASS if is_theft else NOT_APPLICABLE if is_accident else UNKNOWN
			findings.append(_finding(clause.clause_id, "Explicit theft evidence is present." if is_theft else "No explicit theft evidence was found.", status, documents))
		elif clause.clause_id == "POL-004":
			incident = _labeled_date(text, "Incident Date")
			reported = _labeled_date(text, "Reported Date")
			if incident and reported:
				finding = check_reporting_window(incident, reported, 30)
				finding.rule_id = clause.clause_id
				findings.append(finding)
			else:
				findings.append(_finding(clause.clause_id, "Incident date or reported date is missing; reporting-window status is unknown.", UNKNOWN, documents))
		elif clause.clause_id == "POL-005":
			required = ["claim_form", "incident_description"]
			required.append("fir" if is_theft else "repair_estimate" if is_accident else "")
			required = [item for item in required if item]
			findings.append(check_required_documents(documents, required))
		elif clause.clause_id == "POL-006":
			claim_amount = _claim_amount(text)
			insured_value = _insured_value(clause)
			if claim_amount is not None and insured_value is not None:
				finding = check_claim_amount(claim_amount, insured_value)
				finding.evidence = _evidence(documents, finding.description, "CLAIM_AMOUNT")
				finding.evidence.append(create_evidence_item(claim_id, f"Insured value stated in {clause.clause_id}: {insured_value}.", clause.clause_id, "POLICY_TERM"))
				findings.append(finding)
			else:
				missing_value = "claim amount" if claim_amount is None else "insured declared value"
				findings.append(_finding(clause.clause_id, f"{missing_value.capitalize()} is not explicitly available; amount comparison is unknown.", UNKNOWN, documents))
		elif clause.clause_id == "POL-007":
			deductible_explicit = bool(re.search(r"deductible\s+of\s+(?:INR\s*)?[\d,]+", clause.text, re.IGNORECASE))
			status = APPLICABLE if is_accident and deductible_explicit else NOT_APPLICABLE if is_theft else UNKNOWN
			description = "The deductible is applicable as a policy term; no final claim decision or settlement was calculated." if status == APPLICABLE else "The deductible term is not determinable from the available evidence."
			findings.append(_finding(clause.clause_id, description, status, documents))
		elif clause.clause_id == "POL-008":
			invalid = bool(re.search(
				r"driving\s+licen[cs]e\s+status\s*:\s*invalid|"
				r"no\s+valid\s+driving\s+licen[cs]e|"
				r"driver\s+did\s+not\s+have\s+a\s+valid\s+driving\s+licen[cs]e",
				text,
				re.IGNORECASE,
			))
			valid = bool(re.search(
				r"valid\s+driving\s+licen[cs]e|"
				r"driving\s+licen[cs]e\s+status\s*:\s*valid",
				text,
				re.IGNORECASE,
			)) and not invalid
			status = FAIL if invalid else PASS if valid else UNKNOWN
			findings.append(_finding(clause.clause_id, "Driving licence evidence is invalid." if invalid else "Valid driving licence evidence is present." if valid else "Driving licence information is missing.", status, documents))
		elif clause.clause_id == "POL-009":
			intoxicated = _explicit_intoxication(text)
			status = FAIL if intoxicated else UNKNOWN
			findings.append(_finding(clause.clause_id, "Evidence explicitly indicates intoxication or impairment." if intoxicated else "No explicit intoxication or impairment evidence was found; absence is not treated as proof of sobriety.", status, documents))
		elif clause.clause_id == "POL-010":
			intentional = bool(re.search(r"intentional(?:ly)?\s+(?:caused|damaged)|deliberate(?:ly)?", text))
			status = FAIL if intentional else UNKNOWN
			findings.append(_finding(clause.clause_id, "Evidence indicates intentional damage." if intentional else "No explicit intentional-damage evidence was found.", status, documents))
		elif clause.clause_id == "POL-011":
			findings.append(_finding(clause.clause_id, f"Document consistency requires comparison across the available evidence for claim {claim_id}.", UNKNOWN, documents))
		elif clause.clause_id == "POL-012":
			document_items = [
				(document, _damage_items(document))
				for document in documents
			]
			document_items = [item for item in document_items if item[1]]
			conflict = _damage_conflict(document_items)
			if conflict:
				status = FAIL
				description = conflict
			elif len(document_items) >= 2:
				status = PASS
				description = "Explicit damage items agree across the available claim documents."
			else:
				status = UNKNOWN
				description = "There is not enough explicit damage evidence across documents to compare consistency."
			finding = _finding(clause.clause_id, description, status, documents)
			finding.evidence = [
				create_evidence_item(
					document.claim_id,
					f"Explicit damage items: {sorted(items)}.",
					document.source_path,
					"DAMAGE_EVIDENCE",
				)
				for document, items in document_items
			]
			findings.append(finding)
		elif clause.clause_id == "POL-013":
			missing_information: list[str] = []
			if not documents:
				missing_information.append("claim documents")
			if is_accident and not any(document.document_type.casefold() == "repair_estimate" for document in documents):
				missing_information.append("repair evidence")
			if is_accident and not re.search(r"licen[cs]e", text):
				missing_information.append("driving licence information")
			if is_theft and not any(document.document_type.casefold() == "fir" for document in documents):
				missing_information.append("FIR or police complaint")
			status = MISSING if missing_information else UNKNOWN
			description = (
				f"Missing policy-relevant information: {', '.join(missing_information)}."
				if missing_information
				else "No additional missing information was determinable; uncertain evidence is not treated as a rejection."
			)
			findings.append(_finding(clause.clause_id, description, status, documents))

	return findings
