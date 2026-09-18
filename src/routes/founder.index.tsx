import { createFileRoute, Link } from "@tanstack/react-router";
import { RequireRole } from "@/components/require-role";
import { JourneyTrack, Panel, Pill, SectionHeading, StatCard } from "@/components/ui-bits";
import { OpportunityCard } from "@/components/opportunity-card";
import { useStore } from "@/lib/store";
import { daysUntil, formatDeadline, matchOpportunity } from "@/lib/matching";
import { WORKSPACE_FIELDS } from "@/lib/types";

export const Route = createFileRoute("/founder/")({
  head: () => ({
    meta: [
      { title: "Founder dashboard — Venture Connect" },
      { name: "description", content: "Your idea status, venture readiness, applications and recommended opportunities." },
      { property: "og:title", content: "Founder dashboard — Venture Connect" },
      { property: "og:description", content: "One command centre for building and applying." },
    ],
  }),
  component: () => (
    <RequireRole role="founder">
      <FounderDashboard />
    </RequireRole>
  ),
});

function FounderDashboard() {
  const { state, completion, journeyStage, allOpportunities } = useStore();
  const readiness = state.readiness?.scores.find((s) => s.key === "investor")?.score ?? null;

  const matched = allOpportunities
    .map((opp) => ({ opp, match: matchOpportunity(opp, state.idea, state.founder, completion, readiness) }))
    .sort((a, b) => b.match.score - a.match.score);

  const relevant = matched.filter((m) => m.match.score >= 60);
  const deadlines = allOpportunities
    .map((o) => ({ o, days: daysUntil(o.deadline) }))
    .filter((d) => d.days !== null && d.days >= 0)
    .sort((a, b) => (a.days ?? 0) - (b.days ?? 0))
    .slice(0, 3);

  const activeApps = state.applications.filter((a) => !["Withdrawn", "Rejected"].includes(a.status));
  const missing = WORKSPACE_FIELDS.filter((f) => (state.idea.fields[f.key] || "").trim().length < 40);

  const nextAction =
    completion < 60
      ? { text: `Complete the ${missing[0]?.label ?? "remaining"} section in your Idea Workspace`, to: "/founder/workspace" as const }
      : !state.readiness
        ? { text: "Generate your VC Readiness report", to: "/founder/readiness" as const }
        : (state.readiness.priorities[0]
            ? { text: state.readiness.priorities[0], to: "/founder/workspace" as const }
            : { text: "Review matched opportunities and apply", to: "/founder/opportunities" as const });

  return (
    <div className="space-y-8">
      <Panel>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="label-caps">Welcome back{state.founder.name ? `, ${state.founder.name.split(" ")[0]}` : ""}</p>
            <h1 className="mt-1 font-display text-2xl font-semibold sm:text-3xl">
              Let's move your idea closer to venture readiness.
            </h1>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              {state.idea.name ? `${state.idea.name} — ${state.idea.oneLiner || "no one-liner yet"}` : "No idea started yet."}
            </p>
          </div>
          <Link
            to="/founder/workspace"
            className="rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Continue building
          </Link>
        </div>
        <div className="mt-5">
          <JourneyTrack current={journeyStage} />
        </div>
      </Panel>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Idea status" value={state.idea.stage} sub={`${completion}% workspace complete`} />
        <StatCard
          label="VC readiness"
          value={readiness !== null ? `${readiness} / 100` : "Not generated"}
          sub={readiness !== null ? "AI assessment" : "Run the report"}
          tone="primary"
        />
        <StatCard label="Applications" value={`${activeApps.length} active`} sub={`${state.applications.length} total`} />
        <StatCard label="Opportunities" value={`${relevant.length} relevant`} sub={`${allOpportunities.length} listed`} />
        <StatCard label="Messages" value={state.messages.length} sub="Unlocked after partner interest" tone="success" />
      </div>

      <Panel>
        <SectionHeading eyebrow="Next recommended action" title={nextAction.text} />
        <Link to={nextAction.to} className="inline-block rounded-lg border border-border px-4 py-2.5 text-sm hover:bg-surface-2">
          Take this step
        </Link>
      </Panel>

      <section>
        <SectionHeading
          eyebrow="Matched to your profile"
          title="Recommended opportunities"
          description="Ranked by category, stage, eligibility, location and how complete your case currently is."
          action={
            <Link to="/founder/opportunities" className="rounded-lg border border-border px-3.5 py-2 text-sm hover:bg-surface-2">
              See all
            </Link>
          }
        />
        <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
          {matched.slice(0, 3).map(({ opp, match }) => (
            <OpportunityCard key={opp.id} opp={opp} match={match} />
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel>
          <SectionHeading title="Upcoming deadlines" />
          {deadlines.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No dated deadlines in your matched list — most listed programs accept rolling applications.
            </p>
          ) : (
            <ul className="space-y-3">
              {deadlines.map(({ o, days }) => (
                <li key={o.id} className="flex items-center justify-between gap-3 border-b border-border/60 pb-3 last:border-0">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{o.title}</p>
                    <p className="text-xs text-muted-foreground">{formatDeadline(o.deadline)}</p>
                  </div>
                  <Pill tone={(days ?? 99) <= 21 ? "warning" : "muted"}>{days} days</Pill>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel>
          <SectionHeading title="Recent applications" />
          {state.applications.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nothing submitted yet. Applications appear here with their factual status.
            </p>
          ) : (
            <ul className="space-y-3">
              {state.applications.slice(0, 4).map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 border-b border-border/60 pb-3 last:border-0">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{a.opportunityTitle}</p>
                    <p className="text-xs text-muted-foreground">{a.organization}</p>
                  </div>
                  <Pill tone={a.status === "Interested" ? "success" : a.status === "Rejected" ? "danger" : "muted"}>
                    {a.status}
                  </Pill>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
