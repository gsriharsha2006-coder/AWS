import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  AuthShell,
  Field,
  FormNotice,
  GoogleButton,
  PasswordField,
  inputClass,
  passwordIssues,
} from "@/components/auth-kit";
import { supabase } from "@/integrations/supabase/client";
import { friendlyAuthError, logAuthError } from "@/lib/auth-messages";
import { setPendingRole } from "@/lib/use-identity";

export const Route = createFileRoute("/auth/founder/signup")({
  head: () => ({
    meta: [
      { title: "Create a founder account — Venture Connect" },
      {
        name: "description",
        content:
          "Create a Venture Connect founder account to structure your idea, assess readiness and apply to real opportunities.",
      },
      { property: "og:title", content: "Create a founder account — Venture Connect" },
      { property: "og:description", content: "Founder sign-up for Venture Connect." },
    ],
  }),
  component: FounderSignup,
});

function FounderSignup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function validate(next = form) {
    const e: Record<string, string> = {};
    if (!next.name.trim()) e["name"] = "Enter your full name.";
    if (!/^\S+@\S+\.\S+$/.test(next.email)) e["email"] = "Enter a valid email address.";
    const issues = passwordIssues(next.password);
    if (issues.length) e["password"] = `Password needs ${issues.join(", ")}.`;
    if (next.confirm !== next.password) e["confirm"] = "Both passwords must match.";
    if (!terms) e["terms"] = "Please accept the Terms and Privacy Policy.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setNotice(null);
    if (!validate()) return;
    setBusy(true);
    try {
      setPendingRole("founder");
      const { error } = await supabase.auth.signUp({
        email: form.email.trim(),
        password: form.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: { role: "founder", full_name: form.name.trim(), phone: form.phone.trim() || null },
        },
      });
      if (error) throw error;
      void navigate({
        to: "/auth/verify",
        search: { email: form.email.trim(), role: "founder" as const },
      });
    } catch (error) {
      logAuthError("founder-signup", error);
      setNotice(friendlyAuthError(error, "We couldn't create the account. Please try again."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      title="Create your founder account"
      subtitle="For students and early founders building a venture."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/auth/founder/login" className="underline underline-offset-4">
            Founder sign in
          </Link>
          {" · "}
          <Link to="/auth" className="underline underline-offset-4">
            I'm an ecosystem partner
          </Link>
        </>
      }
    >
      <form className="mt-5 space-y-3" onSubmit={submit} noValidate>
        <Field id="name" label="Full name" error={errors["name"]}>
          <input
            id="name"
            className={inputClass}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            onBlur={() => validate()}
            autoComplete="name"
            aria-invalid={Boolean(errors["name"])}
          />
        </Field>

        <Field id="email" label="Email" error={errors["email"]}>
          <input
            id="email"
            type="email"
            className={inputClass}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            onBlur={() => validate()}
            autoComplete="email"
            aria-invalid={Boolean(errors["email"])}
          />
        </Field>

        <Field id="phone" label="Phone (optional)">
          <input
            id="phone"
            type="tel"
            className={inputClass}
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            autoComplete="tel"
          />
        </Field>

        <PasswordField
          id="password"
          label="Password"
          value={form.password}
          onChange={(v) => setForm({ ...form, password: v })}
          error={errors["password"]}
          showStrength
          autoComplete="new-password"
        />

        <PasswordField
          id="confirm"
          label="Confirm password"
          value={form.confirm}
          onChange={(v) => setForm({ ...form, confirm: v })}
          error={errors["confirm"]}
          autoComplete="new-password"
        />

        <div>
          <label className="flex items-start gap-2 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={terms}
              onChange={(e) => setTerms(e.target.checked)}
              className="mt-0.5"
            />
            <span>I accept the Terms of Use and the Privacy Policy.</span>
          </label>
          {errors["terms"] ? (
            <p role="alert" className="mt-1 text-xs text-destructive">
              {errors["terms"]}
            </p>
          ) : null}
        </div>

        {notice ? <FormNotice message={notice} /> : null}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {busy ? "Creating account…" : "Create founder account"}
        </button>
      </form>

      <GoogleButton role="founder" />
    </AuthShell>
  );
}
