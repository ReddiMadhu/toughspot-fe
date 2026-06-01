import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Zap,
  FileCode2,
  Database,
  Layers,
  Brain,
  Cpu,
  BarChart3,
  GitBranch,
  Code,
  Shield,
  Package,
  FileText,
  Search,
} from 'lucide-react';

const TABLEAU_URL = import.meta.env.VITE_TABLEAU_MIGRATOR_URL || 'http://localhost:5173';

const AGENTS = [
  {
    name: 'Dashboard Intelligence Agent',
    desc: 'Understands what each dashboard does — extracts chart types, visual configs, data models, calculated fields, and generates plain-English summaries.',
    icon: Brain,
    color: 'text-teal-600',
    bg: 'bg-teal-50',
    border: 'border-teal-100',
    subAgents: [
      { icon: BarChart3, label: 'Chart & Visual Extractor' },
      { icon: GitBranch, label: 'Data Model Extractor' },
      { icon: Code, label: 'Calculated Fields Extractor' },
      { icon: FileText, label: 'NL Summarizer' },
    ],
  },
  {
    name: 'BI Migration Agent',
    desc: 'Converts, validates & exports — builds semantic models, transpiles expressions to DAX, runs parity checks, and packages the final Power BI project.',
    icon: Cpu,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    border: 'border-orange-100',
    subAgents: [
      { icon: Layers, label: 'Semantic Model Builder' },
      { icon: Code, label: 'Expression Convertor' },
      { icon: Shield, label: 'Validator' },
      { icon: Package, label: 'Package Builder' },
    ],
  },
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
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none">Enterprise</p>
              <p className="text-base font-extrabold text-gray-900 leading-tight">BI Migration Studio</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white border border-gray-200 px-3.5 py-1.5 rounded-full text-xs text-gray-600 shadow-sm">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            AI-Powered Multi-Agent
          </div>
        </header>

        {/* Hero Section */}
        <section className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-primary-50 border border-primary-100 text-primary-700 text-xs font-semibold px-4 py-2 rounded-full mb-8">
            <Zap className="w-3.5 h-3.5 text-primary-500" />
            AI-powered multi-agent suite for BI Modernization
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight max-w-4xl mx-auto tracking-tight">
            Migrate Your Dashboards
            <br />
            <span className="bg-gradient-to-r from-primary-600 via-amber-600 to-primary-700 bg-clip-text text-transparent">
              to Power BI in minutes
            </span>
          </h1>

          <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
            Accelerate modernization of legacy BI assets. Our multi-agent system intelligently
            analyzes, translates, and packages your dashboards into production-ready
            Power BI Projects (PBIP) with logic-preserving DAX and complete TMDL schemas.
          </p>
        </section>

        {/* Agent Architecture Section */}
        <section className="max-w-3xl mx-auto mb-16 text-center">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight mb-4">Multi-Agent Architecture</h2>
          <div className="space-y-6 text-left bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div>
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Brain className="w-5 h-5 text-teal-600" />
                Dashboard Intelligence Agent
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Understands what each dashboard does — extracts chart types, visual configs, data models, calculated fields, and generates plain-English summaries.
              </p>
            </div>
            <div className="border-t border-gray-100 pt-4">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-orange-600" />
                BI Migration Agent
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Converts, validates & exports — builds semantic models, transpiles expressions to DAX, runs parity checks, and packages the final Power BI project.
              </p>
            </div>
          </div>
        </section>

        {/* Choose Your Migration Agent */}
        <section className="max-w-4xl mx-auto mb-16">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-gray-900 tracking-tight mb-2">Choose Your Migration Agent</h2>
            <p className="text-sm text-gray-500">Select the source platform to begin your AI-assisted migration</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* Tableau Pathway */}
            <div className="group relative bg-white border border-gray-200 hover:border-blue-300 rounded-2xl p-8 text-left transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 overflow-hidden">
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-6">
                <FileCode2 className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Tableau to Power BI</h3>
              <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                Deconstruct packaged workbooks (.twbx) and XML layouts. Automatically transpile Tableau LOD expressions, parameters, and dashboard sheets into native DAX measures and Power BI report layers.
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
                Launch Agent
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
                Launch Agent
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-200 py-8 text-center text-xs text-gray-500 mt-8">
          BI Migration Studio · Powered by Multi-Agent AI + FastAPI + Vite-React
        </footer>

      </div>
    </div>
  );
}
