import { createFileRoute } from "@tanstack/react-router";
import { ClaimsTable } from "@/components/ClaimsTable";
import { FindingCard } from "@/components/FindingCard";
import { claims } from "@/lib/mock-data";

export const Route = createFileRoute("/review-queue")({
  head: () => ({
    meta: [
      { title: "Review Queue — ClaimLens AI" },
      { name: "description", content: "Claims awaiting investigator action, prioritised by contradiction severity." },
      { property: "og:title", content: "Review Queue — ClaimLens AI" },
      { property: "og:description", content: "Claims awaiting investigator action, prioritised by contradiction severity." },
    ],
  }),
  component: ReviewQueue,
});

function ReviewQueue() {
  const queue = [...claims].sort((a, b) => b.contradictions.length - a.contradictions.length);
  const blocking = claims.flatMap((c) =>
    [...c.completeness, ...c.consistency, ...c.policy]
      .filter((f) => f.status === "FAIL" || f.status === "MISSING" || f.status === "ESCALATE")
      .map((f) => ({ ...f, id: `${c.id}-${f.id}`, title: `${c.id} · ${f.title}` })),
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Review Queue</h1>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          Claims ordered by the number of detected contradictions. Work the top of the queue first.
        </p>
      </div>

      <ClaimsTable claims={queue} caption="Prioritised by contradiction count" />

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Blocking findings across the queue</h2>
        <div className="grid gap-3 lg:grid-cols-2">
          {blocking.map((f) => (
            <FindingCard key={f.id} finding={f} />
          ))}
        </div>
      </section>
    </div>
  );
}
