# ClaimLens Motor Insurance Policy

Policy Name: ClaimLens Comprehensive Motor Insurance Policy
Policy Version: 2026.1
Policy Type: Comprehensive Motor Insurance
Applicable Vehicles: Cars and Two-Wheelers

---

## POL-001 — Accidental Damage Coverage

The policy covers accidental physical damage to the insured vehicle
resulting from a sudden and unforeseen road accident or collision.

Covered examples include:
- Collision with another vehicle
- Collision with a stationary object
- Accidental impact causing physical vehicle damage

The damage must be reasonably connected to the reported accident.

---

## POL-002 — Theft Coverage

The policy covers theft of the insured vehicle when the vehicle is
reported stolen and the policyholder provides the required supporting
documentation, including a First Information Report (FIR) or equivalent
police complaint.

A theft claim without evidence of a reported theft requires further
investigation.

---

## POL-003 — Policy Exclusions

The following situations are excluded from coverage:

- Intentional damage caused by the policyholder
- Damage resulting from illegal racing or speed contests
- Damage occurring while the vehicle is being used for an unlawful purpose
- Normal wear and tear
- Mechanical or electrical failure that is not caused by an insured accident

An exclusion should only be applied when the available evidence supports
the excluded circumstance.

---

## POL-004 — Claim Reporting Window

The policyholder must notify the insurer within 30 calendar days from
the date of the reported incident.

If the claim was reported more than 30 days after the incident, the
claim requires review for late notification.

The system must not automatically reject a late claim when the reason
for the delay is not available in the submitted evidence.

---

## POL-005 — Required Claim Documents

For an accident-related claim, the following documents are required:

1. Claim Form
2. Customer Incident Description
3. Repair Estimate or other repair-related evidence

For a theft-related claim, the following documents are required:

1. Claim Form
2. Customer Incident Description
3. FIR or police complaint

If a required document is missing, the claim should be marked as
incomplete and the missing document should be identified.

---

## POL-006 — Insured Declared Value

The maximum claim settlement for a covered total-loss or theft claim
must not exceed the Insured Declared Value (IDV) recorded in the policy.

For repair claims, the repair estimate must be evaluated against the
policy coverage and applicable limits.

A claim amount above the applicable insured value requires investigator
review.

---

## POL-007 — Deductible

A standard deductible of INR 2,000 applies to covered accident repair
claims.

The deductible is applied to the eligible claim amount during settlement.

The deductible does not determine whether an incident is covered.

---

## POL-008 — Valid Driving Licence

For an accident claim, the driver must have held a valid driving licence
for the relevant vehicle category at the time of the incident.

If the submitted documents indicate that the driver did not have a valid
licence, the claim requires review under the applicable policy conditions.

If licence information is not provided, the system must identify it as
missing information rather than assuming that the driver was unlicensed.

---

## POL-009 — Intoxication Exclusion

Damage resulting from an accident while the driver was under the
influence of alcohol or prohibited substances is excluded.

The system must not infer intoxication from the existence of an accident
alone.

Evidence of intoxication must be present in the submitted documents or
other available evidence before this exclusion is applied.

---

## POL-010 — Intentional Damage Exclusion

Damage intentionally caused by the policyholder is excluded.

The system must not classify a claim as intentional damage solely because
the repair cost is high or because documents contain an unusual item.

Evidence supporting intentional damage is required.

---

## POL-011 — Document Consistency Requirement

Information provided across the claim form, customer incident
description, repair estimate, and FIR must be materially consistent.

The following fields should be checked when available:

- Claim ID
- Vehicle registration number
- Vehicle make and model
- Incident date
- Incident type
- Location
- Description of damage
- Reported claim amount
- Repair amount

Material contradictions must be surfaced to the investigator.

The system must not silently choose one conflicting value and discard
the other.

---

## POL-012 — Damage-Evidence Consistency

The claimed damage should be reasonably supported by the incident
description and available repair evidence.

For example, if the incident description reports minor front bumper
damage but the repair estimate contains major engine replacement, the
difference should be flagged for investigator review.

The system must not assume that unsupported damage is covered.

---

## POL-013 — Missing or Uncertain Evidence

When required information is unavailable, contradictory, or insufficient
to establish whether a policy condition applies, the system must not
invent missing facts.

The claim should instead be escalated to the investigator with:

- The missing or conflicting information
- The documents involved
- The relevant policy clause
- The reason additional review is required

---

## POL-014 — Investigation Recommendation

The evidence review assistant may produce one of the following
recommendations:

### APPROVE

Use only when the submitted evidence is sufficiently complete and
consistent, the applicable policy conditions are satisfied, and no
material contradiction or exclusion is identified.

### REJECT

Use when the available evidence clearly establishes that the claim is
blocked by an applicable policy exclusion or other policy condition.

### REQUEST INFORMATION

Use when a required document or material information is missing and the
claim cannot yet be evaluated completely.

### ESCALATE TO INVESTIGATOR

Use when the evidence is contradictory, ambiguous, or insufficient for a
reliable automated recommendation.

The final claim decision remains with the human investigator.