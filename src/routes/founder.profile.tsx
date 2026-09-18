import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { RequireRole } from "@/components/require-role";
import { Panel, SectionHeading } from "@/components/ui-bits";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/founder/profile")({
  head: () => ({
    meta: [
      { title: "Founder profile — Venture Connect" },
      { name: "description", content: "Your founder profile drives opportunity matching and what partners see." },
      { property: "og:title", content: "Founder profile — Venture Connect" },
      { property: "og:description", content: "Control your details and what is publicly visible." },
    ],
  }),
  component: () => (
    <RequireRole role="founder">
      <Profile />
    </RequireRole>
  ),
});

function Profile() {
  const { state, update } = useStore();
  const f = state.founder;
  const input = "mt-1 w-full rounded-lg border border-input bg-surface px-3 py-2.5 text-sm";
  const set = (patch: Partial<typeof f>) => update({ founder: { ...f, ...patch } });

  return (
    <div className="space-y-6">
      <Panel>
        <SectionHeading eyebrow="Profile" title="Founder details" description="These fields feed opportunity matching." />
        <div className="grid gap-4 sm:grid-cols-2">
          {([
            ["name", "Full name"],
            ["email", "Email"],
            ["college", "College"],
            ["education", "Education"],
            ["branch", "Branch"],
            ["location", "Location"],
            ["links", "Portfolio / links"],
          ] as const).map(([key, label]) => (
            <div key={key}>
              <label htmlFor={key} className="label-caps">{label}</label>
              <input id={key} className={input} value={f[key]} onChange={(e) => set({ [key]: e.target.value })} />
            </div>
          ))}
          <div>
            <label htmlFor="skills" className="label-caps">Skills</label>
            <input
              id="skills"
              className={input}
              value={f.skills.join(", ")}
              onChange={(e) => set({ skills: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="interests" className="label-caps">Startup interests</label>
            <input
              id="interests"
              className={input}
              value={f.interests.join(", ")}
              onChange={(e) => set({ interests: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
            />
          </div>
        </div>

        <div className="mt-5 flex items-center gap-3">
          <input
            id="public"
            type="checkbox"
            checked={f.publicProfile}
            onChange={(e) => set({ publicProfile: e.target.checked })}
            className="h-4 w-4"
          />
          <label htmlFor="public" className="text-sm">
            Show my college, skills and current venture to partners I apply to
          </label>
        </div>

        <button
          type="button"
          onClick={() => toast.success("Profile saved")}
          className="mt-5 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          Save profile
        </button>
      </Panel>

      <Panel>
        <SectionHeading title="Current venture" />
        <p className="text-sm text-muted-foreground">
          {state.idea.name || "No venture named yet"} — {state.idea.stage} · {state.idea.category}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">{state.idea.oneLiner}</p>
      </Panel>
    </div>
  );
}
