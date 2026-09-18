import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { BrandMark } from "@/components/brand";
import { savePartnerOnboarding } from "@/lib/auth.functions";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/onboarding/partner")({
  head: () => ({
    meta: [
      { title: "Partner onboarding — Venture Connect" },
      { name: "description", content: "Set up your organization profile before posting opportunities." },
      { property: "og:title", content: "Partner onboarding — Venture Connect" },
      { property: "og:description", content: "Four short steps to a publishable organization profile." },
    ],
  }),
  component: PartnerOnboarding,
});

const STEPS = ["Organization", "Organization type", "Focus areas", "Verification & contact"];
const ORG_TYPES = [
  "Incubator",
  "Accelerator",
  "Investor",
  "Startup Program",
  "College Innovation Cell",
  "Innovation Organization",
  "Competition Organizer",
  "Government Program",
  "Corporate Startup Program",
];

function PartnerOnboarding() {
  const { state, update } = useStore();
  const saveOnboarding = useServerFn(savePartnerOnboarding);
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [p, setP] = useState(state.partner);

  const input = "mt-1 w-full rounded-lg border border-input bg-surface px-3 py-2.5 text-sm";
  const progress = [p.organization, p.orgType, p.focusAreas.length > 0, p.website, p.contactEmail].filter(Boolean).length;

  async function finish() {
    update({ partner: { ...p, onboarded: true, verification: p.website ? "pending" : "unverified" }, role: "partner" });
    try {
      await saveOnboarding({
        data: {
          organization: p.organization,
          contactPerson: p.contactEmail,
          orgType: p.orgType,
          website: p.website,
          location: p.location,
          description: p.description,
          focusAreas: p.focusAreas,
        },
      });
    } catch {
      /* demo accounts have no backend organization — the local console still works */
    }
    void navigate({ to: "/partner" });
  }

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
            <div className="mt-4 grid gap-4">
              <div>
                <label htmlFor="org" className="label-caps">Organization name</label>
                <input id="org" className={input} value={p.organization} onChange={(e) => setP({ ...p, organization: e.target.value })} />
              </div>
              <div>
                <label htmlFor="desc" className="label-caps">Description</label>
                <textarea id="desc" rows={4} className={input} value={p.description} onChange={(e) => setP({ ...p, description: e.target.value })} />
              </div>
              <div>
                <label htmlFor="loc" className="label-caps">Location</label>
                <input id="loc" className={input} value={p.location} onChange={(e) => setP({ ...p, location: e.target.value })} />
              </div>
            </div>
          ) : null}

          {step === 1 ? (
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {ORG_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setP({ ...p, orgType: t })}
                  aria-pressed={p.orgType === t}
                  className={`rounded-lg border px-3 py-2.5 text-left text-sm ${
                    p.orgType === t ? "border-primary bg-primary/15 text-primary" : "border-border hover:bg-surface-2"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          ) : null}

          {step === 2 ? (
            <div className="mt-4">
              <label htmlFor="focus" className="label-caps">Focus areas (comma separated)</label>
              <input
                id="focus"
                className={input}
                placeholder="AI, SaaS, HealthTech"
                value={p.focusAreas.join(", ")}
                onChange={(e) => setP({ ...p, focusAreas: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
              />
              <p className="mt-2 text-xs text-muted-foreground">
                Focus areas drive which founders see your opportunities as a strong match.
              </p>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="mt-4 grid gap-4">
              <div>
                <label htmlFor="web" className="label-caps">Official website</label>
                <input id="web" className={input} placeholder="https://" value={p.website} onChange={(e) => setP({ ...p, website: e.target.value })} />
              </div>
              <div>
                <label htmlFor="cmail" className="label-caps">Contact email</label>
                <input id="cmail" type="email" className={input} value={p.contactEmail} onChange={(e) => setP({ ...p, contactEmail: e.target.value })} />
              </div>
              <div>
                <p className="label-caps">Verification progress</p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-2" role="meter" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={5} aria-label="Verification progress">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${(progress / 5) * 100}%` }} />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Verification stays pending until a reviewer confirms your organization against its official website.
                  Nothing is labelled verified before that.
                </p>
              </div>
              <p className="rounded-lg border border-border bg-surface-2 px-4 py-3 text-sm">
                <span className="font-display font-semibold">Your organization is ready.</span> Next: post your first
                opportunity and run it through the quality gate.
              </p>
            </div>
          ) : null}

          <div className="mt-6 flex justify-between gap-3">
            <button type="button" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} className="rounded-lg border border-border px-4 py-2.5 text-sm disabled:opacity-40">
              Back
            </button>
            {step < STEPS.length - 1 ? (
              <button type="button" onClick={() => setStep((s) => s + 1)} className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">
                Continue
              </button>
            ) : (
              <button type="button" onClick={finish} className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">
                Enter partner console
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
