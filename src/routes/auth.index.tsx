import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { BrandMark } from "@/components/brand";
import { Pill } from "@/components/ui-bits";
import { demoFounderState, demoPartnerState, useStore } from "@/lib/store";

export const Route = createFileRoute("/auth/")({
  head: () => ({
    meta: [
      { title: "Sign in or join — Venture Connect" },
      {
        name: "description",
        content:
          "Join Venture Connect as a student founder or as an ecosystem partner. Separate, role-based access for building ventures and reviewing applications.",
      },
      { property: "og:title", content: "Sign in or join — Venture Connect" },
      {
        property: "og:description",
        content: "Turn your idea into your next opportunity. Founder and ecosystem partner access.",
      },
    ],
  }),
  component: AuthLanding,
});

function AuthLanding() {
  const { update } = useStore();
  const navigate = useNavigate();

  function enterDemo(role: "founder" | "partner") {
    if (role === "founder") {
      update({ ...demoFounderState(), role: "founder" });
      void navigate({ to: "/founder" });
    } else {
      update({ ...demoPartnerState(), role: "partner" });
      void navigate({ to: "/partner" });
    }
  }

  return (
    <div className="aurora-bg min-h-screen bg-background px-5 py-10 sm:px-8">
      <div className="mx-auto w-full max-w-5xl">
        <Link to="/">
          <BrandMark />
        </Link>

        <div className="mt-12 max-w-2xl">
          <h1 className="font-display text-4xl font-semibold leading-tight sm:text-5xl">
            Turn your idea into your next opportunity.
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Choose how you're joining. Founder and ecosystem partner accounts have completely
            separate workspaces, and one account keeps one role.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <section className="surface-panel p-7">
            <Pill tone="muted">For students &amp; early founders</Pill>
            <h2 className="mt-4 font-display text-2xl font-semibold">I'm a founder</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Structure your idea, run an AI readiness assessment, discover real opportunities and
              apply.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/auth/founder/signup"
                className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
              >
                Create founder account
              </Link>
              <Link
                to="/auth/founder/login"
                className="rounded-lg border border-border px-5 py-2.5 text-sm hover:bg-surface-2"
              >
                Founder sign in
              </Link>
            </div>
          </section>

          <section className="surface-panel p-7">
            <Pill tone="muted">For incubators, investors &amp; programs</Pill>
            <h2 className="mt-4 font-display text-2xl font-semibold">I'm an ecosystem partner</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Post opportunities, review real applications, and open a conversation only when
              you're interested.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/auth/partner/signup"
                className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
              >
                Create partner account
              </Link>
              <Link
                to="/auth/partner/login"
                className="rounded-lg border border-border px-5 py-2.5 text-sm hover:bg-surface-2"
              >
                Partner sign in
              </Link>
            </div>
          </section>
        </div>

        <section className="surface-panel mt-6 p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Pill tone="warning">Demo mode</Pill>
            <span className="text-xs text-muted-foreground">
              Sample data for the walkthrough — kept separate from real accounts
            </span>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => enterDemo("founder")}
              className="rounded-lg border border-warning/40 bg-warning/10 px-5 py-2.5 text-sm font-medium hover:bg-warning/15"
            >
              Continue as demo founder
            </button>
            <button
              type="button"
              onClick={() => enterDemo("partner")}
              className="rounded-lg border border-warning/40 bg-warning/10 px-5 py-2.5 text-sm font-medium hover:bg-warning/15"
            >
              Continue as demo partner
            </button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Demo accounts are clearly labelled, stay on this device, and never mix with real
            accounts or real opportunities.
          </p>
        </section>
      </div>
    </div>
  );
}
