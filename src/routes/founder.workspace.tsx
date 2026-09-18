import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { RequireRole } from "@/components/require-role";
import { ErrorNote, Panel, Pill, SectionHeading } from "@/components/ui-bits";
import { analyzeIdea } from "@/lib/ai.functions";
import { useStore } from "@/lib/store";
import { WORKSPACE_FIELDS, type Category, type FieldReview, type Stage } from "@/lib/types";

export const Route = createFileRoute("/founder/workspace")({
  head: () => ({
    meta: [
      { title: "Idea Workspace — Venture Connect" },
      { name: "description", content: "Turn an unstructured idea into a structured startup concept, section by section." },
      { property: "og:title", content: "Idea Workspace — Venture Connect" },
      { property: "og:description", content: "Structure the idea. See what is missing. Fix it before you apply." },
    ],
  }),
  component: () => (
    <RequireRole role="founder">
      <Workspace />
    </RequireRole>
  ),
});

const TEMPLATES = [
  "Startup Pitch",
  "SaaS Product",
  "AI Startup",
  "Hackathon Project",
  "Social Impact",
  "Marketplace",
  "Consumer App",
  "FinTech",
  "EdTech",
  "Custom Idea",
];

const CATEGORIES: Category[] = ["AI", "SaaS", "FinTech", "HealthTech", "EdTech", "Marketplace", "Consumer", "DeepTech", "Other"];
const STAGES: Stage[] = ["Idea", "Prototype", "MVP", "Early Revenue"];

function statusLabel(s: FieldReview["status"]) {
  if (s === "complete") return { text: "Complete", tone: "success" as const, icon: "✓" };
  if (s === "needs_evidence") return { text: "Needs evidence", tone: "warning" as const, icon: "⚠" };
  if (s === "needs_revision") return { text: "Needs revision", tone: "warning" as const, icon: "⚠" };
  return { text: "Missing", tone: "danger" as const, icon: "•" };
}

function Workspace() {
  const { state, update, updateIdeaField, completion } = useStore();
  const runAnalysis = useServerFn(analyzeIdea);
  const [active, setActive] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const field = WORKSPACE_FIELDS[active]!;
  const reviewFor = (key: string) => state.analysis?.reviews.find((r) => r.field === key);

  async function analyze() {
    setBusy(true);
    setError(null);
    try {
      const result = await runAnalysis({
        data: {
          name: state.idea.name || "Untitled idea",
          category: state.idea.category,
          stage: state.idea.stage,
          oneLiner: state.idea.oneLiner,
          fields: state.idea.fields,
        },
      });
      update({ analysis: result as typeof state.analysis });
      toast.success("Analysis complete", { description: "Weak areas are marked in the section list." });
    } catch (e) {
      setError(e instanceof Error ? e.message : "The analysis could not be completed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const input = "mt-1 w-full rounded-lg border border-input bg-surface px-3 py-2.5 text-sm";

  return (
    <div className="space-y-6">
      <Panel>
        <p className="label-caps">Start with an idea → structure it → develop the concept</p>
        <div className="mt-4 grid gap-4 lg:grid-cols-4">
          <div>
            <label htmlFor="wname" className="label-caps">Venture name</label>
            <input id="wname" className={input} value={state.idea.name} onChange={(e) => update({ idea: { ...state.idea, name: e.target.value } })} />
          </div>
          <div>
            <label htmlFor="wtpl" className="label-caps">Template</label>
            <select id="wtpl" className={input} value={state.idea.template} onChange={(e) => update({ idea: { ...state.idea, template: e.target.value } })}>
              {TEMPLATES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="wcat" className="label-caps">Category</label>
            <select id="wcat" className={input} value={state.idea.category} onChange={(e) => update({ idea: { ...state.idea, category: e.target.value as Category } })}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="wstg" className="label-caps">Stage</label>
            <select id="wstg" className={input} value={state.idea.stage} onChange={(e) => update({ idea: { ...state.idea, stage: e.target.value as Stage } })}>
              {STAGES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="lg:col-span-4">
            <label htmlFor="wone" className="label-caps">One-line description</label>
            <input id="wone" className={input} value={state.idea.oneLiner} onChange={(e) => update({ idea: { ...state.idea, oneLiner: e.target.value } })} />
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-4">
          <div className="min-w-[12rem] flex-1">
            <div className="flex justify-between text-xs">
              <span className="label-caps">Completion</span>
              <span>{completion}%</span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-2" role="meter" aria-valuenow={completion} aria-valuemin={0} aria-valuemax={100} aria-label="Workspace completion">
              <div className="h-full rounded-full bg-primary" style={{ width: `${completion}%` }} />
            </div>
          </div>
          <button
            type="button"
            onClick={() => void analyze()}
            disabled={busy}
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {busy ? "Analysing…" : "Run AI structure review"}
          </button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          AI helps you structure and challenge your thinking. It never invents customers, traction or validation, and
          completing this workspace does not make an idea investor-ready.
        </p>
        {error ? <div className="mt-3"><ErrorNote message={error} /></div> : null}
      </Panel>

      <div className="grid gap-6 lg:grid-cols-[18rem_1fr]">
        <nav aria-label="Workspace sections" className="surface-panel h-fit p-3">
          <ul className="space-y-1">
            {WORKSPACE_FIELDS.map((f, i) => {
              const filled = (state.idea.fields[f.key] || "").trim().length >= 40;
              const review = reviewFor(f.key);
              const s = review ? statusLabel(review.status) : null;
              return (
                <li key={f.key}>
                  <button
                    type="button"
                    onClick={() => setActive(i)}
                    aria-current={i === active ? "true" : undefined}
                    className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm ${
                      i === active ? "bg-primary/15 text-primary" : "hover:bg-surface-2"
                    }`}
                  >
                    <span>{f.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {s ? `${s.icon} ${s.text}` : filled ? "✓ Filled" : "• Empty"}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="space-y-6">
          <Panel>
            <SectionHeading eyebrow={`Section ${active + 1} of ${WORKSPACE_FIELDS.length}`} title={field.label} description={field.hint} />
            <label htmlFor="section-text" className="sr-only">{field.label}</label>
            <textarea
              id="section-text"
              rows={9}
              className="w-full rounded-lg border border-input bg-surface px-3 py-2.5 text-sm leading-relaxed"
              value={state.idea.fields[field.key]}
              onChange={(e) => updateIdeaField(field.key, e.target.value)}
              placeholder={field.hint}
            />
            {reviewFor(field.key) ? (
              <div className="mt-3 rounded-lg border border-border bg-surface-2 p-3">
                <div className="flex items-center gap-2">
                  <Pill tone={statusLabel(reviewFor(field.key)!.status).tone}>
                    {statusLabel(reviewFor(field.key)!.status).text}
                  </Pill>
                  <span className="label-caps">AI review</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{reviewFor(field.key)!.note}</p>
              </div>
            ) : null}
            <div className="mt-4 flex justify-between gap-3">
              <button type="button" disabled={active === 0} onClick={() => setActive((a) => a - 1)} className="rounded-lg border border-border px-4 py-2 text-sm disabled:opacity-40">
                Previous
              </button>
              <button type="button" disabled={active === WORKSPACE_FIELDS.length - 1} onClick={() => setActive((a) => a + 1)} className="rounded-lg border border-border px-4 py-2 text-sm disabled:opacity-40">
                Next section
              </button>
            </div>
          </Panel>

          {state.analysis ? (
            <Panel>
              <SectionHeading
                eyebrow={`AI assessment · ${new Date(state.analysis.generatedAt).toLocaleString()}`}
                title="What the review found"
                description={state.analysis.summary}
              />
              {state.analysis.aiFallbackNote ? (
                <p className="mb-4 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-xs text-warning">
                  {state.analysis.aiFallbackNote}
                </p>
              ) : null}

              <div className="grid gap-5 md:grid-cols-3">
                <div>
                  <p className="label-caps mb-2">Weak assumptions</p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {state.analysis.weakAssumptions.map((w) => <li key={w}>• {w}</li>)}
                  </ul>
                </div>
                <div>
                  <p className="label-caps mb-2">Questions to answer</p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {state.analysis.questions.map((q) => <li key={q}>• {q}</li>)}
                  </ul>
                </div>
                <div>
                  <p className="label-caps mb-2">Validation actions</p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {state.analysis.validationActions.map((a) => <li key={a}>• {a}</li>)}
                  </ul>
                </div>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                Based on the twelve sections you wrote, your selected category and stage. Nothing outside this workspace
                was used.
              </p>
            </Panel>
          ) : null}
        </div>
      </div>
    </div>
  );
}
