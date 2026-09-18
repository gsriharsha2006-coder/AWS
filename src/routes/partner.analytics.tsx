import { createFileRoute } from "@tanstack/react-router";
import { RequireRole } from "@/components/require-role";
import { Panel, SectionHeading, StatCard } from "@/components/ui-bits";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/partner/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — Venture Connect partner console" },
      { name: "description", content: "Application volume, stage mix and readiness distribution across your listings." },
      { property: "og:title", content: "Analytics — Venture Connect partner console" },
      { property: "og:description", content: "Understand who is applying to your opportunities." },
    ],
  }),
  component: () => (
    <RequireRole role="partner">
      <Analytics />
    </RequireRole>
  ),
});

function Analytics() {
  const { state } = useStore();
  const apps = state.applications.filter((a) =>
    state.partnerOpportunities.some((o) => o.id === a.opportunityId),
  );
  const interested = apps.filter((a) => a.status === "Interested").length;
  const rate = apps.length ? Math.round((interested / apps.length) * 100) : 0;
  const avgCompletion = apps.length
    ? Math.round(apps.reduce((s, a) => s + a.workspaceCompletion, 0) / apps.length)
    : 0;
  const withScore = apps.filter((a) => a.readinessScore !== null);
  const avgReadiness = withScore.length
    ? Math.round(withScore.reduce((s, a) => s + (a.readinessScore ?? 0), 0) / withScore.length)
    : null;

  const stages = ["Idea", "Prototype", "MVP", "Early Revenue"] as const;
  const byStage = stages.map((s) => ({ stage: s, count: apps.filter((a) => a.stage === s).length }));
  const max = Math.max(1, ...byStage.map((b) => b.count));

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Analytics"
        title="Who is applying to your opportunities"
        description="Figures are drawn from applications submitted inside Venture Connect."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Applications" value={apps.length} />
        <StatCard label="Marked interested" value={interested} tone="success" />
        <StatCard label="Interest rate" value={`${rate}%`} tone="primary" />
        <StatCard label="Avg workspace completeness" value={`${avgCompletion}%`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel>
          <SectionHeading title="Applications by stage" />
          <ul className="space-y-3">
            {byStage.map((b) => (
              <li key={b.stage}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{b.stage}</span>
                  <span className="text-muted-foreground">{b.count}</span>
                </div>
                <div className="h-2 rounded-full bg-surface-2">
                  <div className="h-2 rounded-full bg-primary" style={{ width: `${(b.count / max) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel>
          <SectionHeading title="Readiness of applicants" />
          <p className="font-display text-4xl font-semibold text-primary">
            {avgReadiness ?? "—"}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Average AI readiness assessment across applicants who generated a report.{" "}
            {withScore.length} of {apps.length} applicants have one.
          </p>
          <p className="mt-4 text-xs text-muted-foreground">
            Readiness is an AI assessment of the founder's structured workspace. It is not a valuation, an endorsement,
            or independent verification of any claim.
          </p>
        </Panel>
      </div>
    </div>
  );
}
