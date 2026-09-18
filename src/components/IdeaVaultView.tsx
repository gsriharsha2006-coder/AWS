import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  FolderPlus, 
  Sparkles, 
  CheckCircle, 
  HelpCircle, 
  Save, 
  FileText, 
  ArrowRight,
  TrendingUp, 
  Layers, 
  Cpu, 
  Users, 
  Terminal, 
  Calendar, 
  Database, 
  AlertCircle,
  Clock,
  Briefcase,
  ExternalLink,
  ChevronRight,
  Check,
  Send,
  Download,
  X
} from "lucide-react";
import { Idea, IdeaTemplate } from "../types";
import { IDEA_TEMPLATES } from "../data";

interface IdeaVaultViewProps {
  ideas: Idea[];
  templates: IdeaTemplate[];
  onAddIdea: (newIdea: Idea) => void;
  onUpdateIdea: (updatedIdea: Idea) => void;
  onDeleteIdea: (id: string) => void;
  onNavigateToCoach: (idea: Idea) => void;
  onNavigateToOpportunities: (idea: Idea) => void;
}

// Full template name array required by platform specs
const ADDITIONAL_TEMPLATES = [
  { id: "Startup Idea", name: "Startup Idea", desc: "General early-stage validation, narrative alignment, and customer segments." },
  { id: "SaaS Product", name: "SaaS Product", desc: "B2B productivity tools, workflow systems, scale multipliers." },
  { id: "Marketing-Based Startup", name: "Marketing-Based Startup", desc: "AdTech, attention brokerage, growth instrumentation." },
  { id: "AI Startup", name: "AI Startup", desc: "Sovereign agents, proprietary RAG layers, cognitive pipelines." },
  { id: "Social Networking Platform", name: "Social Networking Platform", desc: "Ecosystem communities, tokenized reputation networks." },
  { id: "Hackathon Project", name: "Hackathon Project", desc: "48-hour sprints, maximum high-impact demo proofing." },
  { id: "FinTech Startup", name: "FinTech Startup", desc: "Smart treasuries, international payment rails, micro-funding." },
  { id: "EdTech Startup", name: "EdTech Startup", desc: "Personalized syllabus structures, custom braille, vocal companions." },
  { id: "HealthTech Startup", name: "HealthTech Startup", desc: "EHR connectors, custom medical prediction agents, private HIPAA nodes." },
  { id: "Creator Economy Startup", name: "Creator Economy Startup", desc: "Sponsor distribution hubs, automated licensing contracts." }
];

export default function IdeaVaultView({
  ideas,
  templates,
  onAddIdea,
  onUpdateIdea,
  onDeleteIdea,
  onNavigateToCoach,
  onNavigateToOpportunities
}: IdeaVaultViewProps) {
  const [activeIdeaId, setActiveIdeaId] = useState<string | null>(null);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [autoSaveMsg, setAutoSaveMsg] = useState("");
  const [manualSaveSuccess, setManualSaveSuccess] = useState(false);

  // Active loaded workbook idea
  const currentIdea = ideas.find((i) => i.id === activeIdeaId);

  // Auto-save feedback loop simulator
  useEffect(() => {
    if (!currentIdea) return;
    
    // Set a periodic auto-mock save notice to give a futuristic real-time SaaS operations response
    const interval = setInterval(() => {
      setAutoSaveMsg("Workspace state compiled and auto-saved locally.");
      setTimeout(() => setAutoSaveMsg(""), 3000);
    }, 20000);

    return () => clearInterval(interval);
  }, [activeIdeaId, ideas]);

  // Form input update handler
  const updateField = (field: keyof Idea, value: string) => {
    if (!currentIdea) return;
    const updated: Idea = {
      ...currentIdea,
      [field]: value,
      lastSaved: new Date().toISOString()
    };
    onUpdateIdea(updated);
  };

  // Select a template/category and create a workbook
  const handleSelectTemplateAndCreate = (templateKey: string) => {
    // Locate template default fields
    const coreTemplate = templates.find((t) => t.id === templateKey) || templates[0];
    
    const newIdeaObj: Idea = {
      id: `idea-${Date.now()}`,
      templateId: coreTemplate.id,
      name: `Untitled ${templateKey} Draft`,
      isDraft: true,
      lastSaved: new Date().toISOString(),
      solvingTrack: `Addressing the ${templateKey} category by solving the core friction point under...`,
      userPersona: coreTemplate.defaultUserPersona,
      theHack: coreTemplate.defaultTheHack,
      demoValue: coreTemplate.defaultDemoValue,
      existingSolutions: coreTemplate.defaultExistingSolutions,
      futurePotential: coreTemplate.defaultFuturePotential,
      postHackathonPlan: coreTemplate.defaultPostHackathonPlan,
      theSquad: coreTemplate.defaultSquad,
      technicalStack: coreTemplate.defaultTechnicalStack
    };

    onAddIdea(newIdeaObj);
    setActiveIdeaId(newIdeaObj.id);
    setShowTemplateSelector(false);
  };

  // Calculate structured workspace documentation completion
  const computeProgress = (idea: Idea) => {
    let score = 0;
    const fields = [
      "solvingTrack",
      "userPersona",
      "theHack",
      "demoValue",
      "existingSolutions",
      "futurePotential",
      "postHackathonPlan",
      "theSquad",
      "technicalStack"
    ];

    fields.forEach((field) => {
      const val = idea[field as keyof Idea] as string;
      // If field has text and isn't just the default stub
      if (val && val.trim().length > 15) {
        score += 1;
      }
    });

    // Translate to 20%, 45%, 75%, 100% metrics requested
    const fraction = score / fields.length;
    if (fraction === 0) return 20; // Base baseline is 20%
    if (fraction <= 0.3) return 20;
    if (fraction <= 0.6) return 45;
    if (fraction < 1.0) return 75;
    return 100;
  };

  const handlesManualSave = () => {
    setManualSaveSuccess(true);
    setTimeout(() => setManualSaveSuccess(false), 2000);
  };

  // Standard raw Document exporter
  const triggerExport = (idea: Idea) => {
    const documentStr = `
# VENTURE CONNECT STARTUP WORKBOOK
- Idea Target Title: ${idea.name}
- Template Configuration: ${idea.templateId}
- Last Compiled State: ${idea.lastSaved}

--------------------------------------------------
1. SOLVING TRACK
${idea.solvingTrack}

2. USER PERSONA
${idea.userPersona}

3. THE HACK / SYSTEM ARCHITECTURE Moat
${idea.theHack}

4. WORKING DEMO VALUE
${idea.demoValue}

5. COMPETITIVE LANDSCAPE & EXISTING SOLUTIONS
${idea.existingSolutions}

6. FUTURE POTENTIAL MULTIPLIER
${idea.futurePotential}

7. POST-LAUNCH / HACKATHON TACTICAL PLAN
${idea.postHackathonPlan}

8. SQUAD COMPOSITION & CAPABILITIES
${idea.theSquad}

9. HIGH-DENSITY TS/JS TECHNICAL STACK DESCRIPTION
${idea.technicalStack}
`;

    const blob = new Blob([documentStr], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${idea.name.toLowerCase().replace(/[^a-z0-9]+/g, "_")}_workspace_export.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Assistant guideline parameters
  const ASSISTANT_GUIDE: Record<string, { title: string; hint: string; example: string }> = {
    solvingTrack: {
      title: "1. Solving Track Moat",
      hint: "Define exactly which ecological tier, enterprise SaaS silo, or hackathon focus vertical you targets with deterministic pain validations.",
      example: '"Addressing the AI for Good track by solving inaccessible educational content for visually impaired students through tactile response hardware."'
    },
    userPersona: {
      title: "2. Target User Persona validated",
      hint: "Detail the human or enterprise client experiencing this baseline friction day-to-day. Avoid general demographic generalizations.",
      example: '"Enterprise DevOps leads scaling AWS clusters who actively lose ~10 hours weekly parsing non-unified telemetry log lines manually."'
    },
    theHack: {
      title: "3. The Core Hack",
      hint: "Explain your elegant mechanical approach or architecture pipeline bypass. How do you resolve this with high performance?",
      example: '"We extract custom byte sequences inside kernel level logs before matching against in-memory dictionary trees, bypassing LLM pricing entirely."'
    },
    demoValue: {
      title: "4. Sandbox Working Demo Value",
      hint: "What does the investor or judge see on an live inspect test? Design an active, high-contrast visual dashboard proof point.",
      example: '"An automated websocket stream flashing color-coded alert widgets within 30ms of simulation failure telemetry signals."'
    },
    existingSolutions: {
      title: "5. Alternative and Existing Competitors",
      hint: "Detail the competitive incumbents or clumsy manual practices, and show precisely where your entry mechanism exceeds their boundaries.",
      example: '"Datadog charges high premiums for generalist indicators. Legacy scripts are static and require highly customized maintenance scripts per node."'
    },
    futurePotential: {
      title: "6. Future Scale Multipliers",
      hint: "How does this platform scale into $5M ARR category without infinite human consulting overhead?",
      example: '"Expanding into real-time medical sensor stream parsers to feed automatic diagnostic charts securely on private HIPPA clusters."'
    },
    postHackathonPlan: {
      title: "7. Post-Launch / Hackathon Validation Roadmap",
      hint: "Define what happens day 3. How do you gather your first 100 testing developers or secure customer letters of intent?",
      example: '"Deploying free dev editions on ProductHunt, monitoring StackOverflow replicate tags to capture initial telemetry validation signals."'
    },
    theSquad: {
      title: "8. Squad capabilities mapping",
      hint: "Map the team members to execution goals, emphasizing native Technical capabilities and target user familiarity.",
      example: '"2 Core Systems Developers (Rust / TS database scaling), 1 UX Interface specialist experienced with modern Figma/Tailwind schemas."'
    },
    technicalStack: {
      title: "9. High-fidelity Tech Stack specs",
      hint: "Define clean, robust modern frameworks that support performance, lazy initialization, secure secrets handling, and responsiveness.",
      example: '"Next.js, Python FastAPI backend, custom local vector embeddings on edge SQLite DBs, Dockerized deploy nodes."'
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Upper header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-display font-medium text-slate-900 flex items-center gap-2">
            <Sparkles className="text-blue-600 w-5 h-5 animate-pulse" />
            Venture Worksheets / Idea Vault
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Build investor-grade startup documentation and structured templates before launching or getting institutional intelligence.
          </p>
        </div>

        <button
          onClick={() => setShowTemplateSelector(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 transition-all cursor-pointer shadow-sm"
          id="btn-trigger-template-selector"
        >
          <FolderPlus className="w-4 h-4" />
          Create New Idea Plan
        </button>
      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Draft Lists Selection Pane */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden p-5 space-y-4">
          <h3 className="font-display font-medium text-slate-900 text-sm border-b border-slate-100 pb-2">
            Your Startup Workbooks ({ideas.length})
          </h3>

          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            {ideas.map((idea) => {
              const progress = computeProgress(idea);
              const isActive = idea.id === activeIdeaId;

              return (
                <div
                  key={idea.id}
                  onClick={() => setActiveIdeaId(idea.id)}
                  className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                    isActive
                      ? "border-blue-505 bg-blue-50/75 ring-1 ring-blue-400/30"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                  id={`idea-vault-draft-${idea.id}`}
                >
                  <div className="flex justify-between items-start">
                    <span className="px-2 py-0.5 text-[9px] uppercase font-mono font-bold bg-slate-900/10 text-slate-700 rounded">
                      {idea.templateId}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(idea.lastSaved).toLocaleDateString()}
                    </span>
                  </div>

                  <h4 className="font-display font-medium text-slate-800 text-sm mt-2 leading-snug line-clamp-1">
                    {idea.name}
                  </h4>

                  {/* Progress Tracker representation requested in system */}
                  <div className="mt-3 space-y-1">
                    <div className="flex justify-between text-[10px] font-mono text-slate-500">
                      <span>Documentation Completed</span>
                      <span className="font-semibold text-blue-600">{progress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          progress === 100 
                            ? "bg-emerald-500" 
                            : progress === 75 
                            ? "bg-blue-500" 
                            : progress === 45 
                            ? "bg-indigo-400" 
                            : "bg-slate-400"
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-3 flex justify-end gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteIdea(idea.id);
                        if (isActive) setActiveIdeaId(null);
                      }}
                      className="text-[10px] font-mono text-slate-400 hover:text-rose-600 p-1 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}

            {ideas.length === 0 && (
              <div className="text-center py-12 text-slate-400 space-y-2">
                <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs italic">No workspace books created yet.</p>
                <button 
                  onClick={() => setShowTemplateSelector(true)}
                  className="text-xs text-blue-600 font-semibold underline block mx-auto cursor-pointer"
                >
                  Create one now
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Active Structured Editor Workspace */}
        <div className="lg:col-span-8">
          {currentIdea ? (
            <div className="bg-white rounded-2xl border border-slate-202 shadow-sm overflow-hidden flex flex-col">
              
              {/* Workspace Header */}
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={currentIdea.name}
                      onChange={(e) => updateField("name", e.target.value)}
                      className="text-base md:text-lg font-display font-semibold text-slate-900 border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none bg-transparent"
                      placeholder="Startup Name / Working Title"
                      id="workbook-title-input"
                    />
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono tracking-wider flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    SYSTEM AUTO-SAVE SECURED • {currentIdea.templateId.toUpperCase()} MULTIPLIER
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Status Indicator */}
                  {autoSaveMsg && (
                    <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                      {autoSaveMsg}
                    </span>
                  )}

                  <button
                    onClick={handlesManualSave}
                    className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-all text-xs font-medium flex items-center gap-1 cursor-pointer border border-slate-200"
                    title="Validate Workbook state"
                  >
                    {manualSaveSuccess ? <Check className="w-4 h-4 text-emerald-500" /> : <Save className="w-4 h-4" />}
                    Save
                  </button>

                  <button
                    onClick={() => triggerExport(currentIdea)}
                    className="px-3.5 py-2 bg-slate-900 text-white rounded-xl text-xs font-medium hover:bg-slate-850 transition-all flex items-center gap-1.5 cursor-pointer"
                    title="Export structured plan"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Export Markdown
                  </button>
                </div>
              </div>

              {/* Core Exporters Quick Launch panel */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold text-indigo-950 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    Ecosystem Connect Launchpad
                  </div>
                  <p className="text-[11px] text-indigo-700 mt-0.5">
                    Finished worksheets can be forwarded straight into opportunities programs, or analyzed dynamically using AI Coach.
                  </p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => onNavigateToCoach(currentIdea)}
                    className="flex-1 sm:flex-none px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-medium rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    Send to AI Coach
                    <ArrowRight className="w-3 h-3" />
                  </button>

                  <button
                    onClick={() => onNavigateToOpportunities(currentIdea)}
                    className="flex-1 sm:flex-none px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-medium rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    Apply to Opportunities
                    <Briefcase className="w-3" />
                  </button>
                </div>
              </div>

              {/* Split Content: Worksheet Sections vs Assistant Guide */}
              <div className="grid grid-cols-1 xl:grid-cols-12 divide-y xl:divide-y-0 xl:divide-x divide-slate-100">
                
                {/* Scrollable Worksheet Body (7 span cols) */}
                <div className="xl:col-span-7 p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                  
                  {/* Dynamic tracking fields mapped */}
                  {Object.keys(ASSISTANT_GUIDE).map((key) => {
                    const guide = ASSISTANT_GUIDE[key];
                    const val = currentIdea[key as keyof Idea] as string;

                    return (
                      <div key={key} className="space-y-1.5">
                        <div className="flex justify-between items-center bg-slate-50 px-2 py-1 rounded">
                          <label className="text-xs font-mono font-semibold text-slate-700 uppercase tracking-tight">
                            {guide.title}
                          </label>
                          <span className={`text-[10px] font-mono ${val && val.length > 20 ? "text-emerald-600" : "text-amber-500"}`}>
                            {val && val.length > 20 ? "✓ Complete Node" : "• Deficient"}
                          </span>
                        </div>

                        <textarea
                          value={val || ""}
                          onChange={(e) => updateField(key as keyof Idea, e.target.value)}
                          rows={3}
                          className="w-full text-xs text-slate-800 p-2 text-normal border border-slate-205 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
                          placeholder={`Write details ...`}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Intelligent example reference tracker (5 spans) */}
                <div className="xl:col-span-5 p-6 bg-slate-50/50 space-y-6 max-h-[70vh] overflow-y-auto">
                  <div className="border-b border-slate-100 pb-2">
                    <span className="text-[10px] font-mono font-bold text-blue-600 tracking-wider uppercase block">
                      Intellectual Coach Assistant
                    </span>
                    <h3 className="text-sm font-semibold text-slate-900 mt-1">Ecosystem Guidelines</h3>
                  </div>

                  {/* Highlighting active or general guidelines */}
                  <div className="space-y-5">
                    {Object.keys(ASSISTANT_GUIDE).map((key) => {
                      const guide = ASSISTANT_GUIDE[key];
                      return (
                        <div key={key} className="bg-white p-4 rounded-xl border border-slate-200/80 space-y-2">
                          <h4 className="text-xs font-semibold text-slate-800 flex items-center gap-1 uppercase tracking-wide">
                            <Sparkles className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            {guide.title}
                          </h4>
                          <p className="text-[11px] text-slate-500 leading-normal">{guide.hint}</p>
                          
                          <div className="bg-blue-50/65 rounded-lg p-2.5 border border-blue-105 space-y-1">
                            <span className="text-[9px] font-mono font-bold text-blue-700 tracking-wider uppercase">
                              RECOMMENDED ARCHETYPE:
                            </span>
                            <blockquote className="text-[11px] text-blue-900 font-medium italic leading-relaxed">
                              {guide.example}
                            </blockquote>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-16 border border-slate-200 text-center space-y-4">
              <Layers className="w-16 h-16 text-slate-300 mx-auto" />
              <h3 className="font-display font-semibold text-slate-900 text-lg">Select or Create a Pitch Worksheet</h3>
              <p className="text-slate-500 text-sm max-w-sm mx-auto leading-relaxed">
                Choose a structured template (Corporate SaaS, GenAI Agent, Creator Gateway, FinTech Engine, Social Network) and draft compliant operational documents.
              </p>
              <button
                onClick={() => setShowTemplateSelector(true)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer inline-flex items-center gap-1"
              >
                Create New Workbook
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

      </div>

      {/* TEMPLATE PICKER MODAL */}
      {showTemplateSelector && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, y: 12 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="bg-white rounded-2xl p-6 border border-slate-200 max-w-2xl w-full shadow-2xl space-y-5"
          >
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-display font-semibold text-slate-900 text-base">Select Your Workspace Matrix Template</h3>
                <p className="text-xs text-slate-500 mt-0.5">Pick an architectural model to configure your workbook default inputs.</p>
              </div>
              <button 
                onClick={() => setShowTemplateSelector(false)}
                className="p-1.5 hover:bg-slate-100 rounded text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-1">
              {ADDITIONAL_TEMPLATES.map((tpl) => {
                let badgeIcon = <Layers className="w-4 h-4 text-blue-600" />;
                if (tpl.name.includes("AI")) badgeIcon = <Cpu className="w-4 h-4 text-indigo-500 animate-pulse" />;
                if (tpl.name.includes("FinTech")) badgeIcon = <TrendingUp className="w-4 h-4 text-emerald-500" />;
                if (tpl.name.includes("SaaS")) badgeIcon = <Layers className="w-4 h-4 text-slate-700" />;

                return (
                  <button
                    key={tpl.id}
                    onClick={() => handleSelectTemplateAndCreate(tpl.id)}
                    className="text-left bg-slate-50 hover:bg-blue-50/70 p-4 rounded-xl border border-slate-200 hover:border-blue-400 transition-all space-y-2 group cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <div className="bg-white p-1.5 rounded-lg border border-slate-200">
                        {badgeIcon}
                      </div>
                      <span className="text-sm font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">
                        {tpl.name}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 leading-normal line-clamp-2">
                      {tpl.desc}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button 
                onClick={() => setShowTemplateSelector(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 text-xs rounded-xl hover:bg-slate-50 cursor-pointer"
              >
                Close Template Selector
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}
