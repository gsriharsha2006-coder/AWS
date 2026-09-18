import { createFileRoute } from "@tanstack/react-router";
import { RequireRole } from "@/components/require-role";
import { Panel, Pill, SectionHeading } from "@/components/ui-bits";
import { UpgradeButton } from "@/components/upgrade-button";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/founder/membership")({
  head: () => ({
    meta: [
      { title: "Membership — Venture Connect" },
      { name: "description", content: "Free and premium Venture Connect membership for founders." },
      { property: "og:title", content: "Membership — Venture Connect" },
      { property: "og:description", content: "One lifetime readiness report free, five on premium." },
    ],
  }),
  component: () => (
    <RequireRole role="founder">
      <Membership />
    </RequireRole>
  ),
});

function Membership() {
  const { state, update } = useStore();

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Membership"
        title="Choose how much readiness analysis you need"
        description="Checkout runs on Razorpay test mode and is switched on once the test API keys are added to this project."
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Panel>
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold">Free</h3>
            {state.founderPlan === "free" ? <Pill tone="success">Current plan</Pill> : null}
          </div>
          <p className="mt-1 font-display text-2xl font-semibold">₹0</p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>• 1 lifetime VC Readiness report</li>
            <li>• Full Idea Workspace and AI structure review</li>
            <li>• Opportunity discovery and matching</li>
          </ul>
        </Panel>

        <Panel>
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold">Premium</h3>
            {state.founderPlan === "premium" ? <Pill tone="success">Current plan</Pill> : <Pill tone="primary">Upgrade</Pill>}
          </div>
          <p className="mt-1 font-display text-2xl font-semibold">₹199</p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>• 5 premium VC Readiness reports</li>
            <li>• Deeper readiness analysis and moat notes</li>
            <li>• Advanced opportunity intelligence</li>
          </ul>
          {state.founderPlan === "premium" ? null : (
            <UpgradeButton
              plan="founder_premium"
              label="Premium ₹199"
              prefill={{ name: state.founder.name, email: state.founder.email }}
              onActivated={() => update({ founderPlan: "premium" })}
            />
          )}
        </Panel>
      </div>

      <Panel>
        <p className="text-sm text-muted-foreground">
          Reports used: <strong>{state.reportsUsed}</strong> of {state.founderPlan === "premium" ? 5 : 1}.
        </p>
      </Panel>
    </div>
  );
}
