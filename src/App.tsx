import React, { useState, useEffect } from "react";
import { 
  Briefcase, 
  BookOpen, 
  Cpu, 
  Layers, 
  TrendingUp, 
  Home, 
  ExternalLink, 
  Sparkles,
  Users,
  ChevronRight,
  Radio,
  Clock,
  User,
  Heart
} from "lucide-react";

import { Blog, Idea, Opportunity, VCDueDiligenceReport } from "./types";
import { INITIAL_BLOGS, INITIAL_OPPORTUNITIES, IDEA_TEMPLATES } from "./data";

// Import custom view modules
import DashboardView from "./components/DashboardView";
import BlogsView from "./components/BlogsView";
import IdeaVaultView from "./components/IdeaVaultView";
import OpportunitiesView from "./components/OpportunitiesView";
import AICoachView from "./components/AICoachView";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  // State initialization with localStorage fallback validation
  const [blogs, setBlogs] = useState<Blog[]>(() => {
    const cached = localStorage.getItem("vc_blogs");
    return cached ? JSON.parse(cached) : INITIAL_BLOGS;
  });

  const [ideas, setIdeas] = useState<Idea[]>(() => {
    const cached = localStorage.getItem("vc_ideas");
    return cached ? JSON.parse(cached) : [];
  });

  const [opportunities, setOpportunities] = useState<Opportunity[]>(() => {
    const cached = localStorage.getItem("vc_opportunities");
    return cached ? JSON.parse(cached) : INITIAL_OPPORTUNITIES;
  });

  // Keep synced across turns
  useEffect(() => {
    localStorage.setItem("vc_blogs", JSON.stringify(blogs));
  }, [blogs]);

  useEffect(() => {
    localStorage.setItem("vc_ideas", JSON.stringify(ideas));
  }, [ideas]);

  useEffect(() => {
    localStorage.setItem("vc_opportunities", JSON.stringify(opportunities));
  }, [opportunities]);

  // Global actions for knowledge network
  const handleAddBlog = (newBlog: Blog) => {
    setBlogs([newBlog, ...blogs]);
  };

  const handleUpdateBlog = (updatedBlog: Blog) => {
    setBlogs(blogs.map(b => b.id === updatedBlog.id ? updatedBlog : b));
  };

  const handleDeleteBlog = (id: string) => {
    setBlogs(blogs.filter(b => b.id !== id));
  };

  // Global actions for Idea Vault worksheets
  const handleAddIdea = (newIdea: Idea) => {
    setIdeas([newIdea, ...ideas]);
  };

  const handleUpdateIdea = (updatedIdea: Idea) => {
    setIdeas(ideas.map(i => i.id === updatedIdea.id ? updatedIdea : i));
  };

  const handleDeleteIdea = (id: string) => {
    setIdeas(ideas.filter(i => i.id !== id));
  };

  // Helper selectors to guide seamless workspace mapping flows
  const [selectedIdeaForCoach, setSelectedIdeaForCoach] = useState<Idea | null>(null);

  const handleNavigateToCoach = (idea: Idea) => {
    setSelectedIdeaForCoach(idea);
    setActiveTab("coach");
  };

  const handleNavigateToOpportunities = (idea: Idea) => {
    setActiveTab("opportunities");
  };

  // Active details card preview overrides from dashboard click-throughs
  const [dashboardSelectedBlog, setDashboardSelectedBlog] = useState<Blog | null>(null);
  const [dashboardSelectedOpp, setDashboardSelectedOpp] = useState<Opportunity | null>(null);

  const handleSelectBlogFromDashboard = (blog: Blog) => {
    setDashboardSelectedBlog(blog);
    setActiveTab("blogs");
  };

  const handleSelectOppFromDashboard = (opp: Opportunity) => {
    setDashboardSelectedOpp(opp);
    setActiveTab("opportunities");
  };

  // Server Endpoint call linking the React client to server-side Gemini 3.5 Duet
  const handleTriggerAnalyze = async (payload: {
    entityName: string;
    targetCapital: string;
    category: string;
    stage: string;
    pitch: string;
    ideaContext?: any;
  }) => {
    const response = await fetch("/api/gemini/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      throw new Error(errBody.error || "Metropolitan AI node processing failed.");
    }

    return await response.json();
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col justify-between">
      
      {/* Premium Header Rail */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/90 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo Brand Frame */}
          <div 
            onClick={() => { setActiveTab("dashboard"); }}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform duration-300">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <span className="font-display font-medium text-slate-900 tracking-tight text-lg group-hover:text-blue-600 transition-colors">
                Venture <span className="text-blue-600 font-bold">Connect</span>
              </span>
              <div className="text-[9px] font-mono tracking-widest text-slate-400 leading-none">
                STARTUP INTEL WORKSPACE
              </div>
            </div>
          </div>

          {/* Desktop Navigation Link Toggles */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
            {[
              { id: "dashboard", label: "Dashboard", icon: Home },
              { id: "blogs", label: "Knowledge Hub", icon: BookOpen },
              { id: "ideas", label: "Idea Vault", icon: Layers },
              { id: "opportunities", label: "Opportunities", icon: Briefcase },
              { id: "coach", label: "AI Coach", icon: Cpu }
            ].map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    // Clear overrides upon explicit nav toggling
                    if (tab.id !== "blogs") setDashboardSelectedBlog(null);
                    if (tab.id !== "opportunities") setDashboardSelectedOpp(null);
                  }}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                    isActive
                      ? "bg-white text-blue-600 shadow-sm border border-slate-150/50"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50/55"
                  }`}
                  id={`nav-link-${tab.id}`}
                >
                  <TabIcon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Connected Identity user node badges */}
          <div className="flex items-center gap-3">
            <div className="bg-slate-50 border border-slate-200 p-1.5 rounded-xl flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs">
                U
              </div>
              <div className="hidden sm:block text-left text-xs">
                <div className="font-semibold text-slate-700 leading-none">Admin Node</div>
                <span className="text-[10px] text-slate-400 font-mono">gsriharsha2006</span>
              </div>
            </div>
          </div>

        </div>
      </header>

      {/* Main Core View Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {activeTab === "dashboard" && (
          <DashboardView
            blogs={blogs}
            opportunities={opportunities}
            onNavigate={(tab) => {
              setActiveTab(tab);
            }}
            onSelectBlog={handleSelectBlogFromDashboard}
            onSelectOpportunity={handleSelectOppFromDashboard}
            ideasCount={ideas.length}
          />
        )}

        {activeTab === "blogs" && (
          <BlogsView
            blogs={blogs}
            onAddBlog={handleAddBlog}
            onUpdateBlog={handleUpdateBlog}
            onDeleteBlog={handleDeleteBlog}
            currentUserEmail="g.sriharsha2006@gmail.com"
          />
        )}

        {activeTab === "ideas" && (
          <IdeaVaultView
            ideas={ideas}
            templates={IDEA_TEMPLATES}
            onAddIdea={handleAddIdea}
            onUpdateIdea={handleUpdateIdea}
            onDeleteIdea={handleDeleteIdea}
            onNavigateToCoach={handleNavigateToCoach}
            onNavigateToOpportunities={handleNavigateToOpportunities}
          />
        )}

        {activeTab === "opportunities" && (
          <OpportunitiesView
            opportunities={opportunities}
            ideas={ideas}
            onUpdateOpportunity={(updatedOpp) => {
              setOpportunities(opportunities.map(o => o.id === updatedOpp.id ? updatedOpp : o));
            }}
            onNavigateToVault={() => setActiveTab("ideas")}
          />
        )}

        {activeTab === "coach" && (
          <AICoachView
            ideas={ideas}
            onTriggerAnalyze={handleTriggerAnalyze}
          />
        )}
      </main>

      {/* Mobile persistent bottom dock bars */}
      <div className="md:hidden sticky bottom-0 z-40 bg-white border-t border-slate-200 px-4 py-2 flex items-center justify-around select-none">
        {[
          { id: "dashboard", label: "Dashboard", icon: Home },
          { id: "blogs", label: "Hub", icon: BookOpen },
          { id: "ideas", label: "Vault", icon: Layers },
          { id: "opportunities", label: "Opps", icon: Briefcase },
          { id: "coach", label: "Coach", icon: Cpu }
        ].map((tab) => {
          const TabIcon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id !== "blogs") setDashboardSelectedBlog(null);
                if (tab.id !== "opportunities") setDashboardSelectedOpp(null);
              }}
              className={`flex flex-col items-center justify-center text-[10px] py-1 cursor-pointer font-medium ${
                isActive ? "text-blue-600" : "text-slate-500"
              }`}
            >
              <TabIcon className="w-4.5 h-4.5 mb-0.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Modern Workspace footer info panel */}
      <footer className="bg-white border-t border-slate-200 py-8 text-xs text-slate-500 mt-12 bg-gradient-to-b from-transparent to-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-slate-400">
            <Radio className="w-3.5 h-3.5 text-blue-500 animate-pulse shrink-0" />
            <span className="font-mono">SYS NODE CONNECTED: UTC 2026-05-31 06:48</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 justify-center md:justify-end text-slate-400 font-mono text-[10.5px]">
            <span>Venture Connect Operational Platform • Multiplier V1.0</span>
            <span>|</span>
            <span>Made with Google AI Studio</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
