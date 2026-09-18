import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AuthShell, Field, FormNotice, inputClass } from "@/components/auth-kit";
import { supabase } from "@/integrations/supabase/client";
import { friendlyAuthError } from "@/lib/auth-messages";

export const Route = createFileRoute("/auth/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset your password — Venture Connect" },
      {
        name: "description",
        content: "Request a password reset link for your Venture Connect founder or partner account.",
      },
      { property: "og:title", content: "Reset your password — Venture Connect" },
      { property: "og:description", content: "Password reset for Venture Connect accounts." },
    ],
  }),
  component: ForgotPassword,
});

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setNotice(null);
    setBusy(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      if (error) throw error;
      setSent(true);
    } catch (error) {
      setNotice(friendlyAuthError(error, "We couldn't start the reset. Please try again."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      title="Reset your password"
      subtitle="We'll email you a link to set a new password."
      footer={
        <>
          <Link to="/auth/founder/login" className="underline underline-offset-4">
            Founder sign in
          </Link>
          {" · "}
          <Link to="/auth/partner/login" className="underline underline-offset-4">
            Partner sign in
          </Link>
        </>
      }
    >
      {sent ? (
        <p role="status" className="mt-5 rounded-lg border border-border bg-surface-2 px-3 py-3 text-sm">
          If an account exists for that email, a reset link is on its way. The link is valid for a
          short time — open it on this device to set a new password.
        </p>
      ) : (
        <form className="mt-5 space-y-3" onSubmit={submit}>
          <Field id="email" label="Email">
            <input
              id="email"
              type="email"
              required
              className={inputClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </Field>
          {notice ? <FormNotice message={notice} /> : null}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {busy ? "Sending…" : "Send reset link"}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
