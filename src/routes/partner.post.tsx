import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { RequireRole } from "@/components/require-role";
import { Panel, Pill, SectionHeading } from "@/components/ui-bits";
import { useStore } from "@/lib/store";
import type { Category, Opportunity, OpportunityType, Stage } from "@/lib/types";

export const Route = createFileRoute("/partner/post")({
  head: () => ({
    meta: [
      { title: "Post an opportunity — Venture Connect" },
      { name: "description", content: "A guided seven-step workflow with a quality gate before anything is published." },
      { property: "og:title", content: "Post an opportunity — Venture Connect" },
      { property: "og:description", content: "Publish clear, complete opportunities founders can actually act on." },
    ],
  }),
  component: () => (
    <RequireRole role="partner">
      <PostOpportunity />
    </RequireRole>
  ),
});

const STEPS = [
  "Basic info",
  "Founder eligibility",
  "Timing",
  "Benefits",
  "Application",
  "Verification",
  "Review & publish",
];

const TYPES: OpportunityType[] = [
  "Incubator", "Accelerator", "Investor", "Hackathon", "Startup Program",
  "Innovation Challenge", "Government Program", "Fellowship", "Competition",
  "Grant", "Pitch Competition", "College Innovation Program",
];
const STAGES: Stage[] = ["Idea", "Prototype", "MVP", "Early Revenue"];
const CATEGORIES: Category[] = ["AI", "SaaS", "FinTech", "HealthTech", "EdTech", "Marketplace", "Consumer", "DeepTech", "Other"];

type Draft = {
  title: string;
  type: OpportunityType;
  description: string;
  eligibility: string;
  audience: string;
  stages: Stage[];
  categories: Category[];
  location: string;
  mode: "Online" | "In-person" | "Hybrid";
  opensOn: string;
  deadline: string;
  benefits: string;
  applicationUrl: string;
  requiredDocuments: string;
  sourceUrl: string;
  requiresWorkspace: boolean;
};

type Issue = { field: string; problem: string; why: string; fix: string };

function runQualityGate(d: Draft, existingTitles: string[]) {
  const issues: Issue[] = [];
  const add = (field: string, problem: string, why: string, fix: string) =>
    issues.push({ field, problem, why, fix });

  if (d.title.trim().length < 8)
    add("Title", "The title is missing or too short.", "Founders scan titles first and skip listings they cannot understand.", "Write a specific title, e.g. “Applied AI Incubation Track — Cohort 4”.");
  if (existingTitles.some((t) => t.toLowerCase() === d.title.trim().toLowerCase()))
    add("Title", "You already have a published opportunity with this exact title.", "Duplicates split applications and confuse founders.", "Rename this listing or edit the existing one.");
  if (d.description.trim().length < 120)
    add("Description", "The description is shorter than 120 characters.", "Founders cannot judge fit from a one-line description.", "Describe what the programme does, who it is for, and what happens after selection.");
  if (/lorem|tbd|to be decided|xxx/i.test(d.description))
    add("Description", "The description contains placeholder text.", "Placeholder copy signals an unfinished listing.", "Replace it with the real programme description.");
  if (d.eligibility.split("\n").filter((l) => l.trim()).length < 2)
    add("Eligibility", "Fewer than two eligibility criteria are listed.", "Vague eligibility produces unqualified applications for you and wasted effort for founders.", "List each criterion on its own line.");
  if (d.stages.length === 0)
    add("Stages", "No startup stage is selected.", "Stage drives matching; without it your listing reaches the wrong founders.", "Select every stage you will accept.");
  if (d.stages.includes("Early Revenue") && /idea[- ]?stage only/i.test(d.eligibility))
    add("Eligibility", "Eligibility says idea-stage only but Early Revenue is accepted.", "Contradictory eligibility makes founders self-select incorrectly.", "Align the stage selection with the written criteria.");
  if (d.deadline !== "Rolling") {
    const t = Date.parse(d.deadline);
    if (Number.isNaN(t)) add("Deadline", "The deadline is not a valid date.", "Founders plan around deadlines and urgency labels depend on it.", "Pick a date, or set the deadline to Rolling.");
    else if (t < Date.now()) add("Deadline", "The deadline is in the past.", "An expired listing wastes every founder who opens it.", "Set a future deadline or mark it Rolling.");
  }
  if (d.benefits.split("\n").filter((l) => l.trim()).length < 2)
    add("Benefits", "Fewer than two benefits are listed.", "Founders compare opportunities by what they receive.", "List concrete benefits — funding, mentorship, space, credits, demo day.");
  if (!d.applicationUrl.trim() && !d.requiresWorkspace)
    add("Application", "There are no application instructions.", "Founders will not know how to apply.", "Add an application URL, or accept in-platform applications.");

  const status: "READY TO SUBMIT" | "NEEDS REVISION" | "INCOMPLETE" =
    issues.length === 0 ? "READY TO SUBMIT" : issues.length > 3 ? "INCOMPLETE" : "NEEDS REVISION";
  return { status, issues };
}

function PostOpportunity() {
  const { state, publishOpportunity } = useStore();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [checked, setChecked] = useState<ReturnType<typeof runQualityGate> | null>(null);
  const [d, setD] = useState<Draft>({
    title: "",
    type: "Incubator",
    description: "",
    eligibility: "",
    audience: "Student founders and early-stage teams",
    stages: ["Idea", "Prototype"],
    categories: ["AI"],
    location: state.partner.location || "India",
    mode: "Hybrid",
    opensOn: "",
    deadline: "",
    benefits: "",
    applicationUrl: "",
    requiredDocuments: "",
    sourceUrl: state.partner.website || "",
    requiresWorkspace: true,
  });

  const set = (patch: Partial<Draft>) => {
    setD((p) => ({ ...p, ...patch }));
    setChecked(null);
  };
  const input = "mt-1 w-full rounded-lg border border-input bg-surface px-3 py-2.5 text-sm";

  function toggle<T>(list: T[], v: T): T[] {
    return list.includes(v) ? list.filter((x) => x !== v) : [...list, v];
  }

  function publish() {
    const result = runQualityGate(d, state.partnerOpportunities.map((o) => o.title));
    setChecked(result);
    if (result.status !== "READY TO SUBMIT") {
      toast.error("Not published", { description: "Resolve the listed issues, then re-check." });
      return;
    }
    const opp: Opportunity = {
      id: `partner-${Date.now()}`,
      origin: "demo",
      title: d.title.trim(),
      organization: state.partner.organization || "Your organization",
      type: d.type,
      description: d.description.trim(),
      eligibility: d.eligibility.split("\n").map((s) => s.trim()).filter(Boolean),
      audience: d.audience,
      stages: d.stages,
      categories: d.categories,
      location: d.location,
      mode: d.mode,
      ...(d.opensOn ? { opensOn: d.opensOn } : {}),
      deadline: d.deadline || "Rolling",
      benefits: d.benefits.split("\n").map((s) => s.trim()).filter(Boolean),
      applicationUrl: d.applicationUrl.trim(),
      sourceUrl: d.sourceUrl.trim(),
      verification: state.partner.verification === "verified" ? "verified" : "source-linked",
      requiresWorkspace: d.requiresWorkspace,
      requiredDocuments: d.requiredDocuments.split("\n").map((s) => s.trim()).filter(Boolean),
      status: "published",
    };
    publishOpportunity(opp);
    toast.success("Opportunity published", { description: "Founders can now discover and apply to it." });
    void navigate({ to: "/partner/opportunities" });
  }

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow={`Step ${step + 1} of ${STEPS.length}`}
        title={STEPS[step]!}
        description="Nothing is published until the quality gate passes."
      />

      <ol className="flex flex-wrap gap-2 text-xs">
        {STEPS.map((s, i) => (
          <li key={s}>
            <button
              type="button"
              onClick={() => setStep(i)}
              aria-current={i === step ? "step" : undefined}
              className={`rounded-full border px-3 py-1.5 ${i === step ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground hover:bg-surface-2"}`}
            >
              {i + 1}. {s}
            </button>
          </li>
        ))}
      </ol>

      <Panel>
        {step === 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="title" className="label-caps">Opportunity title</label>
              <input id="title" className={input} value={d.title} onChange={(e) => set({ title: e.target.value })} />
            </div>
            <div>
              <label htmlFor="type" className="label-caps">Type</label>
              <select id="type" className={input} value={d.type} onChange={(e) => set({ type: e.target.value as OpportunityType })}>
                {TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="mode" className="label-caps">Mode</label>
              <select id="mode" className={input} value={d.mode} onChange={(e) => set({ mode: e.target.value as Draft["mode"] })}>
                <option>Online</option><option>In-person</option><option>Hybrid</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="desc" className="label-caps">Description</label>
              <textarea id="desc" rows={5} className={input} value={d.description} onChange={(e) => set({ description: e.target.value })} />
            </div>
            <div>
              <label htmlFor="loc" className="label-caps">Location</label>
              <input id="loc" className={input} value={d.location} onChange={(e) => set({ location: e.target.value })} />
            </div>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="space-y-4">
            <div>
              <label htmlFor="elig" className="label-caps">Eligibility criteria (one per line)</label>
              <textarea id="elig" rows={5} className={input} value={d.eligibility} onChange={(e) => set({ eligibility: e.target.value })} />
            </div>
            <div>
              <label htmlFor="aud" className="label-caps">Who this is for</label>
              <input id="aud" className={input} value={d.audience} onChange={(e) => set({ audience: e.target.value })} />
            </div>
            <fieldset>
              <legend className="label-caps mb-2">Accepted stages</legend>
              <div className="flex flex-wrap gap-2">
                {STAGES.map((s) => (
                  <button key={s} type="button" onClick={() => set({ stages: toggle(d.stages, s) })}
                    aria-pressed={d.stages.includes(s)}
                    className={`rounded-full border px-3 py-1.5 text-sm ${d.stages.includes(s) ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground"}`}>
                    {s}
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend className="label-caps mb-2">Focus categories</legend>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((c) => (
                  <button key={c} type="button" onClick={() => set({ categories: toggle(d.categories, c) })}
                    aria-pressed={d.categories.includes(c)}
                    className={`rounded-full border px-3 py-1.5 text-sm ${d.categories.includes(c) ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground"}`}>
                    {c}
                  </button>
                ))}
              </div>
            </fieldset>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="opens" className="label-caps">Applications open (optional)</label>
              <input id="opens" type="date" className={input} value={d.opensOn} onChange={(e) => set({ opensOn: e.target.value })} />
            </div>
            <div>
              <label htmlFor="dl" className="label-caps">Deadline</label>
              <input id="dl" type="date" className={input} value={d.deadline === "Rolling" ? "" : d.deadline} onChange={(e) => set({ deadline: e.target.value })} />
              <button type="button" onClick={() => set({ deadline: "Rolling" })} className="mt-2 text-xs text-primary underline underline-offset-4">
                Applications are rolling
              </button>
              {d.deadline === "Rolling" ? <p className="mt-1 text-xs text-muted-foreground">Set to rolling.</p> : null}
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div>
            <label htmlFor="ben" className="label-caps">Benefits (one per line)</label>
            <textarea id="ben" rows={6} className={input} value={d.benefits} onChange={(e) => set({ benefits: e.target.value })} />
            <p className="mt-2 text-xs text-muted-foreground">
              Only list benefits your organisation can actually provide.
            </p>
          </div>
        ) : null}

        {step === 4 ? (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <input id="ws" type="checkbox" className="mt-1 h-4 w-4" checked={d.requiresWorkspace} onChange={(e) => set({ requiresWorkspace: e.target.checked })} />
              <label htmlFor="ws" className="text-sm">
                Require a substantially complete idea workspace before a founder can apply
              </label>
            </div>
            <div>
              <label htmlFor="url" className="label-caps">External application URL (optional)</label>
              <input id="url" className={input} value={d.applicationUrl} onChange={(e) => set({ applicationUrl: e.target.value })} />
            </div>
            <div>
              <label htmlFor="docs" className="label-caps">Required documents (one per line)</label>
              <textarea id="docs" rows={4} className={input} value={d.requiredDocuments} onChange={(e) => set({ requiredDocuments: e.target.value })} />
            </div>
          </div>
        ) : null}

        {step === 5 ? (
          <div className="space-y-4">
            <div>
              <label htmlFor="src" className="label-caps">Official source URL</label>
              <input id="src" className={input} value={d.sourceUrl} onChange={(e) => set({ sourceUrl: e.target.value })} />
            </div>
            <p className="rounded-lg border border-border bg-surface-2 px-4 py-3 text-sm text-muted-foreground">
              Organisation verification status: <strong>{state.partner.verification}</strong>. Listings are marked
              “verified” only when your organisation has been verified — you cannot set that yourself.
            </p>
          </div>
        ) : null}

        {step === 6 ? (
          <div className="space-y-5">
            <div className="rounded-xl border border-border bg-surface-2/50 p-5">
              <p className="label-caps">Preview</p>
              <h3 className="mt-2 font-display text-lg font-semibold">{d.title || "Untitled opportunity"}</h3>
              <p className="text-sm text-muted-foreground">{state.partner.organization || "Your organization"} · {d.type} · {d.mode}</p>
              <p className="mt-3 text-sm text-muted-foreground">{d.description || "No description yet."}</p>
              <p className="mt-3 text-xs text-muted-foreground">Deadline: {d.deadline || "not set"} · Stages: {d.stages.join(", ") || "none"}</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setChecked(runQualityGate(d, state.partnerOpportunities.map((o) => o.title)))}
                className="rounded-lg border border-border px-4 py-2.5 text-sm hover:bg-surface-2"
              >
                Run quality check
              </button>
              <button type="button" onClick={publish} className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">
                Publish opportunity
              </button>
            </div>

            {checked ? (
              <div className="space-y-3">
                <Pill tone={checked.status === "READY TO SUBMIT" ? "success" : checked.status === "INCOMPLETE" ? "danger" : "warning"}>
                  {checked.status}
                </Pill>
                {checked.issues.map((iss) => (
                  <div key={iss.field + iss.problem} className="rounded-lg border border-warning/35 bg-warning/8 p-4 text-sm">
                    <p className="font-medium">{iss.field}: {iss.problem}</p>
                    <p className="mt-1 text-muted-foreground">Why it matters: {iss.why}</p>
                    <p className="mt-1 text-muted-foreground">Suggested correction: {iss.fix}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="mt-6 flex justify-between gap-3">
          <button type="button" disabled={step === 0} onClick={() => setStep((s) => s - 1)}
            className="rounded-lg border border-border px-4 py-2.5 text-sm disabled:opacity-40">
            Back
          </button>
          <button type="button" disabled={step === STEPS.length - 1} onClick={() => setStep((s) => s + 1)}
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-40">
            Continue
          </button>
        </div>
      </Panel>
    </div>
  );
}
