import { createFileRoute } from "@tanstack/react-router";
import { ClaimsTable } from "@/components/ClaimsTable";
import { DashboardStats } from "@/components/DashboardStats";
import { claims, dashboardStats } from "@/lib/mock-data";

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
  component: Dashboard,
});

function Dashboard() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Claims Evidence Review</h1>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          Review claim evidence, identify inconsistencies, and receive evidence-grounded recommendations.
        </p>
      </div>

      <DashboardStats {...dashboardStats} />

      <ClaimsTable claims={claims} />
    </div>
  );
}
