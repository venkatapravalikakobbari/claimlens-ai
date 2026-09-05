import type { Claim, DecisionStatus, Finding, FindingStatus } from "./mock-data";
import type {
  ClaimReview,
  Contradiction as ApiContradiction,
  RuleFinding,
} from "./api-types";

export type AdaptedFindingStatus = FindingStatus | "NOT_APPLICABLE" | "APPLICABLE";
export type AdaptedDecisionStatus = DecisionStatus | "REJECT";

export type AdaptedFinding = Omit<Finding, "status"> & {
  status: AdaptedFindingStatus;
};

export type AdaptedContradiction = {
  id: string;
  conflict: string;
  documentA: { name: string; excerpt: string };
  documentB: { name: string; excerpt: string };
  severity: string;
};

export type AdaptedClaim = Omit<
  Claim,
  | "status"
  | "completeness"
  | "consistency"
  | "policy"
  | "contradictions"
  | "recommendation"
> & {
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
  };
}

function adaptContradiction(
  contradiction: ApiContradiction,
  index: number,
): AdaptedContradiction {
  return {
    id: `contradiction-${index + 1}`,
    conflict: contradiction.description,
    documentA: { name: contradiction.source_a, excerpt: "" },
    documentB: { name: contradiction.source_b, excerpt: "" },
    severity: contradiction.severity,
  };
}

export function adaptClaimReview(review: ClaimReview): AdaptedClaim {
  const decision = mapDecisionStatus(review.recommendation);
  return {
    id: review.claim_id,
    customer: "",
    vehicle: "",
    registration: "",
    policyNumber: "",
    amount: 0,
    status: decision,
    incidentDate: "",
    reportedDate: "",
    location: "",
    incidentSummary: "",
    surveyor: "",
    garage: "",
    documents: [],
    completeness: review.completeness_findings.map(adaptFinding),
    consistency: review.consistency_findings.map(adaptFinding),
    policy: review.policy_findings.map(adaptFinding),
    contradictions: review.contradictions.map(adaptContradiction),
    recommendation: {
      decision,
      rationale: review.rationale,
      evidence: [],
      nextSteps: [],
    },
  };
}