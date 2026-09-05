import type { Claim, DecisionStatus, Finding, FindingStatus } from "./mock-data";
import type {
  ClaimMetadata,
  ClaimReview,
  Contradiction as ApiContradiction,
  EvidenceItem,
  RuleFinding,
} from "./api-types";

export type AdaptedFindingStatus = FindingStatus | "NOT_APPLICABLE" | "APPLICABLE";
export type AdaptedDecisionStatus = DecisionStatus | "REJECT";

export type AdaptedFinding = Omit<Finding, "status"> & {
  status: AdaptedFindingStatus;
  evidence: AdaptedEvidence[];
};

export type AdaptedEvidence = {
  statement: string;
  sourceDocument: string;
  evidenceType: string;
};

export type AdaptedContradiction = {
  id: string;
  conflict: string;
  documentA: { name: string; excerpt: string };
  documentB: { name: string; excerpt: string };
  severity: string;
};

export type AdaptedDocument = {
  id: string;
  sourcePath: string;
};

export type AdaptedClaim = Omit<
  Claim,
  | "status"
  | "amount"
  | "incidentSummary"
  | "incidentDate"
  | "reportedDate"
  | "location"
  | "customer"
  | "vehicle"
  | "registration"
  | "policyNumber"
  | "completeness"
  | "consistency"
  | "policy"
  | "contradictions"
  | "recommendation"
  | "documents"
> & {
  amount: number | null;
  customer: string;
  vehicle: string;
  vehicleYear: number | null;
  registration: string;
  policyNumber: string;
  incidentDate: string;
  reportedDate: string;
  location: string;
  incidentSummary: string;
  incidentType: string;
  driver: string;
  drivingLicenceStatus: string;
  reportedDamage: string[];
  documents: AdaptedDocument[];
  status: AdaptedDecisionStatus | string;
  completeness: AdaptedFinding[];
  consistency: AdaptedFinding[];
  policy: AdaptedFinding[];
  contradictions: AdaptedContradiction[];
  recommendation: {
    decision: AdaptedDecisionStatus | string;
    confidence?: number;
    rationale: string;
    evidence: string[];
    nextSteps: string[];
  };
};

const findingStatuses = new Set<AdaptedFindingStatus>([
  "PASS",
  "FAIL",
  "MISSING",
  "UNKNOWN",
  "NOT_APPLICABLE",
  "APPLICABLE",
]);

const decisionStatuses = new Set<AdaptedDecisionStatus>([
  "APPROVE",
  "REJECT",
  "REQUEST INFORMATION",
  "ESCALATE TO INVESTIGATOR",
]);

function mapFindingStatus(status: string): AdaptedFindingStatus | string {
  return findingStatuses.has(status as AdaptedFindingStatus)
    ? (status as AdaptedFindingStatus)
    : status;
}

function mapDecisionStatus(status: string): AdaptedDecisionStatus | string {
  return decisionStatuses.has(status as AdaptedDecisionStatus)
    ? (status as AdaptedDecisionStatus)
    : status;
}

function adaptEvidence(item: EvidenceItem): AdaptedEvidence {
  return {
    statement: item.statement,
    sourceDocument: item.source_document,
    evidenceType: item.evidence_type,
  };
}

function sourceFor(finding: RuleFinding): string {
  return finding.evidence.map((item) => item.source_document).join("; ");
}

function adaptFinding(finding: RuleFinding): AdaptedFinding {
  return {
    id: finding.rule_id,
    title: finding.rule_id,
    status: mapFindingStatus(finding.status),
    detail: finding.description,
    source: sourceFor(finding),
    evidence: finding.evidence.map(adaptEvidence),
  };
}

function adaptContradiction(
  contradiction: ApiContradiction,
  index: number,
  evidence: AdaptedEvidence[],
): AdaptedContradiction {
  const evidenceFor = (sourcePath: string) =>
    evidence
      .filter((item) => item.sourceDocument === sourcePath)
      .map((item) => item.statement);
  return {
    id: `contradiction-${index + 1}`,
    conflict: contradiction.description,
    documentA: { name: contradiction.source_a, excerpt: evidenceFor(contradiction.source_a).join("\n") },
    documentB: { name: contradiction.source_b, excerpt: evidenceFor(contradiction.source_b).join("\n") },
    severity: contradiction.severity,
  };
}

function joinVehicle(metadata: ClaimMetadata | null | undefined): string {
  return [metadata?.vehicle_make, metadata?.vehicle_model]
    .filter((value): value is string => Boolean(value))
    .join(" ");
}

export function adaptClaimReview(review: ClaimReview): AdaptedClaim {
  const decision = mapDecisionStatus(review.recommendation);
  const metadata = review.claim_metadata;
  const reportedDamage = metadata?.reported_damage ?? [];
  const allFindings = [
    ...review.completeness_findings,
    ...review.consistency_findings,
    ...review.policy_findings,
  ];
  const allEvidence = allFindings.flatMap((finding) => finding.evidence.map(adaptEvidence));
  const documents = [...new Set(allEvidence.map((item) => item.sourceDocument))].map((sourcePath) => ({
    id: sourcePath,
    sourcePath,
  }));
  const completeness = review.completeness_findings.map(adaptFinding);
  const consistency = review.consistency_findings.map(adaptFinding);
  const policy = review.policy_findings.map(adaptFinding);
  return {
    id: review.claim_id,
    customer: metadata?.customer_name ?? "",
    vehicle: joinVehicle(metadata),
    vehicleYear: metadata?.vehicle_year ?? null,
    registration: metadata?.registration_number ?? "",
    policyNumber: metadata?.policy_number ?? "",
    amount: metadata?.claim_amount ?? null,
    status: decision,
    incidentDate: metadata?.incident_date ?? "",
    reportedDate: metadata?.reported_date ?? "",
    location: metadata?.incident_location ?? "",
    incidentSummary: reportedDamage.join(", "),
    incidentType: metadata?.incident_type ?? "",
    driver: metadata?.driver ?? "",
    drivingLicenceStatus: metadata?.driving_licence_status ?? "",
    reportedDamage,
    surveyor: "",
    garage: "",
    documents,
    completeness,
    consistency,
    policy,
    contradictions: review.contradictions.map((contradiction, index) =>
      adaptContradiction(contradiction, index, allEvidence),
    ),
    recommendation: {
      decision,
      rationale: review.rationale,
      evidence: [],
      nextSteps: [],
    },
  };
}