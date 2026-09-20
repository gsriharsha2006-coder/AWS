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

export const ORG_TYPES = [
  "Incubator",
  "Investor",
  "Accelerator",
  "Startup Program",
  "College / University",
  "Innovation Cell",
  "Government Organization",
  "Corporate",
  "NGO",
  "Competition Organizer",
  "Other",
];

export const Route = createFileRoute("/auth/partner/signup")({
  head: () => ({
    meta: [
      { title: "Create a partner account — Venture Connect" },
      {
        name: "description",
        content:
          "Register your incubator, investor fund, accelerator or innovation cell on Venture Connect to post opportunities and review founder applications.",
      },
      { property: "og:title", content: "Create a partner account — Venture Connect" },
      { property: "og:description", content: "Ecosystem partner sign-up for Venture Connect." },
    ],
  }),
  component: PartnerSignup,
});

function PartnerSignup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    organization: "",
    contact: "",
    email: "",
    phone: "",
    website: "",
    orgType: ORG_TYPES[0] as string,
    password: "",
    confirm: "",
  });
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function validate() {
    const e: Record<string, string> = {};
    if (!form.organization.trim()) e["organization"] = "Enter your organization name.";
    if (!form.contact.trim()) e["contact"] = "Enter the contact person's name.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e["email"] = "Enter a valid work email address.";
    const issues = passwordIssues(form.password);
    if (issues.length) e["password"] = `Password needs ${issues.join(", ")}.`;
    if (form.confirm !== form.password) e["confirm"] = "Both passwords must match.";
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
      setPendingRole("partner");
      const { error } = await supabase.auth.signUp({
        email: form.email.trim(),
        password: form.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            role: "partner",
            full_name: form.contact.trim(),
            organization: form.organization.trim(),
            org_type: form.orgType,
            website: form.website.trim() || null,
            phone: form.phone.trim() || null,
          },
        },
      });
      if (error) throw error;
      void navigate({
        to: "/auth/verify",
        search: { email: form.email.trim(), role: "partner" as const },
      });
    } catch (error) {
      logAuthError("partner-signup", error);
      setNotice(friendlyAuthError(error, "We couldn't create the account. Please try again."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      title="Register your organization"
      subtitle="For incubators, investors, accelerators, programs and innovation cells."
      footer={
        <>
          Already registered?{" "}
          <Link to="/auth/partner/login" className="underline underline-offset-4">
            Partner sign in
          </Link>
          {" · "}
          <Link to="/auth" className="underline underline-offset-4">
            I'm a founder
          </Link>
        </>
      }
    >
      <form className="mt-5 space-y-3" onSubmit={submit} noValidate>
        <Field id="organization" label="Organization name" error={errors["organization"]}>
          <input
            id="organization"
            className={inputClass}
            value={form.organization}
            onChange={(e) => setForm({ ...form, organization: e.target.value })}
            onBlur={() => validate()}
            autoComplete="organization"
          />
        </Field>

        <Field id="orgType" label="Organization type">
          <select
            id="orgType"
            className={inputClass}
            value={form.orgType}
            onChange={(e) => setForm({ ...form, orgType: e.target.value })}
          >
            {ORG_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </Field>

        <Field id="contact" label="Contact person" error={errors["contact"]}>
          <input
            id="contact"
            className={inputClass}
            value={form.contact}
            onChange={(e) => setForm({ ...form, contact: e.target.value })}
            onBlur={() => validate()}
            autoComplete="name"
          />
        </Field>

        <Field id="email" label="Work email" error={errors["email"]}>
          <input
            id="email"
            type="email"
            className={inputClass}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            onBlur={() => validate()}
            autoComplete="email"
          />
        </Field>

        <div className="grid gap-3 sm:grid-cols-2">
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
          <Field id="website" label="Website (optional)">
            <input
              id="website"
              type="url"
              className={inputClass}
              value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
              autoComplete="url"
            />
          </Field>
        </div>

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
          {busy ? "Creating account…" : "Create partner account"}
        </button>
      </form>

      <GoogleButton role="partner" />
    </AuthShell>
  );
}
