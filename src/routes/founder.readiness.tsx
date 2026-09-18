import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { AiInfrastructureNote } from "@/components/ai-infrastructure-note";
import { RequireRole } from "@/components/require-role";
import { ErrorNote, Panel, Pill, ScoreBar, SectionHeading } from "@/components/ui-bits";
import { generateReadiness } from "@/lib/ai.functions";
import { useStore } from "@/lib/store";
import type { Category, ReadinessReport, Stage } from "@/lib/types";

export const Route = createFileRoute("/founder/readiness")({
  head: () => ({
    meta: [
      { title: "VC Readiness — Venture Connect" },
      { name: "description", content: "An AI assessment of investor readiness, moat, execution, market, defensibility and scalability." },
      { property: "og:title", content: "VC Readiness — Venture Connect" },
      { property: "og:description", content: "Scores, SWOT, observations and three prioritised actions." },
    ],
  }),
  component: () => (
    <RequireRole role="founder">
      <Readiness />
    </RequireRole>
  ),
});

const CATEGORIES: Category[] = ["AI", "SaaS", "FinTech", "HealthTech", "EdTech", "Marketplace", "Consumer", "DeepTech", "Other"];
const STAGES: Stage[] = ["Idea", "Prototype", "MVP", "Early Revenue"];

function Readiness() {
  const { state, update } = useStore();
  const run = useServerFn(generateReadiness);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const limit = state.founderPlan === "premium" ? 5 : 1;
  const remaining = Math.max(0, limit - state.reportsUsed);

  const [form, setForm] = useState({
    entityName: state.idea.name,
    targetCapital: state.idea.fields.funds || "",
    category: state.idea.category,
    stage: state.idea.stage,
    pitch: state.idea.oneLiner || state.idea.fields.solution,
    moats: state.idea.fields.competition,
    market: state.idea.fields.market,
    validation: state.idea.fields.validation,
    traction: state.idea.fields.traction,
  });

  async function generate() {
    if (remaining <= 0) {
      toast.error("Report limit reached", { description: "Upgrade in Membership to generate more reports." });
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const report = await run({ data: form });
      update({ readiness: report as unknown as ReadinessReport, reportsUsed: state.reportsUsed + 1 });
      toast.success("VC Readiness report generated");
    } catch (e) {
      setError(e instanceof Error ? e.message : "The report could not be generated. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const input = "mt-1 w-full rounded-lg border border-input bg-surface px-3 py-2.5 text-sm";
  const r = state.readiness;

  return (
    <div className="space-y-6">
      <Panel>
        <SectionHeading
          eyebrow="Assessment, not investment advice"
          title="VC Readiness Report"
          description="Scores are AI assessments based on what you have written — not measurements, not investor approval, and not a funding guarantee."
          action={<Pill tone="muted">{remaining} of {limit} reports left</Pill>}
        />
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="ent" className="label-caps">Entity name</label>
            <input id="ent" className={input} value={form.entityName} onChange={(e) => setForm({ ...form, entityName: e.target.value })} />
          </div>
          <div>
            <label htmlFor="cap" className="label-caps">Target capital</label>
            <input id="cap" className={input} placeholder="₹15 lakh" value={form.targetCapital} onChange={(e) => setForm({ ...form, targetCapital: e.target.value })} />
          </div>
          <div>
            <label htmlFor="cat" className="label-caps">Category</label>
            <select id="cat" className={input} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as Category })}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="stg" className="label-caps">Stage</label>
            <select id="stg" className={input} value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value as Stage })}>
              {STAGES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          {([
            ["pitch", "Pitch"],
            ["moats", "Technology / product moats"],
            ["market", "Market information"],
            ["validation", "Validation"],
            ["traction", "Traction"],
          ] as const).map(([key, label]) => (
            <div key={key} className="md:col-span-2">
              <label htmlFor={key} className="label-caps">{label}</label>
              <textarea
                id={key}
                rows={3}
                className={input}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              />
            </div>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => void generate()}
            disabled={busy}
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {busy ? "Assessing…" : r ? "Regenerate report" : "Generate report"}
          </button>
          <Link to="/founder/opportunities" className="rounded-lg border border-border px-5 py-2.5 text-sm hover:bg-surface-2">
            View opportunities
          </Link>
        </div>
        {busy ? <p className="mt-3 text-xs text-muted-foreground">This takes up to a minute — the model reads every section before scoring.</p> : null}
        {error ? <div className="mt-3"><ErrorNote message={error} /></div> : null}
        <AiInfrastructureNote />
      </Panel>

      {r ? (
        <>
          <section>
            <SectionHeading eyebrow={`AI assessment · ${new Date(r.generatedAt).toLocaleString()}`} title="Scores" />
            {r.aiFallbackNote ? (
              <p className="mb-4 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-xs text-warning">
                {r.aiFallbackNote}
              </p>
            ) : null}
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {r.scores.map((s) => (
                <ScoreBar key={s.key} label={s.label} score={s.score} explanation={s.explanation} />
              ))}
            </div>
          </section>

          <div className="grid gap-4 md:grid-cols-2">
            {([
              ["Strengths", r.swot.strengths],
              ["Weaknesses", r.swot.weaknesses],
              ["Opportunities", r.swot.opportunities],
              ["Threats", r.swot.threats],
            ] as const).map(([title, items]) => (
              <Panel key={title}>
                <p className="label-caps mb-2">{title}</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {items.map((i) => <li key={i}>• {i}</li>)}
                </ul>
              </Panel>
            ))}
          </div>

          <Panel>
            <SectionHeading title="Observations" />
            <ul className="space-y-2 text-sm text-muted-foreground">
              {r.observations.map((o) => <li key={o}>• {o}</li>)}
            </ul>
          </Panel>

          <Panel>
            <SectionHeading eyebrow="Valuation / moat note" title="What strengthens or weakens defensibility today" />
            <p className="text-sm leading-relaxed text-muted-foreground">{r.moatNote}</p>
          </Panel>

          <Panel>
            <SectionHeading eyebrow="Action plan" title="Top 3 priorities" />
            <ol className="space-y-3">
              {r.priorities.slice(0, 3).map((p, i) => (
                <li key={p} className="flex gap-3 rounded-lg border border-border bg-surface-2 p-4 text-sm">
                  <span className="font-display font-semibold text-primary">{i + 1}</span>
                  <span>{p}</span>
                </li>
              ))}
            </ol>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link to="/founder/workspace" className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">
                Improve my readiness
              </Link>
              <Link to="/founder/opportunities" className="rounded-lg border border-border px-5 py-2.5 text-sm hover:bg-surface-2">
                View opportunities
              </Link>
            </div>
          </Panel>
        </>
      ) : null}
    </div>
  );
}
