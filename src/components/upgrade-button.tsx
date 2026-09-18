import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { ErrorNote } from "@/components/ui-bits";
import { createPaymentOrder, verifyPayment } from "@/lib/payments.functions";
import { openRazorpayCheckout } from "@/lib/razorpay-checkout";

/**
 * Razorpay TEST MODE upgrade button. The order is created server-side and the
 * entitlement is only activated after the server verifies the signature.
 */
export function UpgradeButton({
  plan,
  label,
  prefill,
  onActivated,
}: {
  plan: "founder_premium" | "partner_pro";
  label: string;
  prefill: { name?: string; email?: string };
  onActivated: () => void;
}) {
  const createOrder = useServerFn(createPaymentOrder);
  const verify = useServerFn(verifyPayment);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pay() {
    setBusy(true);
    setError(null);
    try {
      const order = await createOrder({ data: { plan } });
      const result = await openRazorpayCheckout(order, prefill);
      await verify({ data: result });
      toast.success(`${label} activated`, { description: "Your upgrade was verified on the server." });
      onActivated();
    } catch (e) {
      const message = e instanceof Error ? e.message : "The payment could not be completed.";
      if (message === "Payment cancelled.") {
        setError("Payment cancelled — nothing was charged.");
      } else {
        setError(message);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-5">
      <button
        type="button"
        onClick={() => void pay()}
        disabled={busy}
        className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
      >
        {busy ? "Opening secure checkout…" : `Pay with Razorpay — ${label}`}
      </button>
      <p className="mt-2 text-xs text-muted-foreground">
        Razorpay test mode. Payment is verified on the server before your plan is activated; the secret key never
        reaches your browser.
      </p>
      {error ? <div className="mt-3"><ErrorNote message={error} /></div> : null}
    </div>
  );
}
