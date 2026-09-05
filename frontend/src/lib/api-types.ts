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

export type ClaimMetadata = {
  claim_id: string | null;
  policy_number: string | null;
  customer_name: string | null;
  vehicle_make: string | null;
  vehicle_model: string | null;
  vehicle_year: number | null;
  registration_number: string | null;
  incident_date: string | null;
  incident_location: string | null;
  incident_type: string | null;
  driver: string | null;
  driving_licence_status: string | null;
  reported_date: string | null;
  claim_amount: number | null;
  reported_damage: string[] | null;
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
  claim_metadata?: ClaimMetadata | null;
};

export type ClaimsListResponse = {
  claims: string[];
};

export type HealthResponse = {
  status: string;
};