import { createFileRoute } from "@tanstack/react-router";
import { ClaimCard } from "@/components/ClaimCard";
import { ClaimsTable } from "@/components/ClaimsTable";
import { claims } from "@/lib/mock-data";

export const Route = createFileRoute("/claims/")({
  head: () => ({
    meta: [
      { title: "Claims — ClaimLens AI" },
      { name: "description", content: "All open motor insurance claims with status, amount and evidence review access." },
      { property: "og:title", content: "Claims — ClaimLens AI" },
      { property: "og:description", content: "All open motor insurance claims with status, amount and evidence review access." },
    ],
  }),
  component: ClaimsPage,
});

function ClaimsPage() {
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

      <ClaimsTable claims={claims} caption="Full claim register" />
    </div>
  );
}
