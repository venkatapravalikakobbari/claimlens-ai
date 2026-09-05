import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, CheckCircle2, FileText, ShieldAlert, MessageSquareWarning } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ContradictionCard } from "@/components/ContradictionCard";
import { FindingCard } from "@/components/FindingCard";
import { RecommendationCard } from "@/components/RecommendationCard";
import { StatusBadge } from "@/components/StatusBadge";
import { formatINR, getClaim, type Claim, type DecisionStatus } from "@/lib/mock-data";

export const Route = createFileRoute("/claims/$claimId")({
  loader: ({ params }) => {
    const claim = getClaim(params.claimId);
    if (!claim) throw notFound();
    return { claim };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Claim unavailable — ClaimLens AI" }, { name: "robots", content: "noindex" }] };
    }
    const { claim } = loaderData;
    const title = `${claim.id} · ${claim.customer} — ClaimLens AI`;
    const description = `Evidence review for ${claim.id}: ${claim.vehicle}, ${formatINR(claim.amount)} claimed.`;
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
});

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

function Overview({ claim }: { claim: Claim }) {
  const rows: [string, string][] = [
    ["Policy number", claim.policyNumber],
    ["Vehicle", `${claim.vehicle} · ${claim.registration}`],
    ["Claim amount", formatINR(claim.amount)],
    ["Incident date", claim.incidentDate],
    ["Reported date", claim.reportedDate],
    ["Loss location", claim.location],
    ["Surveyor", claim.surveyor],
    ["Repair garage", claim.garage],
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
        <p className="mt-1.5 text-sm leading-relaxed text-foreground">{claim.incidentSummary}</p>
      </div>
    </div>
  );
}

function DecisionPanel({ claim }: { claim: Claim }) {
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

function ClaimReview() {
  const { claim } = Route.useLoaderData();

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="space-y-4">
        <Link to="/claims" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Back to claims
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs font-medium text-muted-foreground">{claim.id}</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">{claim.customer}</h1>
            <p className="text-sm text-muted-foreground">
              {claim.vehicle} · {claim.registration} · {formatINR(claim.amount)} claimed
            </p>
          </div>
          <StatusBadge status={claim.status} kind="decision" className="mt-1" />
        </div>
      </div>

      <Section step={1} title="Claim Overview">
        <Overview claim={claim} />
      </Section>

      <Section step={2} title="Document Evidence" description="Documents on file and their intake status.">
        <div className="overflow-hidden rounded-lg border border-border bg-card">
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
        </div>
      </Section>

      <Section step={3} title="Completeness Findings" description="Whether the file contains everything required to decide.">
        <div className="grid gap-3 lg:grid-cols-2">
          {claim.completeness.map((f) => (
            <FindingCard key={f.id} finding={f} />
          ))}
        </div>
      </Section>

      <Section step={4} title="Consistency Findings" description="Whether the documents tell the same story.">
        <div className="grid gap-3 lg:grid-cols-2">
          {claim.consistency.map((f) => (
            <FindingCard key={f.id} finding={f} />
          ))}
        </div>
      </Section>

      <Section step={5} title="Policy Findings" description="Cover, limits and clause compliance.">
        <div className="grid gap-3 lg:grid-cols-2">
          {claim.policy.map((f) => (
            <FindingCard key={f.id} finding={f} />
          ))}
        </div>
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
        <RecommendationCard recommendation={claim.recommendation} />
      </Section>

      <Section step={8} title="Investigator Decision">
        <DecisionPanel claim={claim} />
      </Section>
    </div>
  );
}
