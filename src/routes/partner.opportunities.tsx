import { createFileRoute, Link } from "@tanstack/react-router";
import { RequireRole } from "@/components/require-role";
import { EmptyState, Panel, Pill, SectionHeading } from "@/components/ui-bits";
import { daysUntil, formatDeadline } from "@/lib/matching";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/partner/opportunities")({
  head: () => ({
    meta: [
      { title: "My opportunities — Venture Connect" },
      { name: "description", content: "Every opportunity your organization has published, with application counts." },
      { property: "og:title", content: "My opportunities — Venture Connect" },
      { property: "og:description", content: "Manage your published listings." },
    ],
  }),
  component: () => (
    <RequireRole role="partner">
      <MyOpportunities />
    </RequireRole>
  ),
});

function MyOpportunities() {
  const { state } = useStore();
  const opps = state.partnerOpportunities;

  if (opps.length === 0) {
    return (
      <EmptyState
        title="You haven't published anything yet"
        description="Post your first opportunity and it becomes discoverable to founders whose idea, stage and profile match."
        action={
          <Link to="/partner/post" className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">
            Post an opportunity
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="My opportunities"
        title={`${opps.length} published listing${opps.length === 1 ? "" : "s"}`}
        action={
          <Link to="/partner/post" className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">
            Post opportunity
          </Link>
        }
      />
      <div className="grid gap-4 lg:grid-cols-2">
        {opps.map((o) => {
          const apps = state.applications.filter((a) => a.opportunityId === o.id);
          const days = daysUntil(o.deadline);
          return (
            <Panel key={o.id}>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Pill tone="primary">{o.type}</Pill>
                {o.origin === "demo" ? <Pill tone="warning">Demo data</Pill> : null}
                {days !== null && days >= 0 && days <= 14 ? <Pill tone="warning">Closing soon</Pill> : null}
              </div>
              <h3 className="font-display text-base font-semibold">{o.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{o.description}</p>
              <dl className="mt-4 flex flex-wrap gap-5 text-xs">
                <div><dt className="label-caps">Deadline</dt><dd className="mt-0.5">{formatDeadline(o.deadline)}</dd></div>
                <div><dt className="label-caps">Applications</dt><dd className="mt-0.5">{apps.length}</dd></div>
                <div><dt className="label-caps">Interested</dt><dd className="mt-0.5">{apps.filter((a) => a.status === "Interested").length}</dd></div>
                <div><dt className="label-caps">Mode</dt><dd className="mt-0.5">{o.mode}</dd></div>
              </dl>
              <Link
                to="/partner/applications"
                className="mt-4 inline-block rounded-lg border border-border px-4 py-2 text-sm hover:bg-surface-2"
              >
                Review applications
              </Link>
            </Panel>
          );
        })}
      </div>
    </div>
  );
}
