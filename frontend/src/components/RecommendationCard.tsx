import { Sparkles } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import type { Claim } from "@/lib/mock-data";

export function RecommendationCard({ recommendation }: { recommendation: Claim["recommendation"] }) {
  return (
    <div className="rounded-lg border-2 border-primary/30 bg-info-soft">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-primary/20 px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Sparkles className="size-4" />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-foreground">AI Recommendation</h3>
            <p className="text-xs text-muted-foreground">Evidence-grounded, generated from submitted documents</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">
            Confidence <span className="font-semibold text-foreground tabular-nums">{recommendation.confidence}%</span>
          </span>
          <StatusBadge status={recommendation.decision} kind="decision" />
        </div>
      </div>

      <div className="space-y-5 px-5 py-5">
        <p className="text-sm leading-relaxed text-foreground">{recommendation.rationale}</p>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Supporting evidence</h4>
            <ul className="mt-2 space-y-1.5 text-sm text-foreground">
              {recommendation.evidence.map((e) => (
                <li key={e} className="flex gap-2">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                  {e}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Suggested next steps</h4>
            <ul className="mt-2 space-y-1.5 text-sm text-foreground">
              {recommendation.nextSteps.map((s) => (
                <li key={s} className="flex gap-2">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-muted-foreground/50" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="rounded-md border border-primary/25 bg-card px-4 py-3 text-sm font-medium text-foreground">
          AI recommendation — Final decision remains with the investigator.
        </p>
      </div>
    </div>
  );
}
