import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import type { AdaptedClaim } from "@/lib/claim-adapter";

export function ClaimsTable({ claims, caption }: { claims: AdaptedClaim[]; caption?: string }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Claims</h2>
          <p className="text-xs text-muted-foreground">
            {caption ?? "Open motor claims with AI-assisted evidence review"}
          </p>
        </div>
        <span className="text-xs text-muted-foreground">{claims.length} records</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/60 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <th className="px-5 py-3">Claim ID</th>
              <th className="px-5 py-3">Customer</th>
              <th className="px-5 py-3">Vehicle</th>
              <th className="px-5 py-3 text-right">Claim Amount</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {claims.map((claim) => (
              <tr key={claim.id} className="border-b border-border last:border-0 hover:bg-muted/40">
                <td className="px-5 py-4 font-mono text-[13px] font-medium text-foreground">{claim.id}</td>
                <td className="px-5 py-4">
                  <div className="font-medium text-foreground">{claim.customer || "Unavailable from API"}</div>
                  <div className="text-xs text-muted-foreground">{claim.policyNumber || "Policy number unavailable"}</div>
                </td>
                <td className="px-5 py-4">
                  <div className="text-foreground">{claim.vehicle || "Unavailable from API"}</div>
                  <div className="text-xs text-muted-foreground">{claim.registration || "Registration unavailable"}</div>
                </td>
                <td className="px-5 py-4 text-right font-medium tabular-nums text-foreground">
                  Unavailable from API
                </td>
                <td className="px-5 py-4">
                  <StatusBadge status={claim.status} kind="decision" />
                </td>
                <td className="px-5 py-4 text-right">
                  <Button asChild size="sm" variant="outline">
                    <Link to="/claims/$claimId" params={{ claimId: claim.id }}>
                      Review
                    </Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
