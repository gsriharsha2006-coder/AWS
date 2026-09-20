import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Field, FormNotice, PasswordField, inputClass, useAfterAuthRedirect } from "@/components/auth-kit";
import { supabase } from "@/integrations/supabase/client";
import { getIdentity } from "@/lib/auth.functions";
import { friendlyAuthError, logAuthError } from "@/lib/auth-messages";

export function LoginForm({ role }: { role: "founder" | "partner" }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const redirectAfterAuth = useAfterAuthRedirect();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setNotice(null);
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) throw error;

      const identity = await getIdentity();
      if (identity.role && identity.role !== role) {
        await supabase.auth.signOut();
        setNotice(
          role === "founder"
            ? "This email belongs to an ecosystem partner account. Use the partner sign-in page."
            : "This email belongs to a founder account. Use the founder sign-in page.",
        );
        return;
      }
      await queryClient.invalidateQueries({ queryKey: ["identity"] });
      if (!identity.role) {
        void navigate({ to: "/auth/callback" });
        return;
      }
      redirectAfterAuth(identity.role, identity.onboarded);
    } catch (error) {
      logAuthError("sign-in", error);
      setNotice(friendlyAuthError(error, "We couldn't sign you in. Please try again."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="mt-5 space-y-3" onSubmit={submit} noValidate>
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

      <PasswordField
        id="password"
        label="Password"
        value={password}
        onChange={setPassword}
        autoComplete="current-password"
      />

      {notice ? <FormNotice message={notice} /> : null}

      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
      >
        {busy ? "Signing in…" : role === "founder" ? "Sign in as founder" : "Sign in as partner"}
      </button>
    </form>
  );
}
