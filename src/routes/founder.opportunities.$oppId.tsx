import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { RequireRole } from "@/components/require-role";
import { VerificationBadge } from "@/components/opportunity-card";
import { EmptyState, Panel, Pill, SectionHeading } from "@/components/ui-bits";
import { formatDeadline, matchOpportunity } from "@/lib/matching";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/founder/opportunities/$oppId")({
  head: () => ({
    meta: [
      { title: "Opportunity details — Venture Connect" },
      { name: "description", content: "Eligibility, match reasoning, deadlines and the official source for this opportunity." },
      { property: "og:title", content: "Opportunity details — Venture Connect" },
      { property: "og:description", content: "Check eligibility and readiness before you apply." },
    ],
  }),
  component: () => (
    <RequireRole role="founder">
      <OpportunityDetail />
    </RequireRole>
  ),
});

function OpportunityDetail() {
  const { oppId } = useParams({ from: "/founder/opportunities/$oppId" });
  const { state, completion, allOpportunities, addApplication } = useStore();
  const navigate = useNavigate();
  const [note, setNote] = useState("");

  const opp = allOpportunities.find((o) => o.id === oppId);
  if (!opp) {
    return (
      <EmptyState
        title="Opportunity not found"
        description="This listing is no longer available in your feed."
        action={
          <Link to="/founder/opportunities" className="rounded-lg border border-border px-4 py-2 text-sm">
            Back to opportunities
          </Link>
        }
      />
    );
  }

  const readiness = state.readiness?.scores.find((s) => s.key === "investor")?.score ?? null;
  const match = matchOpportunity(opp, state.idea, state.founder, completion, readiness);
  const already = state.applications.find((a) => a.opportunityId === opp.id);

  const workspaceGateOk = !opp.requiresWorkspace || completion >= 60;
  const canApplyHere = opp.origin === "demo";

  function apply() {
    if (!workspaceGateOk) return;
    addApplication({
      id: `app-${Date.now()}`,
      opportunityId: opp!.id,
      opportunityTitle: opp!.title,
      organization: opp!.organization,
      founderName: state.founder.name || "Founder",
      ideaName: state.idea.name || "Untitled idea",
      stage: state.idea.stage,
      readinessScore: readiness,
      workspaceCompletion: completion,
      note,
      status: "Submitted",
      submittedAt: new Date().toISOString(),
    });
    toast.success("Application submitted", { description: "The partner sees it in their review queue." });
    void navigate({ to: "/founder/applications" });
  }

  return (
    <div className="space-y-6">
      <Panel>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Pill tone="primary">{opp.type}</Pill>
          <VerificationBadge opp={opp} />
          <Pill tone="muted">{opp.mode}</Pill>
        </div>
        <h1 className="font-display text-2xl font-semibold sm:text-3xl">{opp.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{opp.organization}</p>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">{opp.description}</p>

        <dl className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div><dt className="label-caps">Deadline</dt><dd className="mt-1 text-sm">{formatDeadline(opp.deadline)}</dd></div>
          <div><dt className="label-caps">Stage</dt><dd className="mt-1 text-sm">{opp.stages.join(", ")}</dd></div>
          <div><dt className="label-caps">Location</dt><dd className="mt-1 text-sm">{opp.location}</dd></div>
          <div><dt className="label-caps">Audience</dt><dd className="mt-1 text-sm">{opp.audience}</dd></div>
        </dl>

        {opp.origin === "real" ? (
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <a
              href={opp.applicationUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              Apply at official source
            </a>
            <a
              href={opp.sourceUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="rounded-lg border border-border px-5 py-2.5 text-sm hover:bg-surface-2"
            >
              View official source
            </a>
            <p className="text-xs text-muted-foreground">
              Applications for real programs happen on the organiser's own site. Confirm dates and eligibility there.
            </p>
          </div>
        ) : null}
      </Panel>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-6">
          <Panel>
            <SectionHeading title="Eligibility" />
            <ul className="space-y-2 text-sm text-muted-foreground">
              {opp.eligibility.map((e) => <li key={e}>• {e}</li>)}
            </ul>
            {opp.equityNote ? <p className="mt-3 text-xs text-warning">{opp.equityNote}</p> : null}
          </Panel>

          <Panel>
            <SectionHeading title="Benefits" />
            <ul className="space-y-2 text-sm text-muted-foreground">
              {opp.benefits.map((b) => <li key={b}>• {b}</li>)}
            </ul>
            {opp.requiredDocuments?.length ? (
              <>
                <p className="label-caps mt-5 mb-2">Required for application</p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {opp.requiredDocuments.map((d) => <li key={d}>• {d}</li>)}
                </ul>
              </>
            ) : null}
          </Panel>

          {canApplyHere ? (
            <Panel>
              <SectionHeading
                eyebrow="Application"
                title="Apply through Venture Connect"
                description="This listing was posted by a partner inside the platform, so your structured workspace travels with the application."
              />
              {already ? (
                <p className="rounded-lg border border-border bg-surface-2 px-4 py-3 text-sm">
                  You applied on {new Date(already.submittedAt).toLocaleDateString()}. Current status:{" "}
                  <strong>{already.status}</strong>.
                </p>
              ) : (
                <>
                  <label htmlFor="note" className="label-caps">Message to the partner (optional)</label>
                  <textarea
                    id="note"
                    rows={4}
                    className="mt-1 w-full rounded-lg border border-input bg-surface px-3 py-2.5 text-sm"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                  {!workspaceGateOk ? (
                    <p role="alert" className="mt-3 rounded-lg border border-warning/40 bg-warning/10 px-4 py-3 text-sm">
                      This opportunity needs a substantially complete idea workspace. You're at {completion}% — reach
                      60% before submitting.{" "}
                      <Link to="/founder/workspace" className="underline underline-offset-4">Open the workspace</Link>
                    </p>
                  ) : null}
                  <button
                    type="button"
                    onClick={apply}
                    disabled={!workspaceGateOk}
                    className="mt-4 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
                  >
                    Submit application
                  </button>
                </>
              )}
            </Panel>
          ) : null}
        </div>

        <aside className="space-y-6">
          <Panel>
            <p className="label-caps">Match</p>
            <p className="mt-1 font-display text-4xl font-semibold text-primary">{match.score}%</p>
            <p className="label-caps mt-4 mb-2">Why this matches</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {match.reasons.map((r) => <li key={r}>• {r}</li>)}
            </ul>
            {match.issues.length ? (
              <>
                <p className="label-caps mt-4 mb-2">Potential issues</p>
                <ul className="space-y-2 text-sm text-warning">
                  {match.issues.map((i) => <li key={i}>• {i}</li>)}
                </ul>
              </>
            ) : null}
          </Panel>

          <Panel>
            <p className="label-caps">Your readiness</p>
            <ul className="mt-2 space-y-2 text-sm">
              <li className="flex justify-between"><span>Workspace</span><span>{completion}%</span></li>
              <li className="flex justify-between"><span>VC readiness</span><span>{readiness ?? "Not generated"}</span></li>
              <li className="flex justify-between"><span>Stage</span><span>{state.idea.stage}</span></li>
            </ul>
            <p className="mt-3 text-xs text-muted-foreground">
              {opp.requiresWorkspace
                ? "This opportunity type expects a structured pitch."
                : "This opportunity type does not require a complete startup pitch — you can apply directly."}
            </p>
          </Panel>
        </aside>
      </div>
    </div>
  );
}
