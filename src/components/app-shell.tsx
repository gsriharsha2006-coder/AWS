import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { BrandLink } from "@/components/brand";
import { supabase } from "@/integrations/supabase/client";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const FOUNDER_NAV = [
  { to: "/founder", label: "Dashboard" },
  { to: "/founder/workspace", label: "Idea Workspace" },
  { to: "/founder/readiness", label: "VC Readiness" },
  { to: "/founder/opportunities", label: "Opportunities" },
  { to: "/founder/applications", label: "Applications" },
  { to: "/founder/messages", label: "Messages" },
  { to: "/founder/profile", label: "Profile" },
  { to: "/founder/membership", label: "Membership" },
] as const;

export const PARTNER_NAV = [
  { to: "/partner", label: "Dashboard" },
  { to: "/partner/post", label: "Post Opportunity" },
  { to: "/partner/opportunities", label: "My Opportunities" },
  { to: "/partner/applications", label: "Applications" },
  { to: "/partner/messages", label: "Messages" },
  { to: "/partner/analytics", label: "Analytics" },
  { to: "/partner/profile", label: "Organization" },
  { to: "/partner/membership", label: "Plan" },
] as const;

export function AppShell({
  role,
  children,
}: {
  role: "founder" | "partner";
  children: ReactNode;
}) {
  const nav = role === "founder" ? FOUNDER_NAV : PARTNER_NAV;
  const { state, setRole, update } = useStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  const who =
    role === "founder"
      ? state.founder.name || "Founder"
      : state.partner.organization || "Ecosystem partner";

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    setRole(null);
    update({ demoMode: false });
    void navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="aurora-bg min-h-screen bg-background">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-[92rem] items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-label="Toggle navigation"
              className="rounded-md border border-border px-2 py-1.5 text-xs lg:hidden"
            >
              Menu
            </button>
            <BrandLink to={role === "founder" ? "/founder" : "/partner"} size="sm" />
            <span className="hidden rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground sm:inline">
              {role === "founder" ? "Founder workspace" : "Partner console"}
            </span>
            {state.demoMode ? (
              <span className="rounded-full border border-warning/40 bg-warning/12 px-2 py-0.5 text-[11px] text-warning">
                Demo data
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden max-w-[16rem] truncate text-xs text-muted-foreground sm:inline">{who}</span>
            <button
              type="button"
              onClick={() => void signOut()}
              className="rounded-md border border-border px-3 py-1.5 text-xs transition-colors hover:bg-surface-2"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[92rem] gap-6 px-4 py-6">
        <nav
          aria-label="Primary"
          className={cn(
            "w-56 shrink-0 lg:block",
            open ? "fixed inset-x-4 top-16 z-20 block rounded-xl border border-border bg-popover p-3 shadow-xl lg:static lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none" : "hidden",
          )}
        >
          <ul className="space-y-1">
            {nav.map((item) => {
              const active = pathname === item.to || (item.to !== "/founder" && item.to !== "/partner" && pathname.startsWith(item.to));
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "block rounded-lg px-3 py-2 text-sm transition-colors",
                      active
                        ? "bg-primary/15 font-medium text-primary"
                        : "text-muted-foreground hover:bg-surface-2 hover:text-foreground",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <main id="main" className="min-w-0 flex-1 pb-16">
          {children}
        </main>
      </div>
    </div>
  );
}
