import { Link } from "@tanstack/react-router";
import { Pill } from "@/components/ui-bits";
import { daysUntil, formatDeadline, type MatchResult } from "@/lib/matching";
import type { Opportunity } from "@/lib/types";

export function VerificationBadge({ opp }: { opp: Opportunity }) {
  if (opp.origin === "demo") return <Pill tone="warning">Demo listing</Pill>;
  if (opp.verification === "verified") return <Pill tone="success">Verified</Pill>;
  if (opp.verification === "source-linked")
    return <Pill tone="muted">Source-linked{opp.lastChecked ? ` · checked ${opp.lastChecked}` : ""}</Pill>;
  return <Pill tone="muted">Verification unavailable</Pill>;
}

export function OpportunityCard({ opp, match }: { opp: Opportunity; match: MatchResult }) {
  const days = daysUntil(opp.deadline);
  const closingSoon = days !== null && days >= 0 && days <= 21;

  return (
    <article className="surface-panel flex h-full flex-col gap-4 p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Pill tone="primary">{opp.type}</Pill>
            <VerificationBadge opp={opp} />
            {closingSoon ? <Pill tone="warning">Closing in {days} days</Pill> : null}
          </div>
          <h3 className="font-display text-base font-semibold leading-snug">{opp.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{opp.organization}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-display text-xl font-semibold text-primary">{match.score}%</p>
          <p className="label-caps">Match</p>
        </div>
      </div>

      <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">{opp.description}</p>

      <dl className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <dt className="label-caps">Stage</dt>
          <dd className="mt-0.5">{opp.stages.join(", ")}</dd>
        </div>
        <div>
          <dt className="label-caps">Deadline</dt>
          <dd className="mt-0.5">{formatDeadline(opp.deadline)}</dd>
        </div>
        <div>
          <dt className="label-caps">Location</dt>
          <dd className="mt-0.5">{opp.location}</dd>
        </div>
        <div>
          <dt className="label-caps">Mode</dt>
          <dd className="mt-0.5">{opp.mode}</dd>
        </div>
      </dl>

      <p className="text-xs text-muted-foreground">
        <span className="label-caps mr-2">Benefits</span>
        {opp.benefits.slice(0, 3).join(" · ")}
      </p>

      <div className="mt-auto flex flex-wrap gap-2 pt-1">
        <Link
          to="/founder/opportunities/$oppId"
          params={{ oppId: opp.id }}
          className="rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          View details
        </Link>
        {opp.origin === "real" ? (
          <a
            href={opp.sourceUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="rounded-lg border border-border px-3.5 py-2 text-sm transition-colors hover:bg-surface-2"
          >
            View official source
          </a>
        ) : null}
      </div>
    </article>
  );
}
