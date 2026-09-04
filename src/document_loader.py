"""Local document loading and policy-clause parsing utilities."""

from pathlib import Path
import re

from src.models import ClaimDocument, PolicyClause


_POLICY_HEADING = re.compile(r"^##\s+(POL-\d{3})\s+[—-]\s+(.+?)\s*$")
_POLICY_HEADING_PREFIX = re.compile(r"^##\s+POL-")


def load_claim_documents(
	claims_root: str | Path, claim_id: str
) -> list[ClaimDocument]:
	"""Load all Markdown documents for a claim in filename order."""

	claim_directory = Path(claims_root) / claim_id
	if not claim_directory.is_dir():
		raise FileNotFoundError(
			f"Claim directory does not exist: {claim_directory}"
		)

	documents = []
	for document_path in sorted(claim_directory.glob("*.md"), key=lambda path: path.name):
		documents.append(
			ClaimDocument(
				claim_id=claim_id,
				document_type=document_path.stem,
				source_path=str(document_path),
				content=document_path.read_text(encoding="utf-8"),
			)
		)
	return documents


def load_policy_clauses(policy_path: str | Path) -> list[PolicyClause]:
	"""Parse top-level POL-### sections from a Markdown policy file."""

	path = Path(policy_path)
	if not path.is_file():
		raise FileNotFoundError(f"Policy file does not exist: {path}")

	clauses: list[PolicyClause] = []
	current_id: str | None = None
	current_title: str | None = None
	current_lines: list[str] = []

	def add_current_clause() -> None:
		if current_id is not None and current_title is not None:
			clauses.append(
				PolicyClause(
					clause_id=current_id,
					title=current_title,
					text="\n".join(current_lines).strip(),
				)
			)

	for line_number, line in enumerate(
		path.read_text(encoding="utf-8").splitlines(), start=1
	):
		if _POLICY_HEADING_PREFIX.match(line):
			heading = _POLICY_HEADING.fullmatch(line)
			if heading is None:
				raise ValueError(
					f"Malformed policy clause heading at {path}:{line_number}: {line}"
				)

			add_current_clause()
			current_id, current_title = heading.groups()
			current_lines = []
		elif current_id is not None:
			current_lines.append(line)

	add_current_clause()
	return clauses
