"""Deterministic metadata extraction from loaded claim documents."""

import re

from src.models import ClaimDocument, ClaimMetadata


_DOCUMENT_PRIORITY = {
	"claim_form": 0,
	"incident_description": 1,
	"repair_estimate": 2,
	"fir": 3,
}
_LABEL_PATTERN = re.compile(r"^\s*%s\s*:\s*(.+?)\s*$", re.IGNORECASE | re.MULTILINE)
_AMOUNT_PATTERN = re.compile(r"(?:INR|Rs\.?|Rupees)\s*([\d,]+)", re.IGNORECASE)


def _ordered_documents(documents: list[ClaimDocument]) -> list[ClaimDocument]:
	"""Order known primary documents before secondary evidence documents."""

	return sorted(
		documents,
		key=lambda document: (
			_DOCUMENT_PRIORITY.get(document.document_type.casefold(), len(_DOCUMENT_PRIORITY)),
			document.source_path,
		),
	)


def _label_value(documents: list[ClaimDocument], label: str) -> str | None:
	"""Return the first labelled value according to document priority."""

	pattern = re.compile(
		_LABEL_PATTERN.pattern % re.escape(label),
		re.IGNORECASE | re.MULTILINE,
	)
	for document in _ordered_documents(documents):
		match = pattern.search(document.content)
		if match:
			return match.group(1).strip()
	return None


def _amount_value(documents: list[ClaimDocument]) -> int | None:
	value = _label_value(documents, "Claim Amount")
	if value is None:
		return None
	match = _AMOUNT_PATTERN.search(value)
	if match is None:
		return None
	return int(match.group(1).replace(",", ""))


def _integer_value(documents: list[ClaimDocument], label: str) -> int | None:
	value = _label_value(documents, label)
	if value is None:
		return None
	match = re.search(r"\d+", value)
	return int(match.group(0)) if match else None


def _reported_damage(documents: list[ClaimDocument]) -> list[str] | None:
	section_pattern = re.compile(
		r"^\s*Reported Damage\s*:\s*$([\s\S]*?)(?=^\s*##|\Z)",
		re.IGNORECASE | re.MULTILINE,
	)
	for document in _ordered_documents(documents):
		section = section_pattern.search(document.content)
		if section:
			damage = [
				match.group(1).strip()
				for match in re.finditer(r"^\s*-\s+(.+?)\s*$", section.group(1), re.MULTILINE)
			]
			return damage or None
	return None


def extract_claim_metadata(documents: list[ClaimDocument]) -> ClaimMetadata:
	"""Extract representative claim metadata without resolving contradictions."""

	claim_id = next((document.claim_id for document in documents), None)
	return ClaimMetadata(
		claim_id=_label_value(documents, "Claim ID") or claim_id,
		policy_number=_label_value(documents, "Policy Number"),
		customer_name=_label_value(documents, "Name"),
		vehicle_make=_label_value(documents, "Vehicle Make"),
		vehicle_model=_label_value(documents, "Vehicle Model"),
		vehicle_year=_integer_value(documents, "Vehicle Year"),
		registration_number=_label_value(documents, "Vehicle Registration Number"),
		incident_date=_label_value(documents, "Incident Date"),
		incident_location=_label_value(documents, "Incident Location"),
		incident_type=_label_value(documents, "Incident Type"),
		driver=_label_value(documents, "Driver"),
		driving_licence_status=_label_value(documents, "Driving Licence Status"),
		reported_date=_label_value(documents, "Reported Date"),
		claim_amount=_amount_value(documents),
		reported_damage=_reported_damage(documents),
	)