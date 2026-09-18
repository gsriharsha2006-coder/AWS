/** Browser-side Razorpay Checkout helper (test mode). No secrets here. */

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

function loadScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve();
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("The payment window could not be loaded. Check your connection."));
    document.body.appendChild(script);
  });
}

export interface CheckoutOrder {
  orderId: string;
  amountPaise: number;
  keyId: string;
  label: string;
}

export interface CheckoutResult {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export async function openRazorpayCheckout(
  order: CheckoutOrder,
  prefill: { name?: string; email?: string },
): Promise<CheckoutResult> {
  await loadScript();
  return new Promise<CheckoutResult>((resolve, reject) => {
    const Checkout = window.Razorpay;
    if (!Checkout) return reject(new Error("The payment window is unavailable right now."));
    const rzp = new Checkout({
      key: order.keyId,
      amount: order.amountPaise,
      currency: "INR",
      name: "Venture Connect",
      description: order.label,
      order_id: order.orderId,
      prefill,
      theme: { color: "#4f46e5" },
      handler: (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) =>
        resolve({
          razorpayOrderId: response.razorpay_order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature,
        }),
      modal: { ondismiss: () => reject(new Error("Payment cancelled.")) },
    });
    rzp.open();
  });
}
