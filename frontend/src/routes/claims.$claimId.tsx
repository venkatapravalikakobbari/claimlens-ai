import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, CheckCircle2, FileText, ShieldAlert, MessageSquareWarning } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ContradictionCard } from "@/components/ContradictionCard";
import { FindingCard } from "@/components/FindingCard";
import { StatusBadge } from "@/components/StatusBadge";
import { ApiError, getClaimReview } from "@/lib/api";
import {
  adaptClaimReview,
  type AdaptedClaim,
  type AdaptedFinding,
} from "@/lib/claim-adapter";
import type { FindingStatus } from "@/lib/mock-data";

export const Route = createFileRoute("/claims/$claimId")({
  loader: async ({ params }) => {
    try {
      const review = await getClaimReview(params.claimId);
      return { claim: adaptClaimReview(review), policyClauses: review.retrieved_policy_clauses };
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        throw notFound();
      }
      throw error;
    }
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Claim unavailable — ClaimLens AI" }, { name: "robots", content: "noindex" }] };
    }
    const { claim } = loaderData;
    const title = claim.customer
      ? `${claim.id} · ${claim.customer} — ClaimLens AI`
      : `${claim.id} — ClaimLens AI`;
    const description = `Evidence review for ${claim.id}.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: ClaimReview,
  pendingComponent: ClaimReviewPending,
  errorComponent: ClaimReviewError,
  notFoundComponent: ClaimNotFound,
});

function ClaimReviewPending() {
  return <RouteMessage title="Loading claim review" detail="Retrieving the latest evidence review from ClaimLens AI." />;
}

function ClaimReviewError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <RouteMessage
      title="Unable to load claim review"
      detail={error.message || "The claim review API returned an unexpected error."}
      action={<Button onClick={reset}>Try again</Button>}
    />
  );
}

function ClaimNotFound() {
  return (
    <RouteMessage
      title="Claim not found"
      detail="The requested claim is not available in the backend claim register."
      action={
        <Button asChild variant="outline">
          <Link to="/claims">Back to claims</Link>
        </Button>
      }
    />
  );
}

function RouteMessage({
  title,
  detail,
  action,
}: {
  title: string;
  detail: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-[32rem] max-w-xl items-center justify-center px-4">
      <div className="w-full rounded-lg border border-border bg-card p-6 text-center">
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{detail}</p>
        {action ? <div className="mt-5">{action}</div> : null}
      </div>
    </div>
  );
}

function Section({
  step,
  title,
  description,
  children,
}: {
  step: number;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded border border-border bg-card text-xs font-semibold text-muted-foreground">
          {step}
        </span>
        <div>
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        </div>
      </div>
      <div className="pl-0 md:pl-9">{children}</div>
    </section>
  );
}

function Overview({ claim }: { claim: AdaptedClaim }) {
  const rows: [string, string][] = [
    ["Policy number", claim.policyNumber || "Unavailable from API"],
    ["Vehicle", claim.vehicle ? `${claim.vehicle} · ${claim.registration}` : "Unavailable from API"],
    ["Claim amount", "Unavailable from API"],
    ["Incident date", claim.incidentDate || "Unavailable from API"],
    ["Reported date", claim.reportedDate || "Unavailable from API"],
    ["Loss location", claim.location || "Unavailable from API"],
    ["Surveyor", claim.surveyor || "Unavailable from API"],
    ["Repair garage", claim.garage || "Unavailable from API"],
  ];
  return (
    <div className="rounded-lg border border-border bg-card">
      <dl className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
        {rows.map(([label, value]) => (
          <div key={label} className="bg-card px-4 py-3">
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="mt-0.5 text-sm font-medium text-foreground">{value}</dd>
          </div>
        ))}
      </dl>
      <div className="border-t border-border px-4 py-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Incident summary</p>
        <p className="mt-1.5 text-sm leading-relaxed text-foreground">
          {claim.incidentSummary || "Unavailable from API"}
        </p>
      </div>
    </div>
  );
}

function DecisionPanel({ claim }: { claim: AdaptedClaim }) {
  const [decision, setDecision] = useState<DecisionStatus | null>(null);
  const [notes, setNotes] = useState("");

  const options: { value: DecisionStatus; label: string; icon: typeof CheckCircle2 }[] = [
    { value: "APPROVE", label: "Approve claim", icon: CheckCircle2 },
    { value: "REQUEST INFORMATION", label: "Request information", icon: MessageSquareWarning },
    { value: "ESCALATE TO INVESTIGATOR", label: "Escalate to investigator", icon: ShieldAlert },
  ];

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <p className="text-sm text-muted-foreground">
        Record your decision for {claim.id}. Your selection overrides the AI recommendation and is what gets filed.
      </p>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {options.map((o) => {
          const active = decision === o.value;
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => setDecision(o.value)}
              aria-pressed={active}
              className={
                "flex items-center gap-2.5 rounded-md border px-4 py-3 text-left text-sm font-medium transition-colors " +
                (active
                  ? "border-primary bg-info-soft text-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground")
              }
            >
              <o.icon className="size-4" />
              {o.label}
            </button>
          );
        })}
      </div>

      <div className="mt-4">
        <label htmlFor="notes" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Investigator notes
        </label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          placeholder="Record the reasoning, documents relied upon and any follow-up actions."
          className="mt-2"
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button
          disabled={!decision}
          onClick={() => toast.success(`Decision recorded for ${claim.id}`, { description: decision ?? undefined })}
        >
          Submit decision
        </Button>
        <Button variant="outline" onClick={() => { setDecision(null); setNotes(""); }}>
          Clear
        </Button>
        <span className="text-xs text-muted-foreground">Decisions are held locally in this preview build.</span>
      </div>
    </div>
  );
}

const supportedFindingStatuses = new Set<FindingStatus>([
  "PASS",
  "FAIL",
  "MISSING",
  "UNKNOWN",
  "ESCALATE",
]);

function FindingSection({ finding }: { finding: AdaptedFinding }) {
  if (supportedFindingStatuses.has(finding.status as FindingStatus)) {
    return <FindingCard finding={{ ...finding, status: finding.status as FindingStatus }} />;
  }

  return (
    <div className="overflow-hidden rounded-md border border-border bg-card">
      <div className="p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h4 className="text-sm font-semibold text-foreground">{finding.title}</h4>
          <span className="rounded border border-border bg-neutral-soft px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {finding.status}
          </span>
        </div>
        <p className="mt-1.5 text-sm text-muted-foreground">{finding.detail}</p>
        <p className="mt-2 text-xs text-muted-foreground">
          Source: <span className="text-foreground/80">{finding.source || "Unavailable from API"}</span>
        </p>
      </div>
    </div>
  );
}

function DecisionStatus({ status }: { status: string }) {
  if (["APPROVE", "REQUEST INFORMATION", "ESCALATE TO INVESTIGATOR"].includes(status)) {
    return <StatusBadge status={status as "APPROVE" | "REQUEST INFORMATION" | "ESCALATE TO INVESTIGATOR"} kind="decision" />;
  }
  return (
    <span className="rounded border border-border bg-neutral-soft px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
      {status || "Unavailable"}
    </span>
  );
}

function Recommendation({ claim }: { claim: AdaptedClaim }) {
  return (
    <div className="rounded-lg border-2 border-primary/30 bg-info-soft">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-primary/20 px-5 py-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">AI Recommendation</h3>
          <p className="text-xs text-muted-foreground">Evidence-grounded, generated from submitted documents</p>
        </div>
        <div className="flex items-center gap-3">
          {claim.recommendation.confidence !== undefined ? (
            <span className="text-xs text-muted-foreground">
              Confidence <span className="font-semibold text-foreground tabular-nums">{claim.recommendation.confidence}%</span>
            </span>
          ) : null}
          <DecisionStatus status={claim.recommendation.decision} />
        </div>
      </div>
      <div className="space-y-5 px-5 py-5">
        <p className="text-sm leading-relaxed text-foreground">{claim.recommendation.rationale}</p>
        {claim.recommendation.evidence.length > 0 ? (
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Supporting evidence</h4>
            <ul className="mt-2 space-y-1.5 text-sm text-foreground">
              {claim.recommendation.evidence.map((evidence) => <li key={evidence}>{evidence}</li>)}
            </ul>
          </div>
        ) : null}
        {claim.recommendation.nextSteps.length > 0 ? (
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Suggested next steps</h4>
            <ul className="mt-2 space-y-1.5 text-sm text-foreground">
              {claim.recommendation.nextSteps.map((step) => <li key={step}>{step}</li>)}
            </ul>
          </div>
        ) : null}
        <p className="rounded-md border border-primary/25 bg-card px-4 py-3 text-sm font-medium text-foreground">
          AI recommendation — Final decision remains with the investigator.
        </p>
      </div>
    </div>
  );
}

function PolicyClauses({ clauses }: { clauses: { clause_id: string; title: string; text: string }[] }) {
  if (clauses.length === 0) return null;
  return (
    <div className="mt-4 rounded-md border border-border bg-card p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Retrieved policy clauses</h3>
      <div className="mt-3 space-y-3">
        {clauses.map((clause) => (
          <div key={clause.clause_id}>
            <p className="text-sm font-medium text-foreground">{clause.clause_id} · {clause.title}</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{clause.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ClaimReview() {
  const { claim, policyClauses } = Route.useLoaderData();

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="space-y-4">
        <Link to="/claims" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Back to claims
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs font-medium text-muted-foreground">{claim.id}</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
              {claim.customer || "Claim review"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {claim.vehicle || "Vehicle unavailable from API"}
            </p>
          </div>
          <div className="mt-1"><DecisionStatus status={claim.status} /></div>
        </div>
      </div>

      <Section step={1} title="Claim Overview">
        <Overview claim={claim} />
      </Section>

      <Section step={2} title="Document Evidence" description="Documents on file and their intake status.">
        {claim.documents.length === 0 ? (
          <div className="rounded-md border border-border bg-card px-4 py-5 text-sm text-muted-foreground">
            Document metadata is unavailable from the review API.
          </div>
        ) : <div className="overflow-hidden rounded-lg border border-border bg-card">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/60 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3">Document</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Pages / files</th>
                <th className="px-4 py-3">Received</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {claim.documents.map((d) => (
                <tr key={d.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-2 font-medium text-foreground">
                      <FileText className="size-3.5 text-muted-foreground" />
                      {d.name}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{d.type}</td>
                  <td className="px-4 py-3 tabular-nums text-muted-foreground">{d.pages || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{d.received}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={d.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>}
      </Section>

      <Section step={3} title="Completeness Findings" description="Whether the file contains everything required to decide.">
        <div className="grid gap-3 lg:grid-cols-2">
          {claim.completeness.map((f) => (
            <FindingSection key={f.id} finding={f} />
          ))}
        </div>
      </Section>

      <Section step={4} title="Consistency Findings" description="Whether the documents tell the same story.">
        <div className="grid gap-3 lg:grid-cols-2">
          {claim.consistency.map((f) => (
            <FindingSection key={f.id} finding={f} />
          ))}
        </div>
      </Section>

      <Section step={5} title="Policy Findings" description="Cover, limits and clause compliance.">
        <div className="grid gap-3 lg:grid-cols-2">
          {claim.policy.map((f) => (
            <FindingSection key={f.id} finding={f} />
          ))}
        </div>
        <PolicyClauses clauses={policyClauses} />
      </Section>

      <Section step={6} title="Contradictions" description="Direct conflicts detected between two source documents.">
        {claim.contradictions.length === 0 ? (
          <div className="rounded-md border border-border bg-card px-4 py-5 text-sm text-muted-foreground">
            No contradictions detected across the submitted evidence.
          </div>
        ) : (
          <div className="space-y-3">
            {claim.contradictions.map((c) => (
              <ContradictionCard key={c.id} contradiction={c} />
            ))}
          </div>
        )}
      </Section>

      <Section step={7} title="AI Recommendation">
        <Recommendation claim={claim} />
      </Section>

      <Section step={8} title="Investigator Decision">
        <DecisionPanel claim={claim} />
      </Section>
    </div>
  );
}
