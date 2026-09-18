import { createFileRoute } from "@tanstack/react-router";
import { RequireRole } from "@/components/require-role";
import { Panel, Pill, SectionHeading } from "@/components/ui-bits";
import { UpgradeButton } from "@/components/upgrade-button";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/partner/membership")({
  head: () => ({
    meta: [
      { title: "Partner plan — Venture Connect" },
      { name: "description", content: "Free and Partner Pro plans for organizations posting opportunities." },
      { property: "og:title", content: "Partner plan — Venture Connect" },
      { property: "og:description", content: "More postings, wider distribution and deeper analytics on Partner Pro." },
    ],
  }),
  component: () => (
    <RequireRole role="partner">
      <PartnerMembership />
    </RequireRole>
  ),
});

function PartnerMembership() {
  const { state, update } = useStore();
  const isPro = state.partnerPlan === "pro";

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Organization plan"
        title="Reach the founders who actually fit your programme"
        description="Checkout runs in Razorpay test mode. Your plan is activated only after the payment is verified on our server."
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Panel>
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold">Free</h3>
            {isPro ? null : <Pill tone="success">Current plan</Pill>}
          </div>
          <p className="mt-1 font-display text-2xl font-semibold">₹0</p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>• 2 published opportunities</li>
            <li>• Review queue and interest-based messaging</li>
            <li>• Basic application analytics</li>
          </ul>
        </Panel>

        <Panel>
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold">Partner Pro</h3>
            {isPro ? <Pill tone="success">Current plan</Pill> : <Pill tone="primary">Upgrade</Pill>}
          </div>
          <p className="mt-1 font-display text-2xl font-semibold">₹499</p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>• Additional opportunity postings</li>
            <li>• Enhanced visibility in founder matching</li>
            <li>• Advanced application and cohort analytics</li>
            <li>• Premium distribution to matched founders</li>
          </ul>
          {isPro ? null : (
            <UpgradeButton
              plan="partner_pro"
              label="Partner Pro ₹499"
              prefill={{ name: state.partner.organization, email: state.partner.contactEmail }}
              onActivated={() => update({ partnerPlan: "pro" })}
            />
          )}
        </Panel>
      </div>
    </div>
  );
}
