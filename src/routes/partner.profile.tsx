import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { RequireRole } from "@/components/require-role";
import { Panel, Pill, SectionHeading } from "@/components/ui-bits";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/partner/profile")({
  head: () => ({
    meta: [
      { title: "Organization profile — Venture Connect" },
      { name: "description", content: "Your organization details, focus areas and verification status." },
      { property: "og:title", content: "Organization profile — Venture Connect" },
      { property: "og:description", content: "What founders see about your organization." },
    ],
  }),
  component: () => (
    <RequireRole role="partner">
      <OrgProfile />
    </RequireRole>
  ),
});

const ORG_TYPES = [
  "Incubator", "Investor", "Accelerator", "Startup Program", "College / University",
  "Innovation Cell", "Government Organization", "Corporate", "NGO", "Competition Organizer", "Other",
];

function OrgProfile() {
  const { state, update } = useStore();
  const p = state.partner;
  const input = "mt-1 w-full rounded-lg border border-input bg-surface px-3 py-2.5 text-sm";
  const set = (patch: Partial<typeof p>) => update({ partner: { ...p, ...patch } });

  return (
    <div className="space-y-6">
      <Panel>
        <SectionHeading
          eyebrow="Organization"
          title="Public organization profile"
          description="Founders see this on every opportunity you publish."
          action={
            <Pill tone={p.verification === "verified" ? "success" : p.verification === "pending" ? "warning" : "muted"}>
              {p.verification === "verified" ? "Verified" : p.verification === "pending" ? "Verification under review" : "Not verified"}
            </Pill>
          }
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="org" className="label-caps">Organization name</label>
            <input id="org" className={input} value={p.organization} onChange={(e) => set({ organization: e.target.value })} />
          </div>
          <div>
            <label htmlFor="type" className="label-caps">Organization type</label>
            <select id="type" className={input} value={p.orgType} onChange={(e) => set({ orgType: e.target.value })}>
              {ORG_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="web" className="label-caps">Website</label>
            <input id="web" className={input} value={p.website} onChange={(e) => set({ website: e.target.value })} />
          </div>
          <div>
            <label htmlFor="loc" className="label-caps">Location</label>
            <input id="loc" className={input} value={p.location} onChange={(e) => set({ location: e.target.value })} />
          </div>
          <div>
            <label htmlFor="mail" className="label-caps">Official contact email</label>
            <input id="mail" type="email" className={input} value={p.contactEmail} onChange={(e) => set({ contactEmail: e.target.value })} />
          </div>
          <div>
            <label htmlFor="focus" className="label-caps">Focus areas</label>
            <input
              id="focus"
              className={input}
              value={p.focusAreas.join(", ")}
              onChange={(e) => set({ focusAreas: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="desc" className="label-caps">Description</label>
            <textarea id="desc" rows={4} className={input} value={p.description} onChange={(e) => set({ description: e.target.value })} />
          </div>
        </div>
        <button
          type="button"
          onClick={() => toast.success("Organization profile saved")}
          className="mt-5 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          Save organization
        </button>
      </Panel>

      <Panel>
        <SectionHeading title="Verification" description="Trust indicators appear only once verification is completed by Venture Connect." />
        <p className="text-sm text-muted-foreground">
          Current status: <strong>{p.verification}</strong>. Organizations are never marked verified automatically. Until
          verification completes, your listings display as “source-linked” rather than “verified”.
        </p>
      </Panel>

      <Panel>
        <SectionHeading title="Published opportunities" />
        {state.partnerOpportunities.length === 0 ? (
          <p className="text-sm text-muted-foreground">No opportunities published yet.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {state.partnerOpportunities.map((o) => (
              <li key={o.id} className="flex justify-between gap-4 border-b border-border/60 pb-2 last:border-0">
                <span className="truncate">{o.title}</span>
                <span className="shrink-0 text-muted-foreground">{o.type}</span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
