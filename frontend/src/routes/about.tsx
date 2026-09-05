import { createFileRoute } from "@tanstack/react-router";
import { FileSearch, GitCompareArrows, ShieldCheck, UserCheck } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — ClaimLens AI" },
      { name: "description", content: "How ClaimLens AI assists motor insurance investigators while keeping decisions human." },
      { property: "og:title", content: "About — ClaimLens AI" },
      { property: "og:description", content: "How ClaimLens AI assists motor insurance investigators while keeping decisions human." },
    ],
  }),
  component: About,
});

const pillars = [
  {
    icon: FileSearch,
    title: "Evidence extraction",
    body: "Submitted documents are read and indexed so every finding can be traced back to a named source page or image.",
  },
  {
    icon: GitCompareArrows,
    title: "Cross-document checks",
    body: "Dates, amounts, parts and identities are compared across documents to surface contradictions early.",
  },
  {
    icon: ShieldCheck,
    title: "Policy alignment",
    body: "Cover dates, sum insured, deductibles and intimation clauses are checked against the policy schedule.",
  },
  {
    icon: UserCheck,
    title: "Human decision",
    body: "The assistant proposes a recommendation with its reasoning. Approving, escalating or requesting information is always the investigator's call.",
  },
];

function About() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">About ClaimLens AI</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          An evidence review assistant for motor insurance investigators. AI Assistant • Human Decision.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {pillars.map((p) => (
          <div key={p.title} className="rounded-lg border border-border bg-card p-5">
            <span className="flex size-9 items-center justify-center rounded-md bg-info-soft text-info">
              <p.icon className="size-4.5" />
            </span>
            <h2 className="mt-3 text-sm font-semibold text-foreground">{p.title}</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">{p.body}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-border bg-card p-5">
        <h2 className="text-sm font-semibold text-foreground">Scope and limitations</h2>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          <li>· The assistant never settles, rejects or pays a claim; it prepares evidence for review.</li>
          <li>· Findings marked UNKNOWN mean the evidence on file is insufficient, not that the claim is suspect.</li>
          <li>· Every recommendation must be read together with its cited source documents.</li>
          <li>· This build runs on illustrative sample data for interface review.</li>
        </ul>
      </div>
    </div>
  );
}
