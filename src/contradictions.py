"""Deterministic contradiction detection across claim documents."""

from datetime import date, datetime
import re

from src.models import ClaimDocument, Contradiction


_DATE_FORMATS = ("%d-%b-%Y", "%d/%m/%Y", "%Y-%m-%d")
_DATE_PATTERN = r"\d{1,2}-[A-Za-z]{3}-\d{4}|\d{1,2}/\d{1,2}/\d{4}|\d{4}-\d{2}-\d{2}"
_DAMAGE_PATTERN = re.compile(
    r"\b(?P<location>front-left|front-right|rear-left|rear-right|"
    r"front|rear|left|right|side)?\s*"
    r"(?P<component>bumper|headlight|fender|door|engine|windshield|"
    r"window|bonnet|hood|mirror|wheel|tyre|tire|radiator|grille|tail light)\b",
    re.IGNORECASE,
)


def _parse_date(value: str) -> date | None:
    for format_ in _DATE_FORMATS:
        try:
            return datetime.strptime(value, format_).date()
        except ValueError:
            continue
    return None


def _labeled_dates(document: ClaimDocument, label: str) -> list[tuple[date, str]]:
    pattern = re.compile(
        rf"{re.escape(label)}\s*:\s*({_DATE_PATTERN})", re.IGNORECASE
    )
    values: list[tuple[date, str]] = []
    for match in pattern.finditer(document.content):
        parsed = _parse_date(match.group(1))
        if parsed is not None:
            values.append((parsed, document.source_path))
    return values


def _labeled_amounts(document: ClaimDocument) -> list[tuple[float, str]]:
    pattern = re.compile(
        r"claim\s+amount\s*:\s*(?:(?:INR|Rs\.?|Rupees)\s*)?"
        r"(\d[\d,]*(?:\.\d+)?)\b",
        re.IGNORECASE,
    )
    return [
        (float(match.group(1).replace(",", "")), document.source_path)
        for match in pattern.finditer(document.content)
    ]


def _damage_items(document: ClaimDocument) -> set[tuple[str, str]]:
    return {
        (
            (match.group("location") or "unspecified").casefold(),
            match.group("component").casefold(),
        )
        for match in _DAMAGE_PATTERN.finditer(document.content)
    }


def _value_contradictions(
    values: list[tuple[object, str]],
    description: str,
    severity: str,
) -> list[Contradiction]:
    contradictions: list[Contradiction] = []
    seen: set[tuple[object, object, str, str]] = set()
    for index, (value_a, source_a) in enumerate(values):
        for value_b, source_b in values[index + 1 :]:
            if source_a == source_b or value_a == value_b:
                continue
            key = (value_a, value_b, source_a, source_b)
            if key in seen:
                continue
            seen.add(key)
            contradictions.append(
                Contradiction(
                    description=f"{description}: {value_a} in {source_a} conflicts with {value_b} in {source_b}.",
                    source_a=source_a,
                    source_b=source_b,
                    severity=severity,
                )
            )
    return contradictions


def _damage_contradictions(
    documents: list[ClaimDocument],
) -> list[Contradiction]:
    items_by_document = [
        (document, _damage_items(document))
        for document in documents
    ]
    items_by_document = [entry for entry in items_by_document if entry[1]]
    contradictions: list[Contradiction] = []

    for index, (document_a, items_a) in enumerate(items_by_document):
        for document_b, items_b in items_by_document[index + 1 :]:
            components_a = {component for _, component in items_a}
            components_b = {component for _, component in items_b}
            for component in sorted(components_a & components_b):
                locations_a = {location for location, item in items_a if item == component}
                locations_b = {location for location, item in items_b if item == component}
                for location_a in sorted(locations_a):
                    for location_b in sorted(locations_b):
                        if location_a == location_b:
                            continue
                        contradictions.append(
                            Contradiction(
                                description=(
                                    f"Conflicting damage location for {component}: "
                                    f"{location_a} in {document_a.source_path} conflicts "
                                    f"with {location_b} in {document_b.source_path}."
                                ),
                                source_a=document_a.source_path,
                                source_b=document_b.source_path,
                                severity="HIGH",
                            )
                        )
    return contradictions


def detect_contradictions(documents: list[ClaimDocument]) -> list[Contradiction]:
    """Find explicit conflicts in dates, amounts, and damage descriptions."""

    incident_dates = [
        value
        for document in documents
        for value in _labeled_dates(document, "Incident Date")
    ]
    reported_dates = [
        value
        for document in documents
        for value in _labeled_dates(document, "Reported Date")
    ]
    claim_amounts = [
        value
        for document in documents
        for value in _labeled_amounts(document)
    ]

    contradictions = _value_contradictions(
        incident_dates,
        "Conflicting incident dates",
        "HIGH",
    )
    contradictions.extend(
        _value_contradictions(
            reported_dates,
            "Conflicting reported dates",
            "MEDIUM",
        )
    )
    contradictions.extend(
        _value_contradictions(
            claim_amounts,
            "Conflicting claim amounts",
            "HIGH",
        )
    )
    contradictions.extend(_damage_contradictions(documents))
    return contradictions