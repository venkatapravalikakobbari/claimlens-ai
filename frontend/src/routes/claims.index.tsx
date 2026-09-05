import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ClaimCard } from "@/components/ClaimCard";
import { ClaimsTable } from "@/components/ClaimsTable";
import { loadClaimsSnapshot } from "@/lib/claims-data";

export const Route = createFileRoute("/claims/")({
  head: () => ({
    meta: [
      { title: "Claims — ClaimLens AI" },
      { name: "description", content: "All open motor insurance claims with status, amount and evidence review access." },
      { property: "og:title", content: "Claims — ClaimLens AI" },
      { property: "og:description", content: "All open motor insurance claims with status, amount and evidence review access." },
    ],
  }),
  loader: loadClaimsSnapshot,
  component: ClaimsPage,
  pendingComponent: ClaimsPending,
  errorComponent: ClaimsError,
});

function ClaimsPending() {
  return <RouteMessage detail="Loading claims from the backend." />;
}

function ClaimsError({ error, reset }: { error: Error; reset: () => void }) {
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

function ClaimsPage() {
  const { claims } = Route.useLoaderData();

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Claims</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every motor claim currently assigned to your desk, with its latest AI-assisted status.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {claims.map((claim) => (
          <ClaimCard key={claim.id} claim={claim} />
        ))}
      </div>

      {claims.length === 0 ? (
        <div className="rounded-lg border border-border bg-card px-5 py-6 text-sm text-muted-foreground">
          No claims are available from the backend.
        </div>
      ) : <ClaimsTable claims={claims} caption="Full claim register" />}
    </div>
  );
}
