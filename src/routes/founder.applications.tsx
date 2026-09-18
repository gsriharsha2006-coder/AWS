import { createFileRoute, Link } from "@tanstack/react-router";
import { RequireRole } from "@/components/require-role";
import { EmptyState, Panel, Pill, SectionHeading } from "@/components/ui-bits";
import { useStore } from "@/lib/store";
import type { ApplicationStatus } from "@/lib/types";

export const Route = createFileRoute("/founder/applications")({
  head: () => ({
    meta: [
      { title: "Applications — Venture Connect" },
      { name: "description", content: "Track the factual status of every application you have submitted." },
      { property: "og:title", content: "Applications — Venture Connect" },
      { property: "og:description", content: "Draft, submitted, under review, interested, rejected or withdrawn." },
    ],
  }),
  component: () => (
    <RequireRole role="founder">
      <Applications />
    </RequireRole>
  ),
});

function tone(status: ApplicationStatus) {
  if (status === "Interested") return "success" as const;
  if (status === "Rejected") return "danger" as const;
  if (status === "Under Review") return "primary" as const;
  return "muted" as const;
}

function Applications() {
  const { state, setApplicationStatus } = useStore();

  if (state.applications.length === 0) {
    return (
      <EmptyState
        title="No applications yet"
        description="Applications you submit through Venture Connect appear here with a factual status. Applications made on an organiser's own site are tracked by that organiser."
        action={
          <Link to="/founder/opportunities" className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">
            Browse opportunities
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Applications"
        title="Your submissions"
        description="“Under review” means the partner has opened the queue. It does not mean they are interested."
      />
      <div className="space-y-4">
        {state.applications.map((a) => (
          <Panel key={a.id}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Pill tone={tone(a.status)}>{a.status}</Pill>
                  <span className="text-xs text-muted-foreground">
                    Submitted {new Date(a.submittedAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="font-display text-base font-semibold">{a.opportunityTitle}</h3>
                <p className="text-sm text-muted-foreground">{a.organization}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {a.ideaName} · {a.stage} · workspace {a.workspaceCompletion}% · readiness{" "}
                  {a.readinessScore ?? "not generated"}
                </p>
              </div>
              <div className="flex gap-2">
                {a.status === "Interested" ? (
                  <Link to="/founder/messages" className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
                    Open conversation
                  </Link>
                ) : null}
                {!["Withdrawn", "Rejected"].includes(a.status) ? (
                  <button
                    type="button"
                    onClick={() => setApplicationStatus(a.id, "Withdrawn")}
                    className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-surface-2"
                  >
                    Withdraw
                  </button>
                ) : null}
              </div>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
