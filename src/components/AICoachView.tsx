import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  Sparkles, 
  Cpu, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Briefcase, 
  Compass, 
  HelpCircle, 
  BadgeAlert, 
  CheckCircle,
  Clock,
  Shield,
  Zap,
  RotateCcw,
  BookOpen,
  PieChart,
  FileText,
  Import,
  ExternalLink
} from "lucide-react";
import { VCDueDiligenceReport, Idea } from "../types";

interface AICoachViewProps {
  ideas: Idea[];
  onTriggerAnalyze: (payload: {
    entityName: string;
    targetCapital: string;
    category: string;
    stage: string;
    pitch: string;
    ideaContext?: any;
  }) => Promise<VCDueDiligenceReport>;
}

export default function AICoachView({ ideas, onTriggerAnalyze }: AICoachViewProps) {
  // Input fields state
  const [entityName, setEntityName] = useState("AeroScribe AI");
  const [targetCapital, setTargetCapital] = useState("$500,000");
  const [category, setCategory] = useState("Sovereign AI & Agentics");
  const [stage, setStage] = useState("Pre-Seed (Idea & Prototype Design)");
  const [pitch, setPitch] = useState(
    "AeroScribe AI resolves inaccessible compliance reports by deploying custom local models fine-tuned to corporate taxonomies. Our tech moat is an optimized, local tokenization pipeline which runs behind secure corporate firewalls with zero external dependency, eliminating LLM pricing leakage risk."
  );

  // Selector state for importing from Idea Vault
  const [selectedIdeaIdForImport, setSelectedIdeaIdForImport] = useState("");
  const [isImportedNotice, setIsImportedNotice] = useState(false);

  // Status/Interactive generation levels
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [reportResult, setReportResult] = useState<VCDueDiligenceReport | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const handleImportFromIdea = () => {
    const selectedIdea = ideas.find(i => i.id === selectedIdeaIdForImport);
    if (!selectedIdea) return;

    setEntityName(selectedIdea.name);
    setCategory(selectedIdea.templateId);
    setPitch(
      `Track: ${selectedIdea.solvingTrack}\n\n` +
      `User Persona: ${selectedIdea.userPersona}\n\n` +
      `The Hack & IP Moat: ${selectedIdea.theHack}\n\n` +
      `Working Demo Structure: ${selectedIdea.demoValue}\n\n` +
      `Defensible Technical Specs: ${selectedIdea.technicalStack}`
    );

    setIsImportedNotice(true);
    setTimeout(() => setIsImportedNotice(false), 2000);
  };

  const handleTriggerAnalysis = async () => {
    if (!entityName.trim() || !pitch.trim()) {
      setErrorMessage("Startup Entity Name and Strategic Narrative Pitch specifications are mandatory.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    setReportResult(null);

    // Simulated interactive sequence loaders (Bloomberg Terminal compiler vibe)
    const steps = [
      "Securing analytical endpoints and initial model parameters...",
      "Analyzing strategic value proposition and tech moat alignment...",
      "Computing SWOT vector maps and regulatory bottleneck risks...",
      "Simulating alternative incumbent products comparison loops...",
      "Compiling complete VC evaluation scorecards and narrative scores..."
    ];

    setLoadingStep(0);
    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        }
        clearInterval(stepInterval);
        return prev;
      });
    }, 1200);

    try {
      const selectedIdea = ideas.find(i => i.id === selectedIdeaIdForImport);
      const report = await onTriggerAnalyze({
        entityName,
        targetCapital,
        category,
        stage,
        pitch,
        ideaContext: selectedIdea ? {
          solvingTrack: selectedIdea.solvingTrack,
          userPersona: selectedIdea.userPersona,
          theHack: selectedIdea.theHack,
          demoValue: selectedIdea.demoValue,
          existingSolutions: selectedIdea.existingSolutions,
          futurePotential: selectedIdea.futurePotential,
          postHackathonPlan: selectedIdea.postHackathonPlan,
          theSquad: selectedIdea.theSquad,
          technicalStack: selectedIdea.technicalStack
        } : undefined
      });
      setReportResult(report);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Ecosystem core generation failure. Ensure GEMINI_API_KEY is available in secrets.");
    } finally {
      clearInterval(stepInterval);
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Page Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-blue-900 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-blue-400 font-mono text-xs tracking-widest uppercase mb-1">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              VENTURE CORE COGNITIVE SERVICE // SECURED
            </div>
            <h1 className="text-2xl md:text-3xl font-display font-medium text-white tracking-tight">
              AI Startup Operating <span className="text-blue-400">Coach</span>
            </h1>
            <p className="text-slate-400 text-xs mt-1 max-w-xl">
              Forward workbook drafts straight into our intelligence analyzer to compute comprehensive due diligence reports, scorecards, competitor moats, and strategic consulting logs.
            </p>
          </div>
          <span className="text-[10px] bg-slate-800 text-slate-300 font-mono px-3 py-1 rounded-xl">
            COGNITIVE POWERED BY GEMINI 3.5
          </span>
        </div>
      </div>

      {/* Main Split: Intake Form Panel vs Interactive Report Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Intake configuration pane (5 span cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Quick Import Widget */}
          {ideas.length > 0 && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                  <Import className="w-4 h-4 text-blue-600" />
                  Import from Idea Vault
                </span>
                {isImportedNotice && (
                  <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded leading-none">
                    Data Loaded!
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <select
                  value={selectedIdeaIdForImport}
                  onChange={(e) => setSelectedIdeaIdForImport(e.target.value)}
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none"
                >
                  <option value="">-- Choose active workbook --</option>
                  {ideas.map(i => (
                    <option key={i.id} value={i.id}>{i.name} ({i.templateId})</option>
                  ))}
                </select>
                <button
                  onClick={handleImportFromIdea}
                  disabled={!selectedIdeaIdForImport}
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-medium hover:bg-slate-850 disabled:opacity-50 transition-all cursor-pointer"
                >
                  Load
                </button>
              </div>
            </div>
          )}

          {/* Form Content */}
          <div className="bg-white rounded-2xl border border-slate-205 shadow-sm p-6 space-y-4">
            <h3 className="font-display font-medium text-slate-900 text-sm border-b border-slate-100 pb-2">
              Startup Declaration profile
            </h3>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-mono font-medium text-slate-500 uppercase">Startup Entity Name</label>
                <input
                  type="text"
                  value={entityName}
                  onChange={(e) => setEntityName(e.target.value)}
                  placeholder="e.g., AeroScribe AI"
                  className="w-full text-xs text-slate-800 p-2.5 text-normal border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-mono font-medium text-slate-500 uppercase">Target Capital Required</label>
                  <input
                    type="text"
                    value={targetCapital}
                    onChange={(e) => setTargetCapital(e.target.value)}
                    placeholder="e.g., $500,000"
                    className="w-full text-xs text-slate-800 p-2.5 text-normal border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono font-medium text-slate-500 uppercase">Unified Category Tag</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g., Sovereign AI"
                    className="w-full text-xs text-slate-800 p-2.5 text-normal border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono font-medium text-slate-500 uppercase">Operational Launch Stage</label>
                <select
                  value={stage}
                  onChange={(e) => setStage(e.target.value)}
                  className="w-full text-xs text-slate-800 p-2.5 text-normal border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                >
                  <option value="Pre-Seed (Idea & Prototype Design)">Pre-Seed (Idea & Prototype Design)</option>
                  <option value="Seed Validation (Early Pilots & Traction)">Seed Validation (Early Pilots & Traction)</option>
                  <option value="Series A Scaling (Positive Unit Economics)">Series A Scaling (Positive Unit Economics)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono font-medium text-slate-500 uppercase">Strategic Pitch & Tech Moats narrative</label>
                <textarea
                  value={pitch}
                  onChange={(e) => setPitch(e.target.value)}
                  rows={8}
                  className="w-full text-xs text-slate-805 p-3 text-normal border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans leading-relaxed"
                  placeholder="Detail your technology moat, user validations, existing market defects, and strategic metrics target..."
                />
              </div>

              {errorMessage && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                onClick={handleTriggerAnalysis}
                disabled={isLoading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm shadow-blue-500/10"
                id="btn-trigger-due-diligence"
              >
                <Cpu className="w-4 h-4" />
                {isLoading ? "Running Venture Analysis Module..." : "Compute VC Due Diligence Analysis"}
              </button>
            </div>
          </div>

        </div>

        {/* Intelligence Report output screen (7 span cols) */}
        <div className="lg:col-span-7">
          
          {/* Active Generation Screen */}
          {isLoading && (
            <div className="bg-slate-950 text-slate-300 rounded-2xl p-12 border border-slate-800 shadow-xl space-y-6 text-center animate-pulse">
              <div className="w-16 h-16 bg-blue-605/10 text-blue-400 border border-blue-500/40 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <Cpu className="w-8 h-8" />
              </div>
              
              <div className="space-y-2">
                <h3 className="font-display font-semibold text-white text-base">Running Deep Venture Due Diligence Engine</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Computing comprehensive mathematical indicators, swot alignments, competitor benchmarks, and formatting parameters.
                </p>
              </div>

              {/* Steps Progress ticker display */}
              <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl max-w-md mx-auto text-left font-mono text-[10px] space-y-2 text-slate-400">
                <div className="text-blue-400 font-bold uppercase">OPERATION ENGINE STATUS: PROCESSING</div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>Step {loadingStep + 1} of 5: {
                    [
                      "Securing analytical endpoints and initial model parameters...",
                      "Analyzing strategic value proposition and tech moat alignment...",
                      "Computing SWOT vector maps and regulatory bottleneck risks...",
                      "Simulating alternative incumbent products comparison loops...",
                      "Compiling complete VC evaluation scorecards and narrative scores..."
                    ][loadingStep]
                  }</span>
                </div>
              </div>
            </div>
          )}

          {/* Report Display Container */}
          {!isLoading && reportResult && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.99 }} 
              animate={{ opacity: 1, scale: 1 }} 
              className="bg-white rounded-2xl border border-slate-205 shadow-sm overflow-hidden"
              id="due-diligence-report-element"
            >
              
              {/* Report Header */}
              <div className="px-6 py-5 bg-gradient-to-br from-slate-900 to-slate-950 text-white flex justify-between items-start gap-4">
                <div>
                  <span className="text-[10px] font-mono tracking-widest text-indigo-400 uppercase">
                    COMPUTED VENTURE EVALUATION SUMMARY
                  </span>
                  <h2 className="text-xl font-display font-bold mt-1 text-white">
                    {entityName} Due Diligence Report
                  </h2>
                  <div className="flex items-center gap-2 mt-2 font-mono text-[10px] text-slate-400">
                    <span>Valuation Goal: {targetCapital}</span>
                    <span>•</span>
                    <span>Class: {category}</span>
                    <span>•</span>
                    <span>Stage: {stage}</span>
                  </div>
                </div>

                <button 
                  onClick={() => { setReportResult(null); }}
                  className="p-1 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded text-[10px] font-mono flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </button>
              </div>

              {/* REPORT SECTIONS */}
              <div className="divide-y divide-slate-100">
                
                {/* 1. Diagnostic Scorecards Grid */}
                <div className="p-6 space-y-4">
                  <h3 className="font-display font-semibold text-slate-950 text-sm flex items-center gap-1.5 uppercase tracking-wide">
                    <PieChart className="w-4 h-4 text-blue-650" />
                    Startup Diagnostic Health Scorecards
                  </h3>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                      { key: "investorReadinessMoat", label: "Investor Readiness Moat" },
                      { key: "operationalExecutionVelocity", label: "Operational Execution" },
                      { key: "marketTamOpportunity", label: "Market TAM Opportunity" },
                      { key: "productDefensibility", label: "Product Defensibility" },
                      { key: "scalabilityPotential", label: "Scalability Potential" },
                      { key: "founderCredibility", label: "Founder Credibility" }
                    ].map((item) => {
                      const score = reportResult.scores[item.key as keyof typeof reportResult.scores] || 75;
                      let colorClass = "text-blue-600 bg-blue-50 border-blue-200";
                      if (score >= 82) colorClass = "text-emerald-700 bg-emerald-50 border-emerald-200";
                      else if (score < 60) colorClass = "text-amber-700 bg-amber-50 border-amber-200";

                      return (
                        <div key={item.key} className={`p-4 rounded-xl border text-center ${colorClass}`}>
                          <div className="text-[10px] font-mono font-medium text-slate-500 uppercase tracking-tight block">
                            {item.label}
                          </div>
                          <div className="text-2xl font-bold font-mono tracking-tight mt-1">
                            {score}/100
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Executive summary narrative */}
                <div className="p-6 space-y-2">
                  <h3 className="font-display font-semibold text-slate-950 text-sm uppercase tracking-wide">
                    AI Executive Valuation Moat Note
                  </h3>
                  <p className="text-xs text-slate-650 leading-relaxed italic bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                    "{reportResult.executiveSummary}"
                  </p>
                </div>

                {/* 3. SWOT Matrix Block */}
                <div className="p-6 space-y-4">
                  <h3 className="font-display font-semibold text-slate-950 text-sm uppercase tracking-wide">
                    SWOT Analysis matrix
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-150 space-y-2">
                      <span className="font-mono text-[10px] font-bold text-emerald-800 tracking-wider uppercase block">
                        • STRENGTHS
                      </span>
                      <ul className="space-y-1 text-slate-700 list-disc pl-3">
                        {reportResult.swot?.strengths?.map((str, idx) => (
                          <li key={idx}>{str}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200 space-y-2">
                      <span className="font-mono text-[10px] font-bold text-amber-800 tracking-wider uppercase block">
                        • WEAKNESSES
                      </span>
                      <ul className="space-y-1 text-slate-700 list-disc pl-3">
                        {reportResult.swot?.weaknesses?.map((str, idx) => (
                          <li key={idx}>{str}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-200 space-y-2">
                      <span className="font-mono text-[10px] font-bold text-blue-800 tracking-wider uppercase block">
                        • OPPORTUNITIES
                      </span>
                      <ul className="space-y-1 text-slate-700 list-disc pl-3">
                        {reportResult.swot?.opportunities?.map((str, idx) => (
                          <li key={idx}>{str}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-red-50/50 p-4 rounded-xl border border-red-200 space-y-2">
                      <span className="font-mono text-[10px] font-bold text-red-800 tracking-wider uppercase block">
                        • THREATS & ACCENT RISKS
                      </span>
                      <ul className="space-y-1 text-slate-705 list-disc pl-3">
                        {reportResult.swot?.threats?.map((str, idx) => (
                          <li key={idx}>{str}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* 4. Competitor analysis block */}
                <div className="p-6 space-y-4">
                  <h3 className="font-display font-semibold text-slate-955 text-sm uppercase tracking-wide">
                    Competitor Defensibility Evaluation
                  </h3>

                  <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-xs text-slate-700 leading-normal">
                    <div className="flex justify-between items-baseline border-b border-slate-200 pb-2">
                      <span className="font-semibold">Calculated Differentiation Moat Score:</span>
                      <span className="font-mono font-bold text-blue-600 text-sm">
                        {reportResult.competitors?.differentiationScore || 75}/100
                      </span>
                    </div>

                    <div className="space-y-2 pt-1.5">
                      <div>
                        <strong className="block text-[10px] text-slate-400 uppercase tracking-tight font-mono">Market Positioning Statement:</strong>
                        <p className="mt-0.5 leading-relaxed">{reportResult.competitors?.positioning}</p>
                      </div>
                      <div>
                        <strong className="block text-[10px] text-slate-400 uppercase tracking-tight font-mono">IP Defensibility:</strong>
                        <p className="mt-0.5 leading-relaxed">{reportResult.competitors?.defensibility}</p>
                      </div>
                      <div>
                        <strong className="block text-[10px] text-slate-400 uppercase tracking-tight font-mono">Competitor Landscape Comparison:</strong>
                        <p className="mt-0.5 leading-relaxed">{reportResult.competitors?.moatComparison}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5. Strategic consulting action roadmap & Venture Choking Points */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  <div className="space-y-3">
                    <h4 className="font-display font-semibold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1">
                      <Compass className="w-4 h-4 text-blue-600" />
                      Strategic Innovation Action Plan
                    </h4>
                    <ul className="space-y-2 text-xs text-slate-600">
                      {reportResult.strategicActionPlan?.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-display font-semibold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1">
                      <BadgeAlert className="w-4 h-4 text-rose-500" />
                      Venture Choking Bottlenecks Detect
                    </h4>
                    <ul className="space-y-2 text-xs text-slate-600">
                      {reportResult.chokingPoints?.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 bg-rose-50/50 p-2 rounded-lg border border-rose-100">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* 6. Pitch deck metric metrics scorecard */}
                {reportResult.narrativeScoring && (
                  <div className="p-6 space-y-4">
                    <h3 className="font-display font-semibold text-slate-950 text-sm uppercase tracking-wide">
                      Narrative & Valuation Pitch Benchmarks
                    </h3>

                    <div className="space-y-3">
                      {[
                        { label: "Narrative Clarity Moat", score: reportResult.narrativeScoring.narrativeClarity },
                        { label: "Financial Viability Model", score: reportResult.narrativeScoring.financialModel },
                        { label: "Traction Hook Resonance", score: reportResult.narrativeScoring.storyHook },
                        { label: "Competitive Market Positioning", score: reportResult.narrativeScoring.marketPositioning },
                        { label: "Defensive Pitch Conviction", score: reportResult.narrativeScoring.pitchStrength }
                      ].map((item, idx) => (
                        <div key={idx} className="space-y-1 text-xs">
                          <div className="flex justify-between text-[11px] font-medium text-slate-700">
                            <span>{item.label}</span>
                            <span className="font-mono text-blue-600 font-bold">{item.score}/100</span>
                          </div>
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className="bg-blue-600 h-full rounded-full" style={{ width: `${item.score}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 7. Key Improvements Suggestions */}
                <div className="p-6 bg-slate-50/60 space-y-3">
                  <h4 className="font-display font-semibold text-slate-900 text-xs uppercase tracking-wider">
                    Target Coach recommendations For Raising Capital
                  </h4>
                  <ul className="space-y-2">
                    {reportResult.keyImprovementSuggestions?.map((item, idx) => (
                      <li key={idx} className="text-xs text-slate-650 flex items-start gap-2 bg-white p-2.5 rounded-lg border border-slate-150">
                        <Sparkles className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>
            </motion.div>
          )}

          {/* Fallback Idle state */}
          {!isLoading && !reportResult && (
            <div className="bg-slate-50 border border-slate-205 border-dashed rounded-2xl p-16 text-center text-slate-400 space-y-4">
              <Cpu className="w-16 h-16 text-slate-300 mx-auto" />
              <h3 className="font-display font-medium text-slate-800 text-base">Analytical Report Engine Idle</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                Provide startup configurations and pitch arguments inside the left operating profile manually, or select a compiled worksheet from the workspace node, then click Compute.
              </p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
