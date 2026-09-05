export type FindingStatus = "PASS" | "FAIL" | "MISSING" | "UNKNOWN" | "ESCALATE";
export type DecisionStatus = "APPROVE" | "ESCALATE TO INVESTIGATOR" | "REQUEST INFORMATION";
export type Severity = "HIGH" | "MEDIUM" | "LOW";

export type Finding = {
  id: string;
  title: string;
  status: FindingStatus;
  detail: string;
  source: string;
};

export type Contradiction = {
  id: string;
  conflict: string;
  documentA: { name: string; excerpt: string };
  documentB: { name: string; excerpt: string };
  severity: Severity;
};

export type EvidenceDocument = {
  id: string;
  name: string;
  type: string;
  pages: number;
  received: string;
  status: FindingStatus;
};

export type Claim = {
  id: string;
  customer: string;
  vehicle: string;
  registration: string;
  policyNumber: string;
  amount: number;
  status: DecisionStatus;
  incidentDate: string;
  reportedDate: string;
  location: string;
  incidentSummary: string;
  surveyor: string;
  garage: string;
  documents: EvidenceDocument[];
  completeness: Finding[];
  consistency: Finding[];
  policy: Finding[];
  contradictions: Contradiction[];
  recommendation: {
    decision: DecisionStatus;
    confidence: number;
    rationale: string;
    evidence: string[];
    nextSteps: string[];
  };
};

export const formatINR = (value: number) =>
  "₹" + value.toLocaleString("en-IN", { maximumFractionDigits: 0 });

export const claims: Claim[] = [
  {
    id: "CLM-001",
    customer: "Rahul Mehta",
    vehicle: "Hyundai i20",
    registration: "MH 12 KP 4471",
    policyNumber: "POL-MTR-8842190",
    amount: 45000,
    status: "APPROVE",
    incidentDate: "12 Aug 2026",
    reportedDate: "12 Aug 2026",
    location: "Baner Road, Pune, Maharashtra",
    incidentSummary:
      "Rear-end collision at a signal on Baner Road. Third-party vehicle struck the insured vehicle from behind, damaging the rear bumper, tail lamp assembly and boot lid. No injuries reported.",
    surveyor: "S. Kulkarni (IRDAI SLA-22841)",
    garage: "Sai Motors Authorised Service, Pune",
    documents: [
      { id: "d1", name: "First Information Report (FIR)", type: "PDF", pages: 3, received: "12 Aug 2026", status: "PASS" },
      { id: "d2", name: "Surveyor Assessment Report", type: "PDF", pages: 8, received: "14 Aug 2026", status: "PASS" },
      { id: "d3", name: "Garage Repair Estimate", type: "PDF", pages: 4, received: "14 Aug 2026", status: "PASS" },
      { id: "d4", name: "Damage Photographs (11 images)", type: "JPG", pages: 11, received: "12 Aug 2026", status: "PASS" },
      { id: "d5", name: "Driving Licence Copy", type: "PDF", pages: 1, received: "13 Aug 2026", status: "PASS" },
      { id: "d6", name: "Policy Schedule", type: "PDF", pages: 2, received: "12 Aug 2026", status: "PASS" },
    ],
    completeness: [
      { id: "c1", title: "All mandatory documents submitted", status: "PASS", detail: "6 of 6 mandatory documents received within the 7-day submission window.", source: "Document intake log" },
      { id: "c2", title: "Damage photographs cover all impacted panels", status: "PASS", detail: "11 photographs cover rear bumper, tail lamp and boot lid from four angles.", source: "Damage Photographs" },
      { id: "c3", title: "Driving licence valid on incident date", status: "PASS", detail: "Licence MH0120110045612 valid until 2031-04-18.", source: "Driving Licence Copy" },
      { id: "c4", title: "Third-party contact details recorded", status: "UNKNOWN", detail: "Third-party insurer name captured, but policy number not legible in the FIR scan.", source: "FIR, page 2" },
    ],
    consistency: [
      { id: "s1", title: "Incident date consistent across documents", status: "PASS", detail: "FIR, surveyor report and claim form all state 12 Aug 2026.", source: "FIR / Surveyor Report / Claim Form" },
      { id: "s2", title: "Damage description matches photographs", status: "PASS", detail: "Rear-impact damage described in the surveyor report is visible in photographs 3–9.", source: "Surveyor Report, section 4" },
      { id: "s3", title: "Repair estimate aligns with assessed damage", status: "PASS", detail: "Estimate of ₹47,200 assessed down to ₹45,000 after depreciation on plastic parts.", source: "Garage Repair Estimate" },
    ],
    policy: [
      { id: "p1", title: "Policy active on incident date", status: "PASS", detail: "Own-damage cover active from 02 Feb 2026 to 01 Feb 2027.", source: "Policy Schedule" },
      { id: "p2", title: "Claim within sum insured", status: "PASS", detail: "Claim of ₹45,000 is within the IDV of ₹6,10,000.", source: "Policy Schedule" },
      { id: "p3", title: "Compulsory deductible applied", status: "PASS", detail: "₹1,000 compulsory excess applied to the settlement working.", source: "Surveyor Report, annexure B" },
    ],
    contradictions: [],
    recommendation: {
      decision: "APPROVE",
      confidence: 92,
      rationale:
        "Documentation is complete, the damage pattern is consistent with a rear-end collision, and the assessed amount sits well within policy limits. No contradictions were detected across submitted evidence.",
      evidence: [
        "Surveyor Assessment Report, section 4 — damage consistent with rear impact",
        "Garage Repair Estimate — parts and labour within schedule rates",
        "Policy Schedule — cover active, claim within IDV",
      ],
      nextSteps: [
        "Confirm the third-party insurer policy number for recovery purposes",
        "Release settlement of ₹45,000 net of the ₹1,000 compulsory excess",
      ],
    },
  },
  {
    id: "CLM-002",
    customer: "Arjun Rao",
    vehicle: "Honda City",
    registration: "KA 05 MJ 9023",
    policyNumber: "POL-MTR-7719044",
    amount: 72000,
    status: "ESCALATE TO INVESTIGATOR",
    incidentDate: "27 Jul 2026",
    reportedDate: "31 Jul 2026",
    location: "Hosur Road, Bengaluru, Karnataka",
    incidentSummary:
      "Single-vehicle night-time collision with a road divider reported four days after the stated incident date. Front-left structural damage claimed, including bumper, headlamp, fender and radiator support.",
    surveyor: "P. Nair (IRDAI SLA-19004)",
    garage: "Prime Auto Works, Bengaluru",
    documents: [
      { id: "d1", name: "Claim Intimation Form", type: "PDF", pages: 2, received: "31 Jul 2026", status: "PASS" },
      { id: "d2", name: "Surveyor Assessment Report", type: "PDF", pages: 9, received: "03 Aug 2026", status: "PASS" },
      { id: "d3", name: "Garage Repair Estimate", type: "PDF", pages: 5, received: "03 Aug 2026", status: "FAIL" },
      { id: "d4", name: "Damage Photographs (6 images)", type: "JPG", pages: 6, received: "31 Jul 2026", status: "UNKNOWN" },
      { id: "d5", name: "Police Report", type: "PDF", pages: 0, received: "—", status: "MISSING" },
      { id: "d6", name: "Policy Schedule", type: "PDF", pages: 2, received: "31 Jul 2026", status: "PASS" },
    ],
    completeness: [
      { id: "c1", title: "Police report for structural damage", status: "MISSING", detail: "Structural damage above ₹50,000 requires a police report; none has been submitted.", source: "Document intake log" },
      { id: "c2", title: "Photograph metadata available", status: "UNKNOWN", detail: "EXIF timestamps have been stripped from all six images; capture time cannot be verified.", source: "Damage Photographs" },
      { id: "c3", title: "Claim intimation within 72 hours", status: "FAIL", detail: "Incident stated as 27 Jul 2026; intimation received 31 Jul 2026 (96 hours).", source: "Claim Intimation Form" },
      { id: "c4", title: "Policy schedule submitted", status: "PASS", detail: "Current-year schedule submitted and matches the registration number.", source: "Policy Schedule" },
    ],
    consistency: [
      { id: "s1", title: "Incident date consistent across documents", status: "FAIL", detail: "Claim form states 27 Jul 2026 while the garage job card records the vehicle arriving 25 Jul 2026.", source: "Claim Intimation Form vs Garage Job Card" },
      { id: "s2", title: "Damage pattern matches stated cause", status: "ESCALATE", detail: "Photographs show front-left impact plus unrelated rear-quarter scoring not explained by a divider collision.", source: "Damage Photographs 2 and 5" },
      { id: "s3", title: "Estimate line items match assessed damage", status: "FAIL", detail: "Estimate includes an infotainment unit and alloy wheel not listed in the surveyor's damage schedule.", source: "Garage Repair Estimate, lines 14–17" },
      { id: "s4", title: "Driver identity consistent", status: "UNKNOWN", detail: "Claim form names the policyholder as driver; the surveyor report references a family member.", source: "Surveyor Report, section 2" },
    ],
    policy: [
      { id: "p1", title: "Policy active on incident date", status: "PASS", detail: "Cover active from 11 Mar 2026 to 10 Mar 2027.", source: "Policy Schedule" },
      { id: "p2", title: "Late intimation clause", status: "FAIL", detail: "Clause 7(b) requires intimation within 72 hours; breach recorded.", source: "Policy Schedule, clause 7(b)" },
      { id: "p3", title: "Prior claim history", status: "ESCALATE", detail: "Two own-damage claims settled in the last 14 months on the same policy.", source: "Internal claim history" },
    ],
    contradictions: [
      {
        id: "x1",
        conflict: "Incident date differs by two days",
        documentA: { name: "Claim Intimation Form", excerpt: "Date of loss: 27 July 2026, approx. 22:40 hrs." },
        documentB: { name: "Garage Job Card", excerpt: "Vehicle received at workshop on 25 July 2026, 09:15 hrs." },
        severity: "HIGH",
      },
      {
        id: "x2",
        conflict: "Repair estimate includes parts not present in the damage assessment",
        documentA: { name: "Garage Repair Estimate", excerpt: "Line 14: Infotainment head unit replacement — ₹18,400. Line 17: Alloy wheel (front right) — ₹9,200." },
        documentB: { name: "Surveyor Assessment Report", excerpt: "Damage limited to front-left bumper, headlamp, fender and radiator support." },
        severity: "HIGH",
      },
      {
        id: "x3",
        conflict: "Driver identity is stated differently",
        documentA: { name: "Claim Intimation Form", excerpt: "Driver at time of loss: Arjun Rao (policyholder)." },
        documentB: { name: "Surveyor Assessment Report", excerpt: "Insured stated the vehicle was being driven by his brother at the time of the incident." },
        severity: "MEDIUM",
      },
    ],
    recommendation: {
      decision: "ESCALATE TO INVESTIGATOR",
      confidence: 88,
      rationale:
        "Three contradictions across independent documents, a missing police report and an estimate containing unrelated parts together indicate a material risk of misrepresentation. The file should not be settled without a field investigation.",
      evidence: [
        "Garage Job Card — vehicle received two days before the stated loss date",
        "Garage Repair Estimate, lines 14–17 — parts absent from the surveyor's damage schedule",
        "Damage Photographs 2 and 5 — rear-quarter damage unrelated to the stated cause",
      ],
      nextSteps: [
        "Assign a field investigator to verify the loss location and timeline",
        "Obtain the police report and an unedited copy of the garage job card",
        "Record a statement from the driver identified in the surveyor report",
      ],
    },
  },
  {
    id: "CLM-003",
    customer: "Neha Sharma",
    vehicle: "Maruti Suzuki Baleno",
    registration: "DL 3C BM 5580",
    policyNumber: "POL-MTR-9034512",
    amount: 38000,
    status: "REQUEST INFORMATION",
    incidentDate: "04 Aug 2026",
    reportedDate: "05 Aug 2026",
    location: "Dwarka Sector 12, New Delhi",
    incidentSummary:
      "Side-impact damage sustained in a parking area. Left front door, mirror assembly and quarter panel affected. Third-party vehicle left the scene before details were exchanged.",
    surveyor: "Pending allocation",
    garage: "Nexa Service Centre, Dwarka",
    documents: [
      { id: "d1", name: "Claim Intimation Form", type: "PDF", pages: 2, received: "05 Aug 2026", status: "PASS" },
      { id: "d2", name: "Damage Photographs (4 images)", type: "JPG", pages: 4, received: "05 Aug 2026", status: "PASS" },
      { id: "d3", name: "Garage Repair Estimate", type: "PDF", pages: 3, received: "07 Aug 2026", status: "PASS" },
      { id: "d4", name: "Surveyor Assessment Report", type: "PDF", pages: 0, received: "—", status: "MISSING" },
      { id: "d5", name: "Police Complaint / NCR Copy", type: "PDF", pages: 0, received: "—", status: "MISSING" },
      { id: "d6", name: "Policy Schedule", type: "PDF", pages: 2, received: "05 Aug 2026", status: "PASS" },
    ],
    completeness: [
      { id: "c1", title: "Surveyor assessment report", status: "MISSING", detail: "No surveyor has been allocated; assessment is required before settlement.", source: "Document intake log" },
      { id: "c2", title: "Police complaint for hit-and-run", status: "MISSING", detail: "Third-party left the scene; an NCR copy is required under the hit-and-run process.", source: "Claim Intimation Form" },
      { id: "c3", title: "Damage photographs submitted", status: "PASS", detail: "Four photographs cover the left door, mirror and quarter panel.", source: "Damage Photographs" },
      { id: "c4", title: "Repair estimate submitted", status: "PASS", detail: "Estimate of ₹38,000 received from an authorised network garage.", source: "Garage Repair Estimate" },
    ],
    consistency: [
      { id: "s1", title: "Damage location consistent across documents", status: "PASS", detail: "Left-side damage is described identically in the claim form, photographs and estimate.", source: "Claim Form / Photographs / Estimate" },
      { id: "s2", title: "Estimate value proportionate to visible damage", status: "UNKNOWN", detail: "Cannot be confirmed without an independent surveyor assessment.", source: "Garage Repair Estimate" },
      { id: "s3", title: "Incident time consistent", status: "PASS", detail: "Claim form and garage intake both record the evening of 04 Aug 2026.", source: "Claim Intimation Form" },
    ],
    policy: [
      { id: "p1", title: "Policy active on incident date", status: "PASS", detail: "Cover active from 19 Jan 2026 to 18 Jan 2027.", source: "Policy Schedule" },
      { id: "p2", title: "Claim within sum insured", status: "PASS", detail: "Claim of ₹38,000 is within the IDV of ₹5,45,000.", source: "Policy Schedule" },
      { id: "p3", title: "No-claim bonus impact", status: "UNKNOWN", detail: "NCB protection add-on status cannot be confirmed from the submitted schedule pages.", source: "Policy Schedule, page 2" },
    ],
    contradictions: [
      {
        id: "x1",
        conflict: "Estimate lists a part replacement where photographs suggest a repairable panel",
        documentA: { name: "Garage Repair Estimate", excerpt: "Left front door — replacement assembly, ₹21,500." },
        documentB: { name: "Damage Photographs (image 3)", excerpt: "Door shows dent and paint scoring; no visible tear or structural deformation." },
        severity: "LOW",
      },
    ],
    recommendation: {
      decision: "REQUEST INFORMATION",
      confidence: 79,
      rationale:
        "The evidence submitted so far is internally consistent, but two mandatory documents are outstanding. A decision cannot be evidence-grounded until the surveyor assessment and the police complaint copy are on file.",
      evidence: [
        "Document intake log — surveyor report and NCR copy not received",
        "Damage Photographs image 3 — panel appears repairable rather than replaceable",
        "Policy Schedule — cover active and claim within IDV",
      ],
      nextSteps: [
        "Allocate a surveyor and obtain an independent damage assessment",
        "Request the NCR copy from the customer for the hit-and-run incident",
        "Ask the garage to justify door replacement versus panel repair",
      ],
    },
  },
];

export const getClaim = (id: string) => claims.find((c) => c.id.toLowerCase() === id.toLowerCase());

export const dashboardStats = {
  total: 3,
  pending: 1,
  needsInfo: 1,
  escalated: 1,
};
