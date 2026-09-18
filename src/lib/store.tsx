import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { DEMO_OPPORTUNITY, REAL_OPPORTUNITIES } from "@/data/opportunities";
import {
  WORKSPACE_FIELDS,
  type Application,
  type ApplicationStatus,
  type FounderProfile,
  type Idea,
  type IdeaAnalysis,
  type JourneyStage,
  type Message,
  type Opportunity,
  type PartnerProfile,
  type ReadinessReport,
  type Role,
} from "./types";

const STORAGE_KEY = "venture-connect-state-v1";

export type AppState = {
  role: Role | null;
  demoMode: boolean;
  founder: FounderProfile;
  partner: PartnerProfile;
  idea: Idea;
  analysis: IdeaAnalysis | null;
  readiness: ReadinessReport | null;
  applications: Application[];
  partnerOpportunities: Opportunity[];
  messages: Message[];
  founderPlan: "free" | "premium";
  partnerPlan: "free" | "pro";
  reportsUsed: number;
};

const emptyFields = Object.fromEntries(WORKSPACE_FIELDS.map((f) => [f.key, ""])) as Idea["fields"];

const blankState: AppState = {
  role: null,
  demoMode: false,
  founder: {
    name: "",
    email: "",
    college: "",
    education: "",
    branch: "",
    skills: [],
    interests: [],
    location: "",
    links: "",
    publicProfile: true,
    onboarded: false,
  },
  partner: {
    organization: "",
    orgType: "Incubator",
    description: "",
    website: "",
    location: "",
    focusAreas: [],
    contactEmail: "",
    verification: "unverified",
    onboarded: false,
  },
  idea: {
    name: "",
    template: "Custom Idea",
    category: "AI",
    stage: "Idea",
    oneLiner: "",
    fields: emptyFields,
  },
  analysis: null,
  readiness: null,
  applications: [],
  partnerOpportunities: [],
  messages: [],
  founderPlan: "free",
  partnerPlan: "free",
  reportsUsed: 0,
};

export function demoFounderState(): Partial<AppState> {
  return {
    demoMode: true,
    founder: {
      name: "Demo Founder (sample account)",
      email: "demo.founder@ventureconnect.test",
      college: "Demo Institute of Technology",
      education: "B.Tech, 3rd year",
      branch: "Computer Science",
      skills: ["Product", "AI", "Full-stack"],
      interests: ["AI tooling", "EdTech", "Developer products"],
      location: "Hyderabad, India",
      links: "github.com/demo-founder",
      publicProfile: true,
      onboarded: true,
    },
    idea: {
      name: "StudyLoop",
      template: "AI Startup",
      category: "AI",
      stage: "Prototype",
      oneLiner: "An AI study companion that turns lecture material into spaced-practice drills.",
      fields: {
        problem:
          "Engineering students revise from scattered PDFs and recorded lectures with no structured practice, so exam preparation is inefficient and last-minute.",
        targetUsers:
          "Second and third year engineering undergraduates in Indian private colleges who prepare for semester exams alongside placements.",
        solution:
          "Upload course material, get an automatically generated spaced-repetition drill set with weak-topic tracking and weekly revision plans.",
        market:
          "Roughly 4 million undergraduate engineering students in India; initial serviceable target is 120 colleges in two states, estimated bottom-up from admission intake data.",
        competition:
          "Generic flashcard apps and YouTube revision channels. Neither is tied to a specific college syllabus or tracks weak topics across a semester.",
        businessModel:
          "Freemium for students at ₹149/month for full drill generation, plus a per-department college licence.",
        validation:
          "18 student interviews completed. 12 said their current revision is unstructured. Self-reported, not independently verified.",
        traction: "Prototype tested with 40 students across two colleges; 62 waitlist signups. Self-reported.",
        roadmap:
          "Next 3 months: MVP with syllabus mapping. 6 months: two college pilots. 12 months: paid student tier and one department licence.",
        team: "Two founders — product/AI and full-stack. Missing a distribution/campus sales lead.",
        funds: "₹15 lakh to cover 9 months of runway, inference costs and two college pilots.",
        growth:
          "Campus ambassador program in target colleges, plus department-level pilots that convert to paid licences.",
      },
    },
  };
}

export function demoPartnerState(): Partial<AppState> {
  return {
    demoMode: true,
    partner: {
      organization: "Demo Partner Organization (sample data)",
      orgType: "Incubator",
      description:
        "Sample ecosystem partner used to demonstrate the posting, review and interest workflow inside Venture Connect.",
      website: "https://example.com",
      location: "Remote, India",
      focusAreas: ["AI", "SaaS", "EdTech"],
      contactEmail: "demo.partner@ventureconnect.test",
      verification: "pending",
      onboarded: true,
    },
    partnerOpportunities: [DEMO_OPPORTUNITY],
    applications: demoApplications(),
    messages: [],
  };
}

function daysAgo(n: number) {
  return new Date(Date.now() - n * 86_400_000).toISOString();
}

function demoApplications(): Application[] {
  return [
    {
      id: "demo-app-1",
      opportunityId: DEMO_OPPORTUNITY.id,
      opportunityTitle: DEMO_OPPORTUNITY.title,
      organization: DEMO_OPPORTUNITY.organization,
      founderName: "Demo Founder (sample account)",
      ideaName: "StudyLoop",
      stage: "Prototype",
      readinessScore: 61,
      workspaceCompletion: 92,
      note: "Prototype tested with 40 students across two colleges. Looking for structured pilot support and a campus distribution mentor.",
      status: "Submitted",
      submittedAt: daysAgo(2),
    },
    {
      id: "demo-app-2",
      opportunityId: DEMO_OPPORTUNITY.id,
      opportunityTitle: DEMO_OPPORTUNITY.title,
      organization: DEMO_OPPORTUNITY.organization,
      founderName: "Sample Applicant — Meera K. (demo)",
      ideaName: "ClinicQueue",
      stage: "MVP",
      readinessScore: 68,
      workspaceCompletion: 75,
      note: "Queue management for small clinics. Two paying clinics on a monthly plan, self-reported.",
      status: "Under Review",
      submittedAt: daysAgo(6),
    },
    {
      id: "demo-app-3",
      opportunityId: DEMO_OPPORTUNITY.id,
      opportunityTitle: DEMO_OPPORTUNITY.title,
      organization: DEMO_OPPORTUNITY.organization,
      founderName: "Sample Applicant — Arjun R. (demo)",
      ideaName: "FieldSense",
      stage: "Idea",
      readinessScore: null,
      workspaceCompletion: 38,
      note: "Soil sensing for small farms. Still early; no validation collected yet.",
      status: "Submitted",
      submittedAt: daysAgo(9),
    },
  ];
}

type Ctx = {
  state: AppState;
  ready: boolean;
  update: (patch: Partial<AppState>) => void;
  setRole: (role: Role | null) => void;
  updateIdeaField: (key: keyof Idea["fields"], value: string) => void;
  addApplication: (app: Application) => void;
  setApplicationStatus: (id: string, status: ApplicationStatus) => void;
  addMessage: (applicationId: string, from: "founder" | "partner", text: string) => void;
  publishOpportunity: (opp: Opportunity) => void;
  reset: () => void;
  allOpportunities: Opportunity[];
  completion: number;
  journeyStage: JourneyStage;
};

const StoreContext = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(blankState);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setState({ ...blankState, ...(JSON.parse(raw) as AppState) });
    } catch {
      /* corrupted local data is ignored and the app starts fresh */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage unavailable — the session simply will not persist */
    }
  }, [state, ready]);

  const update = useCallback((patch: Partial<AppState>) => {
    setState((s) => ({ ...s, ...patch }));
  }, []);

  const setRole = useCallback((role: Role | null) => setState((s) => ({ ...s, role })), []);

  const updateIdeaField = useCallback((key: keyof Idea["fields"], value: string) => {
    setState((s) => ({ ...s, idea: { ...s.idea, fields: { ...s.idea.fields, [key]: value } } }));
  }, []);

  const addApplication = useCallback((app: Application) => {
    setState((s) => ({ ...s, applications: [app, ...s.applications] }));
  }, []);

  const setApplicationStatus = useCallback((id: string, status: ApplicationStatus) => {
    setState((s) => ({
      ...s,
      applications: s.applications.map((a) => (a.id === id ? { ...a, status } : a)),
    }));
  }, []);

  const addMessage = useCallback(
    (applicationId: string, from: "founder" | "partner", text: string) => {
      setState((s) => ({
        ...s,
        messages: [
          ...s.messages,
          { id: `m-${Date.now()}`, applicationId, from, text, at: new Date().toISOString() },
        ],
      }));
    },
    [],
  );

  const publishOpportunity = useCallback((opp: Opportunity) => {
    setState((s) => ({ ...s, partnerOpportunities: [opp, ...s.partnerOpportunities] }));
  }, []);

  const reset = useCallback(() => setState(blankState), []);

  const allOpportunities = useMemo(
    () => [...state.partnerOpportunities.filter((o) => o.status !== "draft"), ...REAL_OPPORTUNITIES],
    [state.partnerOpportunities],
  );

  const completion = useMemo(() => {
    const filled = WORKSPACE_FIELDS.filter(
      (f) => (state.idea.fields[f.key] || "").trim().length >= 40,
    ).length;
    return Math.round((filled / WORKSPACE_FIELDS.length) * 100);
  }, [state.idea.fields]);

  const journeyStage: JourneyStage = useMemo(() => {
    const score = state.readiness?.scores[0]?.score ?? null;
    if (score !== null && score >= 75 && completion >= 80) return "Venture Ready";
    if (state.idea.stage === "MVP" || state.idea.stage === "Early Revenue" || completion >= 65)
      return "Builder";
    if ((state.idea.fields.validation || "").trim().length > 40) return "Validated";
    return "Explorer";
  }, [state.readiness, completion, state.idea]);

  const value: Ctx = {
    state,
    ready,
    update,
    setRole,
    updateIdeaField,
    addApplication,
    setApplicationStatus,
    addMessage,
    publishOpportunity,
    reset,
    allOpportunities,
    completion,
    journeyStage,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
