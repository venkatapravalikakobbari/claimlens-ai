export type FindingStatus =
  | "PASS"
  | "FAIL"
  | "MISSING"
  | "UNKNOWN"
  | "NOT_APPLICABLE"
  | "APPLICABLE";

export type Recommendation =
  | "APPROVE"
  | "REJECT"
  | "REQUEST INFORMATION"
  | "ESCALATE TO INVESTIGATOR";

export type ClaimDocument = {
  claim_id: string;
  document_type: string;
  source_path: string;
  content: string;
};

export type EvidenceItem = {
  claim_id: string;
  statement: string;
  source_document: string;
  evidence_type: string;
};

export type PolicyClause = {
  clause_id: string;
  title: string;
  text: string;
};

export type RuleFinding = {
  rule_id: string;
  description: string;
  status: FindingStatus;
  evidence: EvidenceItem[];
};

export type Contradiction = {
  description: string;
  source_a: string;
  source_b: string;
  severity: string;
};

export type ClaimReview = {
  claim_id: string;
  completeness_findings: RuleFinding[];
  consistency_findings: RuleFinding[];
  policy_findings: RuleFinding[];
  contradictions: Contradiction[];
  retrieved_policy_clauses: PolicyClause[];
  recommendation: Recommendation | string;
  rationale: string;
};

export type ClaimsListResponse = {
  claims: string[];
};

export type HealthResponse = {
  status: string;
};