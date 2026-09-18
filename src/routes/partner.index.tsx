import { createFileRoute, Link } from "@tanstack/react-router";
import { RequireRole } from "@/components/require-role";
import { Panel, Pill, SectionHeading, StatCard } from "@/components/ui-bits";
import { daysUntil, formatDeadline } from "@/lib/matching";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/partner/")({
  head: () => ({
    meta: [
      { title: "Partner dashboard — Venture Connect" },
      { name: "description", content: "Active opportunities, applications, pending reviews and interested founders." },
      { property: "og:title", content: "Partner dashboard — Venture Connect" },
      { property: "og:description", content: "The ecosystem partner command centre." },
    ],
  }),
  component: () => (
    <RequireRole role="partner">
      <PartnerDashboard />
    </RequireRole>
  ),
});

function PartnerDashboard() {
  const { state } = useStore();
  const opps = state.partnerOpportunities;
  const apps = state.applications.filter((a) => opps.some((o) => o.id === a.opportunityId));
  const pending = apps.filter((a) => ["Submitted", "Under Review"].includes(a.status));
  const interested = apps.filter((a) => a.status === "Interested");
  const closing = opps.filter((o) => {
    const d = daysUntil(o.deadline);
    return d !== null && d >= 0 && d <= 30;
  });

  return (
    <div className="space-y-6">
      <Panel>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="label-caps">Partner console</p>
            <h1 className="mt-1 font-display text-2xl font-semibold sm:text-3xl">
              {state.partner.organization || "Your organization"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Post opportunities, review structured applications, and open a conversation only when you're interested.
            </p>
          </div>
          <Link to="/partner/post" className="rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">
            Post opportunity
          </Link>
        </div>
      </Panel>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Active opportunities" value={opps.length} />
        <StatCard label="Applications" value={apps.length} tone="primary" />
        <StatCard label="Pending review" value={pending.length} tone="warning" />
        <StatCard label="Interested" value={interested.length} tone="success" />
        <StatCard label="Closing soon" value={closing.length} sub="Within 30 days" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel>
          <SectionHeading title="Opportunity performance" />
          {opps.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nothing published yet.</p>
          ) : (
            <ul className="space-y-3">
              {opps.map((o) => {
                const count = apps.filter((a) => a.opportunityId === o.id).length;
                return (
                  <li key={o.id} className="flex items-center justify-between gap-3 border-b border-border/60 pb-3 last:border-0">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{o.title}</p>
                      <p className="text-xs text-muted-foreground">{formatDeadline(o.deadline)}</p>
                    </div>
                    <Pill tone="muted">{count} applications</Pill>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>

        <Panel>
          <SectionHeading
            title="Review queue"
            action={
              <Link to="/partner/applications" className="rounded-lg border border-border px-3.5 py-2 text-sm hover:bg-surface-2">
                Open queue
              </Link>
            }
          />
          {pending.length === 0 ? (
            <p className="text-sm text-muted-foreground">No applications waiting on you.</p>
          ) : (
            <ul className="space-y-3">
              {pending.slice(0, 5).map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 border-b border-border/60 pb-3 last:border-0">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{a.founderName}</p>
                    <p className="truncate text-xs text-muted-foreground">{a.ideaName} · {a.stage}</p>
                  </div>
                  <Pill tone="muted">{a.status}</Pill>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
