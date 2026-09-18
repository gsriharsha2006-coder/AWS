export type Role = "founder" | "partner";

export type Stage = "Idea" | "Prototype" | "MVP" | "Early Revenue";

export type Category =
  | "AI"
  | "SaaS"
  | "FinTech"
  | "HealthTech"
  | "EdTech"
  | "Marketplace"
  | "Consumer"
  | "DeepTech"
  | "Other";

export type OpportunityType =
  | "Incubator"
  | "Accelerator"
  | "Investor"
  | "Hackathon"
  | "Startup Program"
  | "Innovation Challenge"
  | "Government Program"
  | "Fellowship"
  | "Competition"
  | "Grant"
  | "Pitch Competition"
  | "College Innovation Program"
  | "Research / Entrepreneurship Program";

export type Opportunity = {
  id: string;
  origin: "real" | "demo";
  title: string;
  organization: string;
  type: OpportunityType;
  description: string;
  eligibility: string[];
  audience: string;
  stages: Stage[];
  categories: Category[];
  location: string;
  mode: "Online" | "In-person" | "Hybrid";
  opensOn?: string;
  deadline: string; // ISO date or "Rolling"
  benefits: string[];
  applicationUrl: string;
  sourceUrl: string;
  lastChecked?: string;
  verification: "verified" | "source-linked" | "unavailable";
  equityNote?: string;
  requiresWorkspace: boolean;
  requiredDocuments?: string[];
  status?: "published" | "draft";
};

export type WorkspaceField =
  | "problem"
  | "targetUsers"
  | "solution"
  | "market"
  | "competition"
  | "businessModel"
  | "validation"
  | "traction"
  | "roadmap"
  | "team"
  | "funds"
  | "growth";

export const WORKSPACE_FIELDS: { key: WorkspaceField; label: string; hint: string }[] = [
  { key: "problem", label: "Problem", hint: "What specific pain exists, and for whom?" },
  { key: "targetUsers", label: "Target Users", hint: "Describe the narrowest useful segment." },
  { key: "solution", label: "Solution", hint: "What you build and how it resolves the problem." },
  { key: "market", label: "Market", hint: "Size, geography, and how you reached the estimate." },
  { key: "competition", label: "Competition", hint: "Who solves this today, and your difference." },
  { key: "businessModel", label: "Business Model", hint: "How money is made, pricing, unit economics." },
  { key: "validation", label: "Validation", hint: "Evidence collected so far — interviews, tests, pilots." },
  { key: "traction", label: "Traction", hint: "Usage, users, waitlist, revenue. Mark it self-reported." },
  { key: "roadmap", label: "Roadmap", hint: "Next 3, 6 and 12 months." },
  { key: "team", label: "Team Roles", hint: "Who is doing what, and what is missing." },
  { key: "funds", label: "Funds Required", hint: "Amount and the use of funds." },
  { key: "growth", label: "Growth Plan", hint: "How the first 1,000 users are reached." },
];

export type Idea = {
  name: string;
  template: string;
  category: Category;
  stage: Stage;
  oneLiner: string;
  fields: Record<WorkspaceField, string>;
};

export type FieldReview = {
  field: WorkspaceField;
  status: "complete" | "needs_evidence" | "needs_revision" | "missing";
  note: string;
};

export type IdeaAnalysis = {
  summary: string;
  reviews: FieldReview[];
  weakAssumptions: string[];
  questions: string[];
  validationActions: string[];
  generatedAt: string;
};

export type ReadinessReport = {
  entityName: string;
  targetCapital: string;
  category: Category;
  stage: Stage;
  scores: { key: string; label: string; score: number; explanation: string }[];
  swot: { strengths: string[]; weaknesses: string[]; opportunities: string[]; threats: string[] };
  observations: string[];
  moatNote: string;
  priorities: string[];
  generatedAt: string;
};

export type ApplicationStatus =
  | "Draft"
  | "Submitted"
  | "Under Review"
  | "Interested"
  | "Rejected"
  | "Withdrawn";

export type Application = {
  id: string;
  opportunityId: string;
  opportunityTitle: string;
  organization: string;
  founderName: string;
  ideaName: string;
  stage: Stage;
  readinessScore: number | null;
  workspaceCompletion: number;
  note: string;
  status: ApplicationStatus;
  submittedAt: string;
};

export type Message = {
  id: string;
  applicationId: string;
  from: "founder" | "partner";
  text: string;
  at: string;
};

export type FounderProfile = {
  name: string;
  email: string;
  college: string;
  education: string;
  branch: string;
  skills: string[];
  interests: string[];
  location: string;
  links: string;
  publicProfile: boolean;
  onboarded: boolean;
};

export type PartnerProfile = {
  organization: string;
  orgType: string;
  description: string;
  website: string;
  location: string;
  focusAreas: string[];
  contactEmail: string;
  verification: "unverified" | "pending" | "verified";
  onboarded: boolean;
};

export type JourneyStage = "Explorer" | "Validated" | "Builder" | "Venture Ready";
