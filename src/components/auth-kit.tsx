import { Link, useNavigate } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { BrandMark } from "@/components/brand";
import { lovable } from "@/integrations/lovable/index";
import { setPendingRole } from "@/lib/use-identity";

export const inputClass =
  "mt-1 w-full rounded-lg border border-input bg-surface px-3 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="aurora-bg grid min-h-screen bg-background lg:grid-cols-2">
      <div className="hidden flex-col justify-between p-10 lg:flex">
        <Link to="/">
          <BrandMark />
        </Link>
        <div>
          <h1 className="font-display text-3xl font-semibold leading-tight">
            Turn your idea into your next opportunity.
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
            Structure the idea, test its readiness, discover real opportunities, and connect with
            the ecosystem when a partner marks interest.
          </p>
          <ul className="mt-6 grid max-w-md gap-2 text-xs text-muted-foreground">
            {["AI Startup", "Incubator Program", "Hackathon", "Funding", "Innovation Challenge"].map(
              (tag) => (
                <li key={tag} className="glass-panel rounded-lg px-3 py-2">
                  {tag}
                </li>
              ),
            )}
          </ul>
        </div>
        <Link to="/" className="text-xs text-muted-foreground underline-offset-4 hover:underline">
          Back to home
        </Link>
      </div>

      <div className="flex items-center justify-center p-5 sm:p-10">
        <div className="surface-panel w-full max-w-md p-7">
          <div className="lg:hidden">
            <BrandMark size="sm" />
          </div>
          <h2 className="mt-5 font-display text-2xl font-semibold lg:mt-0">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          {children}
          {footer ? <div className="mt-5 text-xs text-muted-foreground">{footer}</div> : null}
        </div>
      </div>
    </div>
  );
}

export function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string | undefined;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="label-caps">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1 text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function passwordIssues(password: string): string[] {
  const issues: string[] = [];
  if (password.length < 8) issues.push("at least 8 characters");
  if (!/[A-Z]/.test(password)) issues.push("one uppercase letter");
  if (!/[a-z]/.test(password)) issues.push("one lowercase letter");
  if (!/[0-9]/.test(password)) issues.push("one number");
  return issues;
}

export function passwordStrength(password: string): "Weak" | "Fair" | "Strong" {
  const remaining = passwordIssues(password).length;
  if (remaining >= 2) return "Weak";
  if (remaining === 1) return "Fair";
  return password.length >= 12 ? "Strong" : "Fair";
}

export function PasswordField({
  id,
  label,
  value,
  onChange,
  error,
  showStrength = false,
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string | undefined;
  showStrength?: boolean;
  autoComplete: string;
}) {
  const [visible, setVisible] = useState(false);
  const strength = passwordStrength(value);
  const width = strength === "Weak" ? "33%" : strength === "Fair" ? "66%" : "100%";

  return (
    <Field id={id} label={label} error={error}>
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputClass} pr-20`}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          required
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>
      {showStrength && value ? (
        <div className="mt-2">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
            <div
              className={
                strength === "Weak"
                  ? "h-full bg-destructive"
                  : strength === "Fair"
                    ? "h-full bg-warning"
                    : "h-full bg-primary"
              }
              style={{ width }}
            />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Password strength: {strength}
            {passwordIssues(value).length
              ? ` — still needs ${passwordIssues(value).join(", ")}.`
              : ""}
          </p>
        </div>
      ) : null}
    </Field>
  );
}

export function FormNotice({ message }: { message: string }) {
  return (
    <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs">
      {message}
    </p>
  );
}

export function GoogleButton({
  role,
  label = "Continue with Google",
}: {
  role: "founder" | "partner";
  label?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signIn() {
    setBusy(true);
    setError(null);
    setPendingRole(role);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}/auth/callback`,
    });
    if (result.error) {
      setError("Google sign-in didn't complete. Please try again or use your email and password.");
      setBusy(false);
      return;
    }
    if (result.redirected) return;
    window.location.href = "/auth/callback";
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => void signIn()}
        disabled={busy}
        className="w-full rounded-lg border border-border px-4 py-2.5 text-sm transition-colors hover:bg-surface-2 disabled:opacity-60"
      >
        {busy ? "Opening Google…" : label}
      </button>
      {error ? <p className="mt-2 text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

/** Sends the user to the right place once their account type is known. */
export function useAfterAuthRedirect() {
  const navigate = useNavigate();
  return (role: "founder" | "partner", onboarded: boolean) => {
    if (role === "founder") void navigate({ to: onboarded ? "/founder" : "/onboarding/founder" });
    else void navigate({ to: onboarded ? "/partner" : "/onboarding/partner" });
  };
}
