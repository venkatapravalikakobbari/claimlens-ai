import { StatusBadge } from "@/components/StatusBadge";
import type { AdaptedFinding } from "@/lib/claim-adapter";
import { cn } from "@/lib/utils";

const barClass: Record<string, string> = {
  PASS: "bg-success",
  FAIL: "bg-danger",
  MISSING: "bg-warning",
  UNKNOWN: "bg-muted-foreground/40",
  ESCALATE: "bg-info",
};

export function FindingCard({ finding }: { finding: AdaptedFinding }) {
  return (
    <div className="flex overflow-hidden rounded-md border border-border bg-card">
      <span className={cn("w-1 shrink-0", barClass[finding.status] ?? "bg-muted-foreground/40")} aria-hidden />
      <div className="flex-1 p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h4 className="text-sm font-semibold text-foreground">{finding.title}</h4>
          <StatusBadge status={finding.status} />
        </div>
        <p className="mt-1.5 text-sm text-muted-foreground">{finding.detail}</p>
        <p className="mt-2 text-xs text-muted-foreground">
          Source: <span className="text-foreground/80">{finding.source || "Unavailable from API"}</span>
        </p>
        {finding.evidence.length > 0 ? (
          <div className="mt-3 border-t border-border pt-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Evidence</p>
            <div className="mt-2 space-y-2">
              {finding.evidence.map((item, index) => (
                <div key={`${item.sourceDocument}-${index}`} className="rounded border border-border bg-muted/30 px-3 py-2">
                  <p className="text-sm text-foreground">{item.statement}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.sourceDocument} · {item.evidenceType}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
