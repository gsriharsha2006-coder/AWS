import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AuthShell } from "@/components/auth-kit";
import { supabase } from "@/integrations/supabase/client";
import { claimRole, getIdentity } from "@/lib/auth.functions";
import { readPendingRole } from "@/lib/use-identity";

export const Route = createFileRoute("/auth/callback")({
  head: () => ({
    meta: [
      { title: "Signing you in — Venture Connect" },
      { name: "description", content: "Completing sign-in to your Venture Connect workspace." },
      { property: "og:title", content: "Signing you in — Venture Connect" },
      { property: "og:description", content: "Completing sign-in to Venture Connect." },
    ],
  }),
  ssr: false,
  component: AuthCallback,
});

function AuthCallback() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("Finishing sign-in…");

  useEffect(() => {
    let cancelled = false;

    async function finish() {
      // Wait for the session to be restored after the provider round-trip.
      let session = (await supabase.auth.getSession()).data.session;
      for (let i = 0; i < 20 && !session; i += 1) {
        await new Promise((r) => setTimeout(r, 250));
        session = (await supabase.auth.getSession()).data.session;
      }
      if (cancelled) return;
      if (!session) {
        setMessage("We couldn't complete sign-in. Please try again from the sign-in page.");
        return;
      }

      let identity = await getIdentity();
      if (!identity.role) {
        const pending = readPendingRole();
        if (!pending) {
          setMessage(
            "Your account is signed in but has no account type yet. Choose founder or partner on the previous screen to finish.",
          );
          return;
        }
        await claimRole({ data: { role: pending } });
        identity = await getIdentity();
      }
      if (cancelled) return;

      if (identity.role === "partner") {
        void navigate({ to: identity.onboarded ? "/partner" : "/onboarding/partner" });
      } else {
        void navigate({ to: identity.onboarded ? "/founder" : "/onboarding/founder" });
      }
    }

    void finish().catch(() => {
      setMessage("Something went wrong finishing sign-in. Please try signing in again.");
    });

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <AuthShell
      title="One moment"
      subtitle={message}
      footer={
        <Link to="/auth" className="underline underline-offset-4">
          Back to sign in
        </Link>
      }
    >
      <div className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
        <div className="h-full w-1/3 animate-pulse bg-primary" />
      </div>
    </AuthShell>
  );
}
