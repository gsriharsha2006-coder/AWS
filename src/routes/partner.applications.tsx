import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { RequireRole } from "@/components/require-role";
import { EmptyState, Panel, Pill, SectionHeading } from "@/components/ui-bits";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/partner/applications")({
  head: () => ({
    meta: [
      { title: "Applications — Venture Connect partner console" },
      { name: "description", content: "Review founder applications with workspace completeness, stage and readiness in one queue." },
      { property: "og:title", content: "Applications — Venture Connect partner console" },
      { property: "og:description", content: "A review queue, not a chat. Messaging opens on interest." },
    ],
  }),
  component: () => (
    <RequireRole role="partner">
      <PartnerApplications />
    </RequireRole>
  ),
});

const FLOW = [
  "Application submitted",
  "Workspace completed",
  "Automated quality checks",
  "Partner review",
  "Pitch review",
  "Founder interview",
  "Evidence verification",
  "Connection",
];

function PartnerApplications() {
  const { state, setApplicationStatus } = useStore();
  const apps = state.applications.filter((a) =>
    state.partnerOpportunities.some((o) => o.id === a.opportunityId),
  );

  if (apps.length === 0) {
    return (
      <EmptyState
        title="No applications yet"
        description="When a founder applies to one of your published opportunities, they appear here with their idea, stage, workspace completeness and readiness score."
      />
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Review queue"
        title="Founder applications"
        description="Marking a founder as interested is the only action that opens a private conversation."
      />

      <Panel>
        <p className="label-caps mb-3">Review flow</p>
        <ol className="flex flex-wrap items-center gap-2 text-xs">
          {FLOW.map((s, i) => (
            <li key={s} className="flex items-center gap-2">
              <span className="rounded-full border border-border px-3 py-1 text-muted-foreground">{s}</span>
              {i < FLOW.length - 1 ? <span aria-hidden className="text-muted-foreground">→</span> : null}
            </li>
          ))}
        </ol>
      </Panel>

      <div className="space-y-4">
        {apps.map((a) => (
          <Panel key={a.id}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Pill tone={a.status === "Interested" ? "success" : a.status === "Rejected" ? "danger" : "muted"}>
                    {a.status}
                  </Pill>
                  <span className="text-xs text-muted-foreground">
                    Applied {new Date(a.submittedAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="font-display text-base font-semibold">{a.founderName}</h3>
                <p className="text-sm text-muted-foreground">
                  {a.ideaName} · {a.stage} · {a.opportunityTitle}
                </p>
                <dl className="mt-3 flex flex-wrap gap-5 text-xs">
                  <div><dt className="label-caps">Workspace</dt><dd className="mt-0.5">{a.workspaceCompletion}% complete</dd></div>
                  <div><dt className="label-caps">VC readiness</dt><dd className="mt-0.5">{a.readinessScore ?? "Not generated"}</dd></div>
                  <div><dt className="label-caps">Eligibility</dt><dd className="mt-0.5">{a.workspaceCompletion >= 60 ? "Meets stated minimum" : "Below stated minimum"}</dd></div>
                </dl>
                {a.note ? <p className="mt-3 max-w-2xl text-sm text-muted-foreground">“{a.note}”</p> : null}
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setApplicationStatus(a.id, "Under Review")}
                  className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-surface-2"
                >
                  Mark under review
                </button>
                <button
                  type="button"
                  onClick={() => setApplicationStatus(a.id, "Rejected")}
                  className="rounded-lg border border-destructive/40 px-4 py-2 text-sm text-destructive hover:bg-destructive/10"
                >
                  Reject
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setApplicationStatus(a.id, "Interested");
                    toast.success("Interest recorded", { description: "A direct conversation is now open with this founder." });
                  }}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
                >
                  Interested
                </button>
              </div>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
