import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  TrendingUp, 
  Clock, 
  Cpu, 
  Briefcase, 
  BookOpen, 
  Award, 
  Tv, 
  CheckCircle, 
  ArrowRight,
  TrendingDown,
  Globe,
  Bell,
  Search,
  ExternalLink
} from "lucide-react";
import { Blog, Opportunity } from "../types";

interface DashboardViewProps {
  blogs: Blog[];
  opportunities: Opportunity[];
  onNavigate: (tab: string) => void;
  onSelectBlog: (blog: Blog) => void;
  onSelectOpportunity: (opportunity: Opportunity) => void;
  ideasCount: number;
}

export default function DashboardView({
  blogs,
  opportunities,
  onNavigate,
  onSelectBlog,
  onSelectOpportunity,
  ideasCount
}: DashboardViewProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // Market indices structure representation ("Bloomberg Meets Venture")
  const marketIndices = [
    { label: "SaaS Multiples Index", value: "7.4x", change: "+0.3x", positive: true, detail: "Pre-seed sector baseline" },
    { label: "AI Dev Capital Ingress", value: "$4.12B", change: "+14.8%", positive: true, detail: "Trailing 30-day aggregate" },
    { label: "B2B Hardware Seed CAP-X", value: "3.2x", change: "-0.4x", positive: false, detail: "Infrastructural multiple" },
    { label: "Ecosystem Liquid Speed", value: "84.2", change: "+2.1pt", positive: true, detail: "Valuation momentum velocity" }
  ];

  // Simulated VC live tracking signals
  const vcTelemetry = [
    { id: "signal-1", time: "05 mins ago", platform: "Apex Ventures", action: "allocated $1.8M", sector: "Sovereign AI Agents", size: "Pre-Seed" },
    { id: "signal-2", time: "18 mins ago", platform: "Soma Capital", action: "filed Term Sheet", sector: "Distributed Ledger FinTech", size: "Seed" },
    { id: "signal-3", time: "42 mins ago", platform: "Y-Combinator", action: "accepted 14 squads", sector: "Developer Tools & Rust Core", size: "W26" },
    { id: "signal-4", time: "1 hr ago", platform: "Sequoia Spark", action: "funded $250K", sector: "Edge Micro-SaaS", size: "Catalyst" }
  ];

  // News Flash ticker
  const newsTicker = [
    { source: "TechCrunch", headline: "Enterprise buyers reject API wrappers, shifting towards private compute.", date: "Today" },
    { source: "VentureBeat", headline: "Sovereign AI models outperform monolithic architectures in legal and finance sectors.", date: "Yesterday" },
    { source: "MIT Sandbox", headline: "Student hackathon registrations increase by 40% nationwide, prioritizing SaaS automation.", date: "3 days ago" }
  ];

  // Filter items based on dashboard search
  const filteredBlogs = blogs.filter(b => 
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.category.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 2);

  const filteredOpps = opportunities.filter(o => 
    o.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    o.focusAreas.some(f => f.toLowerCase().includes(searchTerm.toLowerCase()))
  ).slice(0, 2);

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* 2026 Telemetry Header Widget bar */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-blue-900 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-blue-400 font-mono text-xs tracking-widest uppercase mb-1">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              SYSTEM OVERVIEW // LIVE NODE CONNECTED
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-medium tracking-tight">
              Venture <span className="text-blue-400">Connect</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-xl">
              Futuristic workspace engine aggregating startup intelligence, modular drafting notebooks, active student grants, and AI-led Due Diligence.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 font-mono text-xs">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              UTC: 2026-05-31 06:45
            </div>
            <span className="text-slate-600">|</span>
            <div className="text-blue-400 font-semibold uppercase">SYS: DEPLOYED</div>
          </div>
        </div>

        {/* Global Startup Indices Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800">
          {marketIndices.map((indicator, idx) => (
            <div key={idx} className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/80">
              <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">{indicator.label}</div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl md:text-2xl font-display font-semibold tracking-tight">{indicator.value}</span>
                <span className={`text-xs font-mono flex items-center ${indicator.positive ? "text-emerald-400" : "text-rose-400"}`}>
                  {indicator.positive ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                  {indicator.change}
                </span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">{indicator.detail}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Venture Telemetry Feed & Featured Ideations (8 spans) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* SEC 1: VC Due Diligence & Interactive Idea Launcher Action */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-blue-300 transition-all">
              <div>
                <div className="bg-blue-50 text-blue-600 p-2.5 rounded-lg w-fit mb-4">
                  <Cpu className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-display font-medium text-slate-900">Idea Vault Workbook</h3>
                <p className="text-sm text-slate-500 mt-2">
                  Draft, format, and track complete investor-ready document files using 4 structured enterprise workspaces designed for early-stage validation.
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <span className="px-2.5 py-1 text-xs bg-slate-100 text-slate-700 rounded-full font-mono font-medium">
                    {ideasCount} active workspace {ideasCount === 1 ? "idea" : "ideas"}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => onNavigate("ideas")}
                className="mt-6 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-all cursor-pointer"
              >
                Enter Idea Vault
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-2xl p-6 border border-slate-800 shadow-sm flex flex-col justify-between hover:border-indigo-500/80 transition-all">
              <div>
                <div className="bg-indigo-500/10 text-indigo-400 p-2.5 rounded-lg w-fit mb-4 border border-indigo-500/30">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-display font-medium text-white">AI Coach Intelligence</h3>
                <p className="text-sm text-slate-400 mt-2">
                  Inject workbook structures straight into our diagnostic compiler to compute customized, institutional VC feedback plans, moats, and SWOT reports.
                </p>
              </div>
              <button 
                onClick={() => onNavigate("coach")}
                className="mt-6 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-all cursor-pointer"
              >
                Access VC Due Diligence
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* SEC 2: Trending Articles Snapshot */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-display font-medium text-slate-900 flex items-center gap-2">
                <BookOpen className="text-blue-600 w-5 h-5" />
                Founder Knowledge Network
              </h2>
              <button 
                onClick={() => onNavigate("blogs")}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
              >
                Browse All Articles ({blogs.length})
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredBlogs.map((blog) => (
                <div 
                  key={blog.id} 
                  className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col hover:border-slate-300 hover:shadow-md transition-all group"
                >
                  <div className="h-40 overflow-hidden relative">
                    <img 
                      src={blog.coverImage} 
                      alt={blog.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute top-3 right-3 px-2 py-1 text-[10px] bg-slate-900/80 text-white font-mono rounded backdrop-blur">
                      {blog.category}
                    </span>
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 
                        onClick={() => onSelectBlog(blog)}
                        className="font-display font-medium text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 cursor-pointer text-base"
                      >
                        {blog.title}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-3 mt-2">
                        {blog.content.replace(/#+\s/g, "").substring(0, 140)}...
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <img 
                          src={blog.authorAvatar} 
                          alt={blog.authorName} 
                          className="w-6 h-6 rounded-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <span className="text-[11px] font-medium text-slate-700">{blog.authorName}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{blog.readingTime} min read</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SEC 3: Live Ecosystem Opportunities */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-display font-medium text-slate-900 flex items-center gap-2">
                <Award className="text-blue-600 w-5 h-5" />
                Featured Programs & Grants
              </h2>
              <button 
                onClick={() => onNavigate("opportunities")}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
              >
                Browse All Programs ({opportunities.length})
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-4">
              {filteredOpps.map((opp) => (
                <div 
                  key={opp.id} 
                  className="bg-white rounded-xl p-5 border border-slate-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-slate-300 transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 text-[10px] uppercase font-mono font-bold tracking-wider bg-blue-50 text-blue-700 rounded border border-blue-150">
                        {opp.type.replace("_", " ")}
                      </span>
                      <span className="text-xs text-slate-500">by {opp.host}</span>
                    </div>
                    <h4 className="font-display font-semibold text-slate-900 text-base">{opp.title}</h4>
                    <p className="text-xs text-slate-500 line-clamp-1 max-w-2xl">{opp.description}</p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {opp.focusAreas.slice(0, 3).map((f) => (
                        <span key={f} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                    <div className="text-right">
                      <div className="text-[10px] text-slate-400 font-mono">DEADLINE</div>
                      <div className="text-xs font-semibold font-mono text-slate-700">{opp.deadline}</div>
                    </div>
                    <button 
                      onClick={() => onSelectOpportunity(opp)}
                      className="px-4 py-2 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all cursor-pointer"
                    >
                      View Program
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Terminal Analytics Feed (4 spans) */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* SEC 1: Bloomberg Style Live VC Telemetry Tracker */}
          <div className="bg-slate-950 text-slate-200 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-mono font-medium tracking-wider text-blue-400 flex items-center gap-1.5 uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live VC Capital Actions
              </span>
              <span className="text-[10px] bg-slate-850 text-slate-400 px-2 py-0.5 rounded font-mono">FEED // SEC_1</span>
            </div>

            <div className="space-y-4">
              {vcTelemetry.map((item) => (
                <div key={item.id} className="text-xs space-y-1 hover:bg-slate-900/50 p-2 rounded transition-all">
                  <div className="flex justify-between font-mono text-[10px] text-slate-500">
                    <span>{item.platform}</span>
                    <span>{item.time}</span>
                  </div>
                  <div className="font-medium text-slate-300">
                    {item.action} into <span className="text-blue-400">{item.sector}</span>
                  </div>
                  <div className="font-mono text-[9px] bg-slate-900 text-slate-400 w-fit px-1.5 py-0.5 rounded uppercase border border-slate-800">
                    Stage: {item.size}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-between font-mono text-[10px] text-slate-500">
              <span>Total Capital Tracked (24h)</span>
              <span className="text-emerald-400 font-semibold">$314.5M</span>
            </div>
          </div>

          {/* SEC 2: News Flash Feed widget */}
          <div className="bg-white rounded-2xl p-6 border border-slate-250 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-semibold text-slate-900 flex items-center gap-1.5 uppercase tracking-wide">
                <Globe className="w-4 h-4 text-blue-600" />
                Innovation Flash
              </span>
              <span className="text-[10px] text-slate-400 font-mono">MIT SANDBOX FEED</span>
            </div>

            <div className="space-y-4">
              {newsTicker.map((news, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-blue-600 tracking-wider uppercase">
                      {news.source}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">• {news.date}</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-snug">{news.headline}</p>
                </div>
              ))}
            </div>
          </div>

          {/* SEC 3: Ecosystem Quick Links for Student Builders */}
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl p-6 shadow-md shadow-blue-500/10 space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            <h4 className="font-display font-semibold text-lg text-white">Student Sandbox Hub</h4>
            <p className="text-xs text-blue-100 leading-relaxed">
              Venture Connect aggregates student-friendly grants, tech challenges, and incubators. Use the **Idea Vault** workspace templates to pitch with analytical competence.
            </p>
            <div className="pt-2">
              <button 
                onClick={() => onNavigate("ideas")}
                className="w-full bg-white text-blue-700 hover:bg-slate-50 font-medium py-2 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                Structure a Sandbox Idea
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
