import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Zap, 
  FileCode2, 
  Database, 
  BarChart3, 
  FileSpreadsheet, 
  Layers, 
  Cpu, 
  ShieldCheck, 
  RefreshCw 
} from 'lucide-react';

const TABLEAU_URL = import.meta.env.VITE_TABLEAU_MIGRATOR_URL || 'http://localhost:5173';

const PIPELINE_STEPS = [
  {
    title: "1. Schema Ingestion",
    desc: "Extracts Tableau XML workbook layouts or ThoughtSpot YAML TML specifications."
  },
  {
    title: "2. AST Dependency Mapping",
    desc: "Builds a complete semantic graph of worksheets, visualizations, tables, and relationships."
  },
  {
    title: "3. DAX Transpilation",
    desc: "Translates legacy calculation expressions into validated, equivalent Power BI DAX measures."
  },
  {
    title: "4. PBIP Serialization",
    desc: "Outputs a complete Power BI Project (PBIP) folder structure with native TMDL models."
  }
];

const CAPABILITIES = [
  {
    icon: Cpu,
    title: "AST-Based Parser",
    desc: "Deconstructs legacy visual and formula metadata into a structured intermediate model.",
    color: "text-blue-600",
    bg: "bg-blue-50"
  },
  {
    icon: RefreshCw,
    title: "DAX Compilation Engine",
    desc: "Translates complex functions, LOD expressions, and conditional aggregations into logic-preserving DAX.",
    color: "text-amber-600",
    bg: "bg-amber-50"
  },
  {
    icon: Layers,
    title: "TMDL Schema Weaver",
    desc: "Generates native Power BI tables, columns, partition scripts, and correct cardinality relationships.",
    color: "text-purple-600",
    bg: "bg-purple-50"
  },
  {
    icon: ShieldCheck,
    title: "Fidelity Auditing",
    desc: "Produces a detailed multi-sheet Excel report detailing parsing statistics and manual review guides.",
    color: "text-emerald-600",
    bg: "bg-emerald-50"
  }
];

export default function HomePage() {
  const navigate = useNavigate();

  const handleTableauRedirect = () => {
    window.location.href = TABLEAU_URL;
  };

  const handleThoughtSpotNavigate = () => {
    navigate('/upload');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans">
      <div className="container mx-auto px-6 py-16 max-w-6xl">
        
        {/* Navigation Header */}
        <header className="flex items-center justify-between mb-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl flex items-center justify-center shadow-sm border border-primary-500/30">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none">Enterprise BI</p>
              <p className="text-base font-extrabold text-gray-900 leading-tight">Modernization Suite</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white border border-gray-200 px-3.5 py-1.5 rounded-full text-xs text-gray-600 shadow-sm">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            Vite-V4 Compiled
          </div>
        </header>

        {/* Hero Section */}
        <section className="text-center mb-16 animate-fade-in">
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-2 bg-primary-50 border border-primary-100 text-primary-700 text-xs font-semibold px-4 py-2 rounded-full mb-8">
            <Zap className="w-3.5 h-3.5 text-primary-500" />
            Universal BI-to-PowerBI Transpiler
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight max-w-4xl mx-auto tracking-tight">
            Migrate Tableau &amp; ThoughtSpot
            <br />
            <span className="bg-gradient-to-r from-primary-600 via-amber-600 to-primary-700 bg-clip-text text-transparent">
              to Power BI in minutes
            </span>
          </h1>

          <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
            Accelerate modernization of legacy BI assets. Compile Tableau XML workbooks 
            and ThoughtSpot TML models directly into production-ready Power BI Projects (PBIP) 
            featuring logic-preserving DAX translation and complete TMDL schemas.
          </p>

          {/* Migration Path Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
            
            {/* Tableau Pathway */}
            <div className="group relative bg-white border border-gray-200 hover:border-blue-300 rounded-2xl p-8 text-left transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 overflow-hidden">
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-6">
                <FileCode2 className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Tableau to Power BI</h3>
              <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                Deconstruct packaged workbooks (.twbx) and XML layouts. Automatically transpile Tableau LOD expressions, parameters, worksheets, and dashboard sheets into native DAX measures and Power BI report layers.
              </p>
              <ul className="space-y-2 mb-8">
                {["Tableau XML & Packaged Workbooks", "LOD Expression Parsing", "Workbook Dashboard Mapping"].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-xs text-gray-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                    <span className="text-gray-600">{item}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={handleTableauRedirect}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl text-sm transition-all duration-200 shadow-sm shadow-blue-200 hover:scale-[1.01]"
              >
                Launch Tableau Compiler
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* ThoughtSpot Pathway */}
            <div className="group relative bg-white border border-gray-200 hover:border-primary-300 rounded-2xl p-8 text-left transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 overflow-hidden">
              <div className="w-12 h-12 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center mb-6">
                <Database className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">ThoughtSpot to Power BI</h3>
              <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                Ingest ThoughtSpot YAML TML worksheets and SpotApp bundles. Compile model tables, joins, filters, and formula expressions directly into native TMDL relationships and Power BI semantic models.
              </p>
              <ul className="space-y-2 mb-8">
                {["YAML Worksheet TML & SpotApps", "Model-Level Joins & Relations", "Interactive Liveboard Mapping"].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-xs text-gray-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-400" />
                    <span className="text-gray-600">{item}</span>
                  </li>
                ))}
              </ul>
              <button
                id="start-thoughtspot-btn"
                onClick={handleThoughtSpotNavigate}
                className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-4 rounded-xl text-sm transition-all duration-200 shadow-sm shadow-primary-200 hover:scale-[1.01]"
              >
                Launch ThoughtSpot Compiler
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </section>

        {/* Translation Pipeline */}
        <section className="bg-white border border-gray-200 rounded-2xl p-8 max-w-4xl mx-auto mb-16 shadow-sm">
          <h2 className="text-sm font-bold text-gray-700 mb-6 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary-500" />
            Compilation and Serialization Pipeline
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-left">
            {PIPELINE_STEPS.map((step, idx) => (
              <div key={idx} className="space-y-2">
                <p className="text-xs font-bold text-primary-600">{step.title}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Platform Capabilities */}
        <section className="max-w-4xl mx-auto pb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-8 text-center tracking-tight">Compiler Capabilities</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {CAPABILITIES.map((cap) => {
              const Icon = cap.icon;
              return (
                <div key={cap.title} className="bg-white border border-gray-200 rounded-xl p-6 flex gap-4 text-left hover:border-gray-300 transition-colors shadow-sm">
                  <div className={`w-10 h-10 rounded-lg ${cap.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${cap.color}`} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-950 mb-1.5">{cap.title}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">{cap.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-200 py-8 text-center text-xs text-gray-500 mt-8">
          Enterprise BI Transpiler Engine · Powered by FastAPI + Vite-React
        </footer>

      </div>
    </div>
  );
}
