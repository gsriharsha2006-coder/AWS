import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AuthShell, FormNotice } from "@/components/auth-kit";
import { supabase } from "@/integrations/supabase/client";
import { friendlyAuthError } from "@/lib/auth-messages";

export const Route = createFileRoute("/auth/verify")({
  validateSearch: (search: Record<string, unknown>) => ({
    email: typeof search["email"] === "string" ? search["email"] : "",
    role: search["role"] === "partner" ? ("partner" as const) : ("founder" as const),
  }),
  head: () => ({
    meta: [
      { title: "Verify your email — Venture Connect" },
      {
        name: "description",
        content: "Enter the six-digit code we emailed you to finish setting up your Venture Connect account.",
      },
      { property: "og:title", content: "Verify your email — Venture Connect" },
      { property: "og:description", content: "Email verification for Venture Connect accounts." },
    ],
  }),
  component: VerifyPage,
});

function VerifyPage() {
  const { email, role } = Route.useSearch();
  const navigate = useNavigate();
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [notice, setNotice] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(45);
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = window.setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => window.clearTimeout(t);
  }, [cooldown]);

  function setDigit(index: number, value: string) {
    const clean = value.replace(/\D/g, "");
    if (clean.length > 1) {
      const next = clean.slice(0, 6).split("");
      setDigits(Array.from({ length: 6 }, (_, i) => next[i] ?? ""));
      refs.current[Math.min(next.length, 5)]?.focus();
      return;
    }
    setDigits((d) => d.map((v, i) => (i === index ? clean : v)));
    if (clean && index < 5) refs.current[index + 1]?.focus();
  }

  function onKeyDown(index: number, event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !digits[index] && index > 0) refs.current[index - 1]?.focus();
  }

  async function verify(event: React.FormEvent) {
    event.preventDefault();
    setNotice(null);
    const token = digits.join("");
    if (token.length !== 6) {
      setNotice("Enter all six digits from the email.");
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.verifyOtp({ email, token, type: "email" });
      if (error) throw error;
      void navigate({ to: "/auth/callback" });
    } catch (error) {
      setNotice(friendlyAuthError(error, "That code could not be verified. Request a new one."));
    } finally {
      setBusy(false);
    }
  }

  async function resend() {
    setNotice(null);
    setInfo(null);
    try {
      const { error } = await supabase.auth.resend({ type: "signup", email });
      if (error) throw error;
      setInfo("A new code is on its way. It can take a minute to arrive.");
      setCooldown(45);
    } catch (error) {
      setNotice(friendlyAuthError(error, "We couldn't send another code right now."));
    }
  }

  return (
    <AuthShell
      title="Check your email"
      subtitle={
        email
          ? `We sent a six-digit code to ${email}. Enter it below to verify your Venture Connect account.`
          : "Enter the six-digit code we emailed you to verify your Venture Connect account."
      }
      footer={
        <>
          Wrong address?{" "}
          <Link
            to={role === "partner" ? "/auth/partner/signup" : "/auth/founder/signup"}
            className="underline underline-offset-4"
          >
            Change email
          </Link>
          {" · "}
          <Link
            to={role === "partner" ? "/auth/partner/login" : "/auth/founder/login"}
            className="underline underline-offset-4"
          >
            Back to sign in
          </Link>
        </>
      }
    >
      <form className="mt-5 space-y-4" onSubmit={verify}>
        <fieldset>
          <legend className="label-caps mb-2">Verification code</legend>
          <div className="flex gap-2">
            {digits.map((digit, i) => (
              <input
                key={i}
                ref={(el) => {
                  refs.current[i] = el;
                }}
                value={digit}
                onChange={(e) => setDigit(i, e.target.value)}
                onKeyDown={(e) => onKeyDown(i, e)}
                inputMode="numeric"
                autoComplete="one-time-code"
                aria-label={`Digit ${i + 1}`}
                autoFocus={i === 0}
                className="h-12 w-full rounded-lg border border-input bg-surface text-center text-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            ))}
          </div>
        </fieldset>

        {notice ? <FormNotice message={notice} /> : null}
        {info ? (
          <p role="status" className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-xs">
            {info}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {busy ? "Verifying…" : "Verify and continue"}
        </button>
      </form>

      <button
        type="button"
        onClick={() => void resend()}
        disabled={cooldown > 0}
        className="mt-3 w-full rounded-lg border border-border px-4 py-2.5 text-sm hover:bg-surface-2 disabled:opacity-60"
      >
        {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
      </button>
    </AuthShell>
  );
}
