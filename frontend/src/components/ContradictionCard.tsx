import { FileText, GitCompareArrows } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import type { Contradiction } from "@/lib/mock-data";

export function ContradictionCard({ contradiction }: { contradiction: Contradiction }) {
  return (
    <div className="rounded-md border border-border bg-card">
      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-border px-4 py-3">
        <div className="flex items-start gap-2">
          <GitCompareArrows className="mt-0.5 size-4 text-muted-foreground" />
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Conflict</p>
            <h4 className="text-sm font-semibold text-foreground">{contradiction.conflict}</h4>
          </div>
        </div>
        <StatusBadge status={contradiction.severity} kind="severity" />
      </div>
      <div className="grid gap-px bg-border md:grid-cols-2">
        {[
          { label: "Source document A", doc: contradiction.documentA },
          { label: "Source document B", doc: contradiction.documentB },
        ].map(({ label, doc }) => (
          <div key={label} className="bg-card p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
            <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-foreground">
              <FileText className="size-3.5 text-muted-foreground" />
              {doc.name}
            </p>
            <blockquote className="mt-2 border-l-2 border-border pl-3 text-sm text-muted-foreground">
              “{doc.excerpt}”
            </blockquote>
          </div>
        ))}
      </div>
    </div>
  );
}
