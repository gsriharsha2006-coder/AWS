import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getIdentity, type Identity } from "@/lib/auth.functions";

export const PENDING_ROLE_KEY = "vc-pending-role";

export function setPendingRole(role: "founder" | "partner") {
  try {
    window.localStorage.setItem(PENDING_ROLE_KEY, role);
  } catch {
    /* storage unavailable — the callback falls back to asking for the role */
  }
}

export function readPendingRole(): "founder" | "partner" | null {
  try {
    const v = window.localStorage.getItem(PENDING_ROLE_KEY);
    return v === "founder" || v === "partner" ? v : null;
  } catch {
    return null;
  }
}

/** True once the browser has restored (or failed to restore) a stored session. */
export function useSessionReady() {
  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    let active = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSignedIn(Boolean(data.session));
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setSignedIn(Boolean(session));
      setReady(true);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { ready, signedIn };
}

/** Server-verified identity; null while signed out. */
export function useIdentity() {
  const { ready, signedIn } = useSessionReady();
  const query = useQuery<Identity | null>({
    queryKey: ["identity"],
    enabled: ready && signedIn,
    retry: false,
    staleTime: 30_000,
    queryFn: async () => (await getIdentity()) ?? null,
  });

  return {
    identity: signedIn ? (query.data ?? null) : null,
    loading: !ready || (signedIn && query.isPending),
    signedIn,
  };
}
