import { cn } from "@/lib/utils";
import type { DecisionStatus, FindingStatus, Severity } from "@/lib/mock-data";

type Tone = "success" | "warning" | "danger" | "info" | "neutral";

const toneClass: Record<Tone, string> = {
  success: "bg-success-soft text-success border-success/25",
  warning: "bg-warning-soft text-warning border-warning/25",
  danger: "bg-danger-soft text-danger border-danger/25",
  info: "bg-info-soft text-info border-info/25",
  neutral: "bg-neutral-soft text-muted-foreground border-border",
};

const findingTone: Record<FindingStatus, Tone> = {
  PASS: "success",
  FAIL: "danger",
  MISSING: "warning",
  UNKNOWN: "neutral",
  ESCALATE: "info",
};

const decisionTone: Record<DecisionStatus, Tone> = {
  APPROVE: "success",
  "ESCALATE TO INVESTIGATOR": "danger",
  "REQUEST INFORMATION": "warning",
};

const severityTone: Record<Severity, Tone> = {
  HIGH: "danger",
  MEDIUM: "warning",
  LOW: "neutral",
};

export function StatusBadge({
  status,
  kind = "finding",
  className,
}: {
  status: FindingStatus | DecisionStatus | Severity;
  kind?: "finding" | "decision" | "severity";
  className?: string;
}) {
  const tone: Tone =
    kind === "decision"
      ? decisionTone[status as DecisionStatus]
      : kind === "severity"
        ? severityTone[status as Severity]
        : findingTone[status as FindingStatus];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap",
        toneClass[tone],
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current opacity-70" />
      {kind === "severity" ? `${status} severity` : status}
    </span>
  );
}
