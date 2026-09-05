import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ClaimsTable } from "@/components/ClaimsTable";
import { DashboardStats } from "@/components/DashboardStats";
import { loadClaimsSnapshot } from "@/lib/claims-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Claims Evidence Review — ClaimLens AI" },
      {
        name: "description",
        content:
          "Review motor claim evidence, identify inconsistencies and receive evidence-grounded recommendations.",
      },
      { property: "og:title", content: "Claims Evidence Review — ClaimLens AI" },
      {
        property: "og:description",
        content:
          "Review motor claim evidence, identify inconsistencies and receive evidence-grounded recommendations.",
      },
    ],
  }),
  loader: loadClaimsSnapshot,
  component: Dashboard,
  pendingComponent: DashboardPending,
  errorComponent: DashboardError,
});

function DashboardPending() {
  return <RouteMessage detail="Loading claims from the backend." />;
}

function DashboardError({ error, reset }: { error: Error; reset: () => void }) {
  return <RouteMessage detail={error.message || "Unable to load claims from the backend."} action={<Button onClick={reset}>Try again</Button>} />;
}

function RouteMessage({ detail, action }: { detail: string; action?: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-[32rem] max-w-xl items-center justify-center px-4">
      <div className="w-full rounded-lg border border-border bg-card p-6 text-center">
        <h1 className="text-lg font-semibold text-foreground">Claims unavailable</h1>
        <p className="mt-2 text-sm text-muted-foreground">{detail}</p>
        {action ? <div className="mt-5">{action}</div> : null}
      </div>
    </div>
  );
}

function Dashboard() {
  const { claims } = Route.useLoaderData();
  const needsInfo = claims.filter((claim) => claim.recommendation.decision === "REQUEST INFORMATION").length;
  const escalated = claims.filter((claim) =>
    claim.recommendation.decision === "ESCALATE TO INVESTIGATOR" || claim.recommendation.decision === "REJECT",
  ).length;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Claims Evidence Review</h1>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          Review claim evidence, identify inconsistencies, and receive evidence-grounded recommendations.
        </p>
      </div>

      <DashboardStats total={claims.length} needsInfo={needsInfo} escalated={escalated} />

      {claims.length === 0 ? (
        <div className="rounded-lg border border-border bg-card px-5 py-6 text-sm text-muted-foreground">
          No claims are available from the backend.
        </div>
      ) : <ClaimsTable claims={claims} />}
    </div>
  );
}
