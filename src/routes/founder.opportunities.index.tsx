import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { RequireRole } from "@/components/require-role";
import { OpportunityCard } from "@/components/opportunity-card";
import { Panel, Pill, SectionHeading } from "@/components/ui-bits";
import { matchOpportunity } from "@/lib/matching";
import { useStore } from "@/lib/store";
import type { OpportunityType } from "@/lib/types";

export const Route = createFileRoute("/founder/opportunities/")({
  head: () => ({
    meta: [
      { title: "Opportunities — Venture Connect" },
      { name: "description", content: "Curated real incubators, accelerators, grants, fellowships and hackathons matched to your venture." },
      { property: "og:title", content: "Opportunities — Venture Connect" },
      { property: "og:description", content: "Matched to your category, stage, eligibility and readiness." },
    ],
  }),
  component: () => (
    <RequireRole role="founder">
      <Opportunities />
    </RequireRole>
  ),
});

const TYPES: (OpportunityType | "All")[] = [
  "All",
  "Incubator",
  "Accelerator",
  "Investor",
  "Hackathon",
  "Startup Program",
  "Innovation Challenge",
  "Government Program",
  "Fellowship",
  "Competition",
  "Grant",
  "College Innovation Program",
];

function Opportunities() {
  const { state, completion, allOpportunities } = useStore();
  const readiness = state.readiness?.scores.find((s) => s.key === "investor")?.score ?? null;
  const [type, setType] = useState<(typeof TYPES)[number]>("All");
  const [origin, setOrigin] = useState<"all" | "real" | "demo">("all");
  const [query, setQuery] = useState("");

  const list = useMemo(() => {
    return allOpportunities
      .filter((o) => (type === "All" ? true : o.type === type))
      .filter((o) => (origin === "all" ? true : o.origin === origin))
      .filter((o) =>
        query.trim()
          ? `${o.title} ${o.organization} ${o.description}`.toLowerCase().includes(query.toLowerCase())
          : true,
      )
      .map((opp) => ({ opp, match: matchOpportunity(opp, state.idea, state.founder, completion, readiness) }))
      .sort((a, b) => b.match.score - a.match.score);
  }, [allOpportunities, type, origin, query, state.idea, state.founder, completion, readiness]);

  const input = "rounded-lg border border-input bg-surface px-3 py-2 text-sm";

  return (
    <div className="space-y-6">
      <Panel>
        <SectionHeading
          eyebrow="Opportunity discovery"
          title="Opportunities matched to your venture"
          description="Real programs are listed from their official pages and link straight to the source. Demo listings are created inside Venture Connect to demonstrate the partner workflow and are labelled as such."
        />
        <div className="flex flex-wrap gap-3">
          <div>
            <label htmlFor="q" className="sr-only">Search opportunities</label>
            <input id="q" className={input} placeholder="Search programs" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <div>
            <label htmlFor="type" className="sr-only">Filter by type</label>
            <select id="type" className={input} value={type} onChange={(e) => setType(e.target.value as (typeof TYPES)[number])}>
              {TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="origin" className="sr-only">Filter by data source</label>
            <select id="origin" className={input} value={origin} onChange={(e) => setOrigin(e.target.value as "all" | "real" | "demo")}>
              <option value="all">All listings</option>
              <option value="real">Real programs only</option>
              <option value="demo">Demo listings only</option>
            </select>
          </div>
          <Pill tone="muted">{list.length} shown</Pill>
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
        {list.map(({ opp, match }) => (
          <OpportunityCard key={opp.id} opp={opp} match={match} />
        ))}
      </div>

      {list.length === 0 ? (
        <Panel>
          <p className="text-sm text-muted-foreground">
            No opportunities match these filters. Try widening the type or clearing your search.
          </p>
        </Panel>
      ) : null}
    </div>
  );
}
