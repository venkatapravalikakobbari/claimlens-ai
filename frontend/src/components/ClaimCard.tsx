import { Link } from "@tanstack/react-router";
import { ArrowRight, CalendarDays, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { formatINR, type Claim } from "@/lib/mock-data";

export function ClaimCard({ claim }: { claim: Claim }) {
  return (
    <div className="flex flex-col rounded-lg border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs font-medium text-muted-foreground">{claim.id}</p>
          <h3 className="mt-1 text-base font-semibold text-foreground">{claim.customer}</h3>
          <p className="text-sm text-muted-foreground">
            {claim.vehicle} · {claim.registration}
          </p>
        </div>
        <StatusBadge status={claim.status} kind="decision" />
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4 text-sm">
        <div>
          <dt className="text-xs text-muted-foreground">Claim amount</dt>
          <dd className="font-medium tabular-nums text-foreground">{formatINR(claim.amount)}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Contradictions</dt>
          <dd className="font-medium text-foreground">{claim.contradictions.length}</dd>
        </div>
      </dl>

      <div className="mt-4 space-y-1.5 text-xs text-muted-foreground">
        <p className="flex items-center gap-1.5">
          <CalendarDays className="size-3.5" /> Incident {claim.incidentDate} · Reported {claim.reportedDate}
        </p>
        <p className="flex items-center gap-1.5">
          <MapPin className="size-3.5" /> {claim.location}
        </p>
      </div>

      <Button asChild size="sm" className="mt-5 self-start">
        <Link to="/claims/$claimId" params={{ claimId: claim.id }}>
          Review claim <ArrowRight className="size-4" />
        </Link>
      </Button>
    </div>
  );
}
