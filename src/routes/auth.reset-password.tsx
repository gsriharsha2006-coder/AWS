import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AuthShell, FormNotice, PasswordField, passwordIssues } from "@/components/auth-kit";
import { supabase } from "@/integrations/supabase/client";
import { friendlyAuthError } from "@/lib/auth-messages";

export const Route = createFileRoute("/auth/reset-password")({
  head: () => ({
    meta: [
      { title: "Set a new password — Venture Connect" },
      {
        name: "description",
        content: "Choose a new password for your Venture Connect account after requesting a reset.",
      },
      { property: "og:title", content: "Set a new password — Venture Connect" },
      { property: "og:description", content: "Complete your Venture Connect password reset." },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [recovery, setRecovery] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) setRecovery(true);
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) setRecovery(true);
      setReady(true);
    });
  }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const e: Record<string, string> = {};
    const issues = passwordIssues(password);
    if (issues.length) e["password"] = `Password needs ${issues.join(", ")}.`;
    if (confirm !== password) e["confirm"] = "Both passwords must match.";
    setErrors(e);
    if (Object.keys(e).length) return;

    setBusy(true);
    setNotice(null);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setDone(true);
      await supabase.auth.signOut();
      window.setTimeout(() => void navigate({ to: "/auth" }), 2500);
    } catch (error) {
      setNotice(friendlyAuthError(error, "The password could not be updated. Request a new link."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      title="Set a new password"
      subtitle="Choose a password with at least 8 characters, an uppercase letter, a lowercase letter and a number."
      footer={
        <Link to="/auth" className="underline underline-offset-4">
          Back to sign in
        </Link>
      }
    >
      {done ? (
        <p role="status" className="mt-5 rounded-lg border border-border bg-surface-2 px-3 py-3 text-sm">
          Your password is updated. Taking you back to sign in…
        </p>
      ) : ready && !recovery ? (
        <p className="mt-5 rounded-lg border border-border bg-surface-2 px-3 py-3 text-sm">
          This reset link is missing or has expired. Request a new one from the{" "}
          <Link to="/auth/forgot-password" className="underline underline-offset-4">
            forgot password
          </Link>{" "}
          page.
        </p>
      ) : (
        <form className="mt-5 space-y-3" onSubmit={submit} noValidate>
          <PasswordField
            id="password"
            label="New password"
            value={password}
            onChange={setPassword}
            error={errors["password"]}
            showStrength
            autoComplete="new-password"
          />
          <PasswordField
            id="confirm"
            label="Confirm new password"
            value={confirm}
            onChange={setConfirm}
            error={errors["confirm"]}
            autoComplete="new-password"
          />
          {notice ? <FormNotice message={notice} /> : null}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {busy ? "Updating…" : "Update password"}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
