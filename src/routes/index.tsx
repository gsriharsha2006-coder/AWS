import { createFileRoute, Link } from "@tanstack/react-router";
import { BrandMark } from "@/components/brand";
import { Pill } from "@/components/ui-bits";
import { REAL_OPPORTUNITIES } from "@/data/opportunities";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Venture Connect — Connecting student ideas to real startup opportunities" },
      {
        name: "description",
        content:
          "Structure your idea, test its venture readiness with AI, discover real incubators, accelerators, grants and hackathons, and connect with ecosystem partners.",
      },
      {
        property: "og:title",
        content: "Venture Connect — Connecting student ideas to real startup opportunities",
      },
      {
        property: "og:description",
        content:
          "Turn an idea into a structured venture, validate it, become opportunity-ready, and connect with the right startup ecosystem.",
      },
    ],
  }),
  component: Landing,
});

const LOOP = ["Idea", "Structure", "Validate", "Venture Ready", "Opportunities", "Connection"];

function Landing() {
  return (
    <div className="aurora-bg min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <BrandMark />
        <nav className="flex items-center gap-2" aria-label="Main">
          <Link
            to="/auth"
            className="rounded-lg border border-border px-3.5 py-2 text-sm transition-colors hover:bg-surface-2"
          >
            Sign in
          </Link>
        </nav>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-5 pb-16 pt-10 sm:pt-16">
          <Pill tone="primary">Two-sided startup ecosystem platform</Pill>
          <h1 className="mt-5 font-display text-4xl font-bold leading-[1.05] sm:text-6xl">
            <span className="text-gradient">Connecting student ideas</span>
            <br />
            to real startup opportunities
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Turn an idea into a structured venture, validate it with evidence, understand where you
            actually stand, and reach the incubators, investors and programs that fit your stage.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/auth"
              className="rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Build your idea
            </Link>
            <Link
              to="/auth"
              className="rounded-lg border border-border px-5 py-3 text-sm font-semibold transition-colors hover:bg-surface-2"
            >
              Explore opportunities
            </Link>
          </div>

          <ol className="mt-12 flex flex-wrap items-center gap-2" aria-label="The Venture Connect loop">
            {LOOP.map((step, i) => (
              <li key={step} className="flex items-center gap-2">
                <span className="glass-panel px-3.5 py-2 text-xs font-medium sm:text-sm">{step}</span>
                {i < LOOP.length - 1 ? (
                  <span aria-hidden className="text-muted-foreground">
                    →
                  </span>
                ) : null}
              </li>
            ))}
          </ol>
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-16">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                title: "Idea Workspace",
                body: "Twelve structured sections take an unstructured idea to a concept a partner can actually review. Incomplete areas stay visible — nothing is assumed investor-ready.",
              },
              {
                title: "VC Readiness Report",
                body: "An AI assessment across investor readiness, moat, execution, market, defensibility and scalability, with a SWOT and three prioritised next actions.",
              },
              {
                title: "Real opportunities",
                body: `${REAL_OPPORTUNITIES.length} curated programs from official sources — incubators, accelerators, grants, fellowships and hackathons — matched to your stage and category.`,
              },
            ].map((c) => (
              <div key={c.title} className="surface-panel p-6">
                <h2 className="font-display text-lg font-semibold">{c.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-20">
          <div className="surface-panel grid gap-6 p-7 md:grid-cols-2">
            <div>
              <p className="label-caps">For founders</p>
              <h2 className="mt-2 font-display text-2xl font-semibold">
                Structure, evidence, then exposure
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Most student founders don't lack resources — they lack structure, validation and
                access. Venture Connect fixes that order: build the case first, then apply.
              </p>
              <Link
                to="/auth"
                className="mt-5 inline-block rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
              >
                Start as a founder
              </Link>
            </div>
            <div>
              <p className="label-caps">For ecosystem partners</p>
              <h2 className="mt-2 font-display text-2xl font-semibold">
                Better applications, less noise
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Post an opportunity through a guided flow with a quality gate, then review
                applicants with workspace completeness and readiness in one queue. Messaging only
                opens when you mark a founder as interested.
              </p>
              <Link
                to="/auth"
                className="mt-5 inline-block rounded-lg border border-border px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-surface-2"
              >
                Start as a partner
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/70">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-8 text-xs text-muted-foreground">
          <BrandMark size="sm" />
          <p>
            Opportunity details come from official program pages. Always confirm at the source
            before applying.
          </p>
        </div>
      </footer>
    </div>
  );
}
