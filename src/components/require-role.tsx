import { useNavigate } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { useStore } from "@/lib/store";
import { useIdentity } from "@/lib/use-identity";

/**
 * Gate for role-specific areas. Real accounts are verified against the backend
 * (the server function behind every protected read re-checks the session and
 * role, so this is UX on top of a real boundary). Demo mode stays on-device and
 * is clearly labelled.
 */
export function RequireRole({ role, children }: { role: "founder" | "partner"; children: ReactNode }) {
  const { state, ready, update } = useStore();
  const { identity, loading, signedIn } = useIdentity();
  const navigate = useNavigate();

  const demoAllowed = state.demoMode && state.role === role;
  const realAllowed = Boolean(identity && identity.role === role);

  useEffect(() => {
    if (!ready || loading || demoAllowed) return;
    if (!signedIn) {
      void navigate({
        to: role === "founder" ? "/auth/founder/login" : "/auth/partner/login",
        replace: true,
      });
      return;
    }
    if (identity && identity.role && identity.role !== role) {
      void navigate({ to: identity.role === "founder" ? "/founder" : "/partner", replace: true });
    }
  }, [ready, loading, demoAllowed, signedIn, identity, role, navigate]);

  // Keep the local workspace in step with the signed-in account.
  useEffect(() => {
    if (!realAllowed || !identity) return;
    if (state.role !== role) update({ role, demoMode: false });
    if (role === "founder" && identity.fullName && state.founder.name !== identity.fullName) {
      update({ founder: { ...state.founder, name: identity.fullName, email: identity.email } });
    }
  }, [realAllowed, identity, role, state, update]);

  if (demoAllowed || realAllowed) {
    return <AppShell role={role}>{children}</AppShell>;
  }

  return (
    <div className="grid min-h-screen place-items-center bg-background px-6 text-center">
      <p className="text-sm text-muted-foreground">
        {!ready || loading
          ? "Loading your workspace…"
          : !signedIn
            ? `This area is for signed-in ${role}s. Taking you to sign in…`
            : "That area belongs to a different account type. Taking you to your own workspace…"}
      </p>
    </div>
  );
}
