import { AlertTriangle, ClipboardList, FileQuestion, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

type Stat = {
  label: string;
  value: number;
  icon: typeof ClipboardList;
  accent: string;
  note: string;
};

export function DashboardStats({
  total,
  pending,
  needsInfo,
  escalated,
}: {
  total: number;
  pending?: number;
  needsInfo?: number;
  escalated?: number;
}) {
  const stats: Stat[] = [
    { label: "Total Claims", value: total, icon: ClipboardList, accent: "text-info bg-info-soft", note: "In the current review cycle" },
    { label: "Pending Review", value: pending, icon: AlertTriangle, accent: "text-warning bg-warning-soft", note: "Awaiting investigator sign-off" },
    { label: "Needs Information", value: needsInfo, icon: FileQuestion, accent: "text-warning bg-warning-soft", note: "Documents outstanding" },
    { label: "Escalated", value: escalated, icon: ShieldAlert, accent: "text-danger bg-danger-soft", note: "Referred for investigation" },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((s) => (
        <div key={s.label} className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{s.label}</p>
              <p className="mt-2 text-3xl font-semibold tabular-nums text-foreground">{s.value ?? "—"}</p>
            </div>
            <span className={cn("flex size-9 items-center justify-center rounded-md", s.accent)}>
              <s.icon className="size-4.5" />
            </span>
          </div>
          <p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">{s.note}</p>
        </div>
      ))}
    </div>
  );
}
