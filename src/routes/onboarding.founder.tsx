import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { BrandMark } from "@/components/brand";
import { saveFounderOnboarding } from "@/lib/auth.functions";
import { useStore } from "@/lib/store";
import type { Category, Stage } from "@/lib/types";

export const Route = createFileRoute("/onboarding/founder")({
  head: () => ({
    meta: [
      { title: "Founder onboarding — Venture Connect" },
      { name: "description", content: "Set up your founder profile so opportunities can be matched to your stage." },
      { property: "og:title", content: "Founder onboarding — Venture Connect" },
      { property: "og:description", content: "Five short steps to a matched founder profile." },
    ],
  }),
  component: FounderOnboarding,
});

const STEPS = ["Personal", "Education", "Skills & interests", "Startup / idea", "Goals"];
const CATEGORIES: Category[] = ["AI", "SaaS", "FinTech", "HealthTech", "EdTech", "Marketplace", "Consumer", "DeepTech", "Other"];
const STAGES: Stage[] = ["Idea", "Prototype", "MVP", "Early Revenue"];

function FounderOnboarding() {
  const { state, update } = useStore();
  const saveOnboarding = useServerFn(saveFounderOnboarding);
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [f, setF] = useState(state.founder);
  const [idea, setIdea] = useState(state.idea);
  const [goal, setGoal] = useState("");

  async function finish() {
    update({
      founder: { ...f, onboarded: true },
      idea,
      role: "founder",
    });
    try {
      await saveOnboarding({ data: { fullName: f.name } });
    } catch {
      /* demo accounts have no backend profile — the local workspace still works */
    }
    void navigate({ to: "/founder" });
  }

  const input = "mt-1 w-full rounded-lg border border-input bg-surface px-3 py-2.5 text-sm";

  return (
    <div className="aurora-bg min-h-screen bg-background">
      <header className="mx-auto max-w-3xl px-5 py-6">
        <BrandMark size="sm" />
      </header>
      <main className="mx-auto max-w-3xl px-5 pb-20">
        <ol className="mb-6 flex flex-wrap gap-2 text-xs" aria-label="Onboarding steps">
          {STEPS.map((s, i) => (
            <li
              key={s}
              aria-current={i === step ? "step" : undefined}
              className={`rounded-full border px-3 py-1 ${
                i === step ? "border-primary bg-primary/15 text-primary" : i < step ? "border-success/40 text-success" : "border-border text-muted-foreground"
              }`}
            >
              {i + 1}. {s}
            </li>
          ))}
        </ol>

        <div className="surface-panel p-6">
          <h1 className="font-display text-2xl font-semibold">{STEPS[step]}</h1>

          {step === 0 ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="fname" className="label-caps">Full name</label>
                <input id="fname" className={input} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
              </div>
              <div>
                <label htmlFor="floc" className="label-caps">Location</label>
                <input id="floc" className={input} placeholder="City, country" value={f.location} onChange={(e) => setF({ ...f, location: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="flinks" className="label-caps">Portfolio / links</label>
                <input id="flinks" className={input} value={f.links} onChange={(e) => setF({ ...f, links: e.target.value })} />
              </div>
            </div>
          ) : null}

          {step === 1 ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="fcol" className="label-caps">College / institution</label>
                <input id="fcol" className={input} value={f.college} onChange={(e) => setF({ ...f, college: e.target.value })} />
              </div>
              <div>
                <label htmlFor="fedu" className="label-caps">Education</label>
                <input id="fedu" className={input} placeholder="B.Tech, 3rd year" value={f.education} onChange={(e) => setF({ ...f, education: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="fbr" className="label-caps">Branch / field</label>
                <input id="fbr" className={input} value={f.branch} onChange={(e) => setF({ ...f, branch: e.target.value })} />
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="mt-4 grid gap-4">
              <div>
                <label htmlFor="fsk" className="label-caps">Skills (comma separated)</label>
                <input
                  id="fsk"
                  className={input}
                  value={f.skills.join(", ")}
                  onChange={(e) => setF({ ...f, skills: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
                />
              </div>
              <div>
                <label htmlFor="fin" className="label-caps">Startup interests (comma separated)</label>
                <input
                  id="fin"
                  className={input}
                  value={f.interests.join(", ")}
                  onChange={(e) => setF({ ...f, interests: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
                />
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="iname" className="label-caps">Venture / idea name</label>
                <input id="iname" className={input} value={idea.name} onChange={(e) => setIdea({ ...idea, name: e.target.value })} />
              </div>
              <div>
                <label htmlFor="icat" className="label-caps">Category</label>
                <select id="icat" className={input} value={idea.category} onChange={(e) => setIdea({ ...idea, category: e.target.value as Category })}>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="istg" className="label-caps">Stage</label>
                <select id="istg" className={input} value={idea.stage} onChange={(e) => setIdea({ ...idea, stage: e.target.value as Stage })}>
                  {STAGES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="ione" className="label-caps">One line description</label>
                <input id="ione" className={input} value={idea.oneLiner} onChange={(e) => setIdea({ ...idea, oneLiner: e.target.value })} />
              </div>
            </div>
          ) : null}

          {step === 4 ? (
            <div className="mt-4">
              <label htmlFor="goal" className="label-caps">What do you want from the ecosystem right now?</label>
              <textarea
                id="goal"
                rows={4}
                className={input}
                placeholder="Incubation, a first grant, co-founders, pilot customers…"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
              />
              <p className="mt-4 rounded-lg border border-border bg-surface-2 px-4 py-3 text-sm">
                <span className="font-display font-semibold">You're ready to build.</span> Your next step is the Idea
                Workspace — structure the idea, then run the readiness assessment.
              </p>
            </div>
          ) : null}

          <div className="mt-6 flex justify-between gap-3">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="rounded-lg border border-border px-4 py-2.5 text-sm disabled:opacity-40"
            >
              Back
            </button>
            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
              >
                Continue
              </button>
            ) : (
              <button
                type="button"
                onClick={finish}
                className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
              >
                Enter my dashboard
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
