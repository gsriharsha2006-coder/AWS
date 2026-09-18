import type { FounderProfile, Idea, Opportunity } from "./types";

export type MatchResult = {
  score: number;
  reasons: string[];
  issues: string[];
};

export function daysUntil(deadline: string): number | null {
  if (!deadline || deadline === "Rolling") return null;
  const d = new Date(deadline).getTime();
  if (Number.isNaN(d)) return null;
  return Math.ceil((d - Date.now()) / 86_400_000);
}

export function formatDeadline(deadline: string): string {
  if (deadline === "Rolling") return "Rolling applications";
  const d = new Date(deadline);
  if (Number.isNaN(d.getTime())) return deadline;
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

export function matchOpportunity(
  opp: Opportunity,
  idea: Idea,
  profile: FounderProfile,
  completion: number,
  readinessScore: number | null,
): MatchResult {
  let score = 40;
  const reasons: string[] = [];
  const issues: string[] = [];

  if (opp.categories.includes(idea.category)) {
    score += 18;
    reasons.push(`${idea.category} focus matches this program`);
  } else {
    issues.push(`Program focus does not list ${idea.category} explicitly`);
  }

  if (opp.stages.includes(idea.stage)) {
    score += 16;
    reasons.push(`${idea.stage} stage is accepted`);
  } else {
    issues.push(`${idea.stage} stage may fall outside the accepted range`);
  }

  const audience = `${opp.audience} ${opp.eligibility.join(" ")}`.toLowerCase();
  if (audience.includes("student")) {
    score += 8;
    reasons.push("Student founders are eligible");
  }

  const loc = `${opp.location}`.toLowerCase();
  const home = (profile.location || "").toLowerCase();
  if (loc.includes("global") || opp.mode === "Online") {
    score += 6;
    reasons.push(opp.mode === "Online" ? "Runs online, no relocation needed" : "Open globally");
  } else if (home && loc.includes(home.split(",")[0]!.trim())) {
    score += 8;
    reasons.push(`Located near you (${opp.location})`);
  }

  const skillText = profile.skills.join(" ").toLowerCase();
  if (skillText && opp.categories.some((c) => skillText.includes(c.toLowerCase()))) {
    score += 5;
    reasons.push("Your skills line up with the program focus");
  }

  if (completion >= 70) {
    score += 6;
    reasons.push("Idea workspace is substantially complete");
  } else if (opp.requiresWorkspace) {
    issues.push("Idea workspace needs more detail before applying");
  }

  if (readinessScore !== null && readinessScore >= 65) {
    score += 6;
    reasons.push("Venture readiness is in a competitive range");
  } else if (opp.requiresWorkspace && readinessScore === null) {
    issues.push("No VC readiness report generated yet");
  }

  const days = daysUntil(opp.deadline);
  if (days !== null && days < 0) {
    score -= 25;
    issues.push("Listed deadline has passed — confirm the next cycle at the source");
  }

  return { score: Math.max(5, Math.min(97, Math.round(score))), reasons, issues };
}
