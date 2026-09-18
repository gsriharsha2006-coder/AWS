import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  Award, 
  Search, 
  MapPin, 
  Calendar, 
  Zap, 
  CheckCircle, 
  ArrowRight,
  TrendingUp, 
  Filter, 
  Bookmark, 
  BookmarkCheck, 
  Clock, 
  Code, 
  DollarSign, 
  UserCheck, 
  AlertCircle,
  ExternalLink,
  ChevronLeft,
  X,
  Send
} from "lucide-react";
import { Opportunity, Idea, OpportunityType } from "../types";

interface OpportunitiesViewProps {
  opportunities: Opportunity[];
  ideas: Idea[];
  onUpdateOpportunity: (updatedOpp: Opportunity) => void;
  onNavigateToVault: () => void;
}

const CATEGORIES: { label: string; value: OpportunityType | "all" }[] = [
  { label: "All Opportunities", value: "all" },
  { label: "Startup Challenges", value: "challenge" },
  { label: "Accelerators", value: "accelerator" },
  { label: "Grants & Non-dilutive Capital", value: "grant" },
  { label: "Hackathons", value: "hackathon" }
];

export default function OpportunitiesView({
  opportunities,
  ideas,
  onUpdateOpportunity,
  onNavigateToVault
}: OpportunitiesViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<OpportunityType | "all">("all");
  const [selectedOppId, setSelectedOppId] = useState<string | null>(null);
  
  // State for application submission popup
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [submitOpp, setSubmitOpp] = useState<Opportunity | null>(null);
  const [selectedIdeaIdForSubmit, setSelectedIdeaIdForSubmit] = useState("");
  const [submitSucessNotice, setSubmitSuccessNotice] = useState(false);

  // State for saved opportunities bookmarks
  const [bookmarkedOppIds, setBookmarkedOppIds] = useState<string[]>([]);

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (bookmarkedOppIds.includes(id)) {
      setBookmarkedOppIds(bookmarkedOppIds.filter(b => b !== id));
    } else {
      setBookmarkedOppIds([...bookmarkedOppIds, id]);
    }
  };

  const openSubmitWorkflow = (opp: Opportunity, e: React.MouseEvent) => {
    e.stopPropagation();
    setSubmitOpp(opp);
    if (ideas.length > 0) {
      setSelectedIdeaIdForSubmit(ideas[0].id);
    }
    setIsSubmitModalOpen(true);
  };

  const handleApplicationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submitOpp || !selectedIdeaIdForSubmit) return;

    // Add idea ID to current opportunity's submitted idea pool
    const updatedOpp: Opportunity = {
      ...submitOpp,
      appliedIdeas: [...(submitOpp.appliedIdeas || []), selectedIdeaIdForSubmit]
    };
    onUpdateOpportunity(updatedOpp);
    
    setSubmitSuccessNotice(true);
    setTimeout(() => {
      setSubmitSuccessNotice(false);
      setIsSubmitModalOpen(false);
      setSubmitOpp(null);
    }, 2500);
  };

  // Filter strategy
  const filteredOpps = opportunities.filter((opp) => {
    const matchesSearch = 
      opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.host.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.focusAreas.some(f => f.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (selectedType === "all") return true;
    return opp.type === selectedType;
  });

  const activeOpp = opportunities.find(o => o.id === selectedOppId);

  return (
    <div className="space-y-6">
      
      {/* Search and Category filters segment */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-3 w-4.5 h-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search programs by name, criteria, or stack parameters..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm text-slate-800 rounded-xl border border-slate-205 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50"
            id="opp-search-field"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto select-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedType(cat.value)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
                selectedType === cat.value
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Double split: Catalog vs Program Details Page */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left pane: Opportunity list (6 columns if active detail exists, else 12) */}
        <div className={`space-y-4 ${selectedOppId ? "lg:col-span-6" : "lg:col-span-12"}`}>
          <div className="text-sm font-semibold text-slate-900 px-1">
            Ecosystem Portals Available ({filteredOpps.length})
          </div>

          <div className="space-y-4">
            {filteredOpps.map((opp) => {
              const isSaved = bookmarkedOppIds.includes(opp.id);
              const isApplied = opp.appliedIdeas && opp.appliedIdeas.length > 0;
              const isSelected = opp.id === selectedOppId;

              return (
                <div
                  key={opp.id}
                  onClick={() => setSelectedOppId(opp.id === selectedOppId ? null : opp.id)}
                  className={`bg-white rounded-xl border p-5 flex flex-col justify-between gap-4 transition-all cursor-pointer hover:border-slate-350 duration-300 ${
                    isSelected ? "border-blue-500 ring-1 ring-blue-500" : "border-slate-200"
                  }`}
                  id={`opp-card-${opp.id}`}
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="px-2.5 py-0.5 text-[9px] uppercase font-mono font-bold tracking-wider bg-blue-50 text-blue-700 rounded border border-blue-105">
                          {opp.type.replace("_", " ")}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">by {opp.host}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => toggleBookmark(opp.id, e)}
                          className={`p-1.5 rounded hover:bg-slate-100 cursor-pointer ${
                            isSaved ? "text-blue-600" : "text-slate-400"
                          }`}
                        >
                          {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <h3 className="font-display font-semibold text-slate-950 text-base group-hover:text-blue-600 leading-snug">
                      {opp.title}
                    </h3>
                    
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                      {opp.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {opp.focusAreas.map(f => (
                        <span key={f} className="text-[10px] bg-slate-100 text-slate-650 px-2.5 py-0.5 rounded-full">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs bg-slate-50/50 -mx-5 -mb-5 px-5 py-3 rounded-b-xl mt-2">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-[11px] font-mono font-medium text-slate-600">
                        Deadline: {opp.deadline}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isApplied && (
                        <span className="px-2 py-1 text-[10px] bg-emerald-50 text-emerald-700 font-mono font-bold rounded flex items-center gap-1 border border-emerald-110">
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          Applied
                        </span>
                      )}

                      <button
                        onClick={(e) => openSubmitWorkflow(opp, e)}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                        id={`btn-apply-portal-${opp.id}`}
                      >
                        Submit Workbook
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}

            {filteredOpps.length === 0 && (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
                <Award className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="font-display font-medium text-slate-900 mt-2">No portal found</h3>
                <p className="text-xs text-slate-500 mt-1">Try another category, search key, or reset parameters.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right pane: Selected Program Overview (Details Page) */}
        {selectedOppId && activeOpp && (
          <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-205 shadow-sm overflow-hidden sticky top-6">
            
            {/* Control Header */}
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/80 flex justify-between items-center">
              <span className="text-xs font-mono font-semibold text-slate-500 uppercase tracking-widest">
                Detail Scope Overview
              </span>
              <button 
                onClick={() => setSelectedOppId(null)}
                className="p-1 hover:bg-slate-250 rounded text-slate-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Banner image representation */}
            <div className="h-44 relative bg-slate-900">
              <img 
                src={activeOpp.bannerImage} 
                alt={activeOpp.title} 
                className="w-full h-full object-cover opacity-85"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent/10" />
              <div className="absolute bottom-4 left-4 text-white">
                <span className="px-2.5 py-0.5 text-[9px] uppercase font-mono font-bold tracking-wider bg-blue-600 rounded">
                  {activeOpp.type.replace("_", " ")}
                </span>
                <h2 className="text-lg font-display font-bold text-white mt-1 leading-snug">{activeOpp.title}</h2>
              </div>
            </div>

            <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
              
              {/* Host and Deadline Metadata */}
              <div className="grid grid-cols-2 gap-4 border-b border-slate-100 pb-4 font-mono text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Program Convener</span>
                  <span className="font-semibold text-slate-800">{activeOpp.host}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Submission Target</span>
                  <span className="font-semibold text-rose-600 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {activeOpp.deadline}
                  </span>
                </div>
              </div>

              {/* Section: About the Program */}
              <div className="space-y-2">
                <h3 className="font-display font-semibold text-slate-900 text-sm flex items-center gap-1.5 border-b border-slate-100 pb-1">
                  About the Program
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {activeOpp.details}
                </p>
              </div>

              {/* Focus Areas Bento Grid */}
              <div className="space-y-2">
                <h3 className="font-display font-semibold text-slate-900 text-sm border-b border-slate-100 pb-1">
                  Focus Sectors
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {activeOpp.focusAreas.map(f => (
                    <span key={f} className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-xl font-medium border border-blue-105">
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              {/* Section: Benefits & Rewards */}
              <div className="space-y-2.5">
                <h3 className="font-display font-semibold text-slate-900 text-sm flex items-center gap-1 border-b border-slate-100 pb-1">
                  <DollarSign className="w-4 h-4 text-emerald-500" />
                  Ecosystem Grant & Support Benefits
                </h3>
                <ul className="space-y-2">
                  {activeOpp.benefits.map((b, i) => (
                    <li key={i} className="text-xs text-slate-650 flex items-start gap-2 leading-relaxed">
                      <span className="text-emerald-500 text-base leading-none mt-0.5">•</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Section: Eligibility Criteria */}
              <div className="space-y-2.5">
                <h3 className="font-display font-semibold text-slate-900 text-sm flex items-center gap-1 border-b border-slate-100 pb-1">
                  <UserCheck className="w-4 h-4 text-slate-700" />
                  Squad & Startup Entry Rules
                </h3>
                <ul className="space-y-2">
                  {activeOpp.eligibility.map((b, i) => (
                    <li key={i} className="text-xs text-slate-650 flex items-start gap-2 leading-relaxed">
                      <span className="text-blue-500 text-base leading-none mt-0.5">•</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Interactive Submit Section */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block tracking-wider uppercase font-mono">Completed Workspace Docs</span>
                  <span className="text-xs font-semibold text-slate-700">
                    {activeOpp.appliedIdeas && activeOpp.appliedIdeas.length > 0 
                      ? `${activeOpp.appliedIdeas.length} application drafts submitted` 
                      : "Ready for drafting"
                    }
                  </span>
                </div>

                <button
                  onClick={(e) => openSubmitWorkflow(activeOpp, e)}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  Apply with Active Idea
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* WORKBOOK SELECTOR & APPLICATION SUBMISSION MODAL */}
      {isSubmitModalOpen && submitOpp && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="bg-white rounded-2xl p-6 border border-slate-200 max-w-lg w-full shadow-2xl space-y-5"
          >
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-display font-semibold text-slate-900 text-base">Submit Workbook Bundle</h3>
                <p className="text-xs text-slate-500">Program: {submitOpp.title}</p>
              </div>
              <button 
                onClick={() => setIsSubmitModalOpen(false)}
                className="p-1.5 hover:bg-slate-100 rounded text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {submitSucessNotice ? (
              <div className="text-center py-8 space-y-3">
                <div className="mx-auto w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h4 className="font-display font-bold text-slate-900 text-base">Application Submitted Successfully!</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Your structured workspace workbook was packaged and successfully transmitted to the {submitOpp.host} program portal.
                </p>
              </div>
            ) : (
              <form onSubmit={handleApplicationSubmit} className="space-y-4">
                
                {ideas.length === 0 ? (
                  <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 text-center space-y-3">
                    <AlertCircle className="w-6 h-6 text-amber-600 mx-auto" />
                    <h4 className="text-xs font-semibold text-amber-900 uppercase">Workbook Deficiency Detected</h4>
                    <p className="text-xs text-amber-700 leading-normal">
                      The Idea Vault is empty. You must create and structure at least one pitch workbook draft sheet first to be eligible for portals submission.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setIsSubmitModalOpen(false);
                        onNavigateToVault();
                      }}
                      className="px-4 py-1.5 bg-amber-600 text-white rounded text-[11px] font-semibold cursor-pointer"
                    >
                      Enter Idea Vault
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-mono font-medium text-slate-500 uppercase">Select completed Workspace Workbook</label>
                      <select
                        value={selectedIdeaIdForSubmit}
                        onChange={(e) => setSelectedIdeaIdForSubmit(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                      >
                        {ideas.map((idea) => (
                          <option key={idea.id} value={idea.id}>
                            {idea.name} ({idea.templateId})
                          </option>
                        ))}
                      </select>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Exporting the workbook packages track, personas, the core hack, squad profile, and technical specifications into the portal database.
                      </p>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-150 space-y-1 text-slate-600">
                      <div className="text-[10px] font-mono font-bold uppercase text-slate-400">APPLICATION PACKAGING CHECKMARKS</div>
                      <div className="text-xs flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                        Structured Pitch Workbook XML format
                      </div>
                      <div className="text-xs flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                        Diagnostic self-assessment validation
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <button 
                    type="button"
                    onClick={() => setIsSubmitModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 text-xs rounded-xl hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  
                  {ideas.length > 0 && (
                    <button 
                      type="submit"
                      className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1 cursor-pointer"
                    >
                      <Send className="w-3 h-3" />
                      Transmit Application
                    </button>
                  )}
                </div>
              </form>
            )}

          </motion.div>
        </div>
      )}

    </div>
  );
}
