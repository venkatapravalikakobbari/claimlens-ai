import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ClaimsTable } from "@/components/ClaimsTable";
import { FindingCard } from "@/components/FindingCard";
import { loadClaimsSnapshot } from "@/lib/claims-data";

export const Route = createFileRoute("/review-queue")({
  head: () => ({
    meta: [
      { title: "Review Queue — ClaimLens AI" },
      { name: "description", content: "Claims awaiting investigator action, prioritised by contradiction severity." },
      { property: "og:title", content: "Review Queue — ClaimLens AI" },
      { property: "og:description", content: "Claims awaiting investigator action, prioritised by contradiction severity." },
    ],
  }),
  loader: loadClaimsSnapshot,
  component: ReviewQueue,
  pendingComponent: QueuePending,
  errorComponent: QueueError,
});

function QueuePending() {
  return <RouteMessage detail="Loading review queue from the backend." />;
}

function QueueError({ error, reset }: { error: Error; reset: () => void }) {
  return <RouteMessage detail={error.message || "Unable to load the review queue."} action={<Button onClick={reset}>Try again</Button>} />;
}

function RouteMessage({ detail, action }: { detail: string; action?: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-[32rem] max-w-xl items-center justify-center px-4">
      <div className="w-full rounded-lg border border-border bg-card p-6 text-center">
        <h1 className="text-lg font-semibold text-foreground">Review queue unavailable</h1>
        <p className="mt-2 text-sm text-muted-foreground">{detail}</p>
        {action ? <div className="mt-5">{action}</div> : null}
      </div>
    </div>
  );
}

function ReviewQueue() {
  const { claims } = Route.useLoaderData();
  const queue = [...claims].sort((a, b) => b.contradictions.length - a.contradictions.length);
  const blocking = claims.flatMap((c) =>
    [...c.completeness, ...c.consistency, ...c.policy]
      .filter((f) => f.status !== "PASS")
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

      {queue.length === 0 ? (
        <div className="rounded-lg border border-border bg-card px-5 py-6 text-sm text-muted-foreground">
          No claims are available from the backend.
        </div>
      ) : <ClaimsTable claims={queue} caption="Prioritised by contradiction count" />}

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Blocking findings across the queue</h2>
        {blocking.length === 0 ? (
          <div className="rounded-lg border border-border bg-card px-5 py-6 text-sm text-muted-foreground">
            No non-passing findings are currently reported by the backend.
          </div>
        ) : <div className="grid gap-3 lg:grid-cols-2">
          {blocking.map((f) => <FindingCard key={f.id} finding={f} />)}
        </div>}
      </section>
    </div>
  );
}
