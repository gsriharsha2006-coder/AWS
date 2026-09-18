import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Razorpay TEST MODE checkout.
 *
 * Flow: select plan -> createPaymentOrder (server) -> Razorpay Checkout
 * (browser) -> verifyPayment (server, HMAC signature check) -> entitlement
 * activated. The browser never sees RAZORPAY_KEY_SECRET and an entitlement is
 * only written after the server verifies the signature.
 */

const PLANS = {
  founder_premium: { amountPaise: 19900, label: "Founder Premium" },
  partner_pro: { amountPaise: 49900, label: "Partner Pro" },
} as const;

type PlanKey = keyof typeof PLANS;

const planInput = z.object({ plan: z.enum(["founder_premium", "partner_pro"]) });

const verifyInput = z.object({
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});

function razorpayCredentials() {
  const keyId = process.env["RAZORPAY_KEY_ID"];
  const keySecret = process.env["RAZORPAY_KEY_SECRET"];
  if (!keyId || !keySecret) throw new Error("Payments are not configured for this workspace yet.");
  return { keyId, keySecret };
}

export const createPaymentOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => planInput.parse(input))
  .handler(async ({ data, context }) => {
    const { keyId, keySecret } = razorpayCredentials();
    const plan = data.plan as PlanKey;
    const { amountPaise, label } = PLANS[plan];

    const res = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${btoa(`${keyId}:${keySecret}`)}`,
      },
      body: JSON.stringify({
        amount: amountPaise,
        currency: "INR",
        receipt: `vc_${plan}_${Date.now()}`,
        notes: { plan, label, userId: context.userId },
      }),
    });

    if (!res.ok) {
      console.error("Razorpay order creation failed:", res.status, await res.text());
      throw new Error("The payment could not be started. Please try again in a moment.");
    }

    const order = (await res.json()) as { id: string };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("payments").insert({
      user_id: context.userId,
      plan,
      amount_paise: amountPaise,
      razorpay_order_id: order.id,
      status: "created",
    });
    if (error) {
      console.error("Could not record the payment order:", error);
      throw new Error("The payment could not be started. Please try again in a moment.");
    }

    return { orderId: order.id, amountPaise, keyId, plan, label, testMode: keyId.startsWith("rzp_test_") };
  });

export const verifyPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => verifyInput.parse(input))
  .handler(async ({ data, context }) => {
    const { keySecret } = razorpayCredentials();
    const { createHmac, timingSafeEqual } = await import("node:crypto");

    const expected = createHmac("sha256", keySecret)
      .update(`${data.razorpayOrderId}|${data.razorpayPaymentId}`)
      .digest("hex");
    const given = Buffer.from(data.razorpaySignature);
    const mine = Buffer.from(expected);
    if (given.length !== mine.length || !timingSafeEqual(given, mine)) {
      throw new Error("This payment could not be verified. You have not been charged twice — please try again.");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("payments")
      .select("plan, user_id, status")
      .eq("razorpay_order_id", data.razorpayOrderId)
      .maybeSingle();

    if (error || !row || row.user_id !== context.userId) {
      throw new Error("We could not match this payment to your account. Please contact support.");
    }

    await supabaseAdmin
      .from("payments")
      .update({ status: "paid", razorpay_payment_id: data.razorpayPaymentId })
      .eq("razorpay_order_id", data.razorpayOrderId);

    await supabaseAdmin
      .from("entitlements")
      .upsert({ user_id: context.userId, plan: row.plan, activated_at: new Date().toISOString() });

    return { plan: row.plan as PlanKey };
  });

export const getEntitlement = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("entitlements")
      .select("plan, activated_at")
      .eq("user_id", context.userId)
      .maybeSingle();
    return { plan: (data?.plan ?? "free") as "free" | PlanKey, activatedAt: data?.activated_at ?? null };
  });
