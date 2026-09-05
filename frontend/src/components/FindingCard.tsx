import { StatusBadge } from "@/components/StatusBadge";
import { cn } from "@/lib/utils";
import type { Finding } from "@/lib/mock-data";

const barClass: Record<Finding["status"], string> = {
  PASS: "bg-success",
  FAIL: "bg-danger",
  MISSING: "bg-warning",
  UNKNOWN: "bg-muted-foreground/40",
  ESCALATE: "bg-info",
};

export function FindingCard({ finding }: { finding: Finding }) {
  return (
    <div className="flex overflow-hidden rounded-md border border-border bg-card">
      <span className={cn("w-1 shrink-0", barClass[finding.status])} aria-hidden />
      <div className="flex-1 p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h4 className="text-sm font-semibold text-foreground">{finding.title}</h4>
          <StatusBadge status={finding.status} />
        </div>
        <p className="mt-1.5 text-sm text-muted-foreground">{finding.detail}</p>
        <p className="mt-2 text-xs text-muted-foreground">
          Source: <span className="text-foreground/80">{finding.source}</span>
        </p>
      </div>
    </div>
  );
}
