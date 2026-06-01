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
        <section className="max-w-5xl mx-auto mb-16">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-gray-900 tracking-tight mb-2">Multi-Agent Architecture</h2>
            <p className="text-sm text-gray-500">Two specialized AI agents work together to power your migration</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {AGENTS.map((agent) => {
              const Icon = agent.icon;
              return (
                <div key={agent.name} className={`bg-white border ${agent.border} rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-xl ${agent.bg} flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${agent.color}`} />
                    </div>
                    <h3 className="text-base font-bold text-gray-900">{agent.name}</h3>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed mb-5">{agent.desc}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {agent.subAgents.map((sub) => {
                      const SubIcon = sub.icon;
                      return (
                        <div key={sub.label} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-gray-50 border border-gray-100">
                          <SubIcon className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                          <span className="text-xs text-gray-600 font-medium truncate">{sub.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Launch Agent CTA */}
        <section className="max-w-4xl mx-auto mb-16 text-center">
          <button
            id="start-thoughtspot-btn"
            onClick={handleThoughtSpotNavigate}
            className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 px-10 rounded-xl text-sm transition-all duration-200 shadow-md shadow-primary-200 hover:scale-[1.02]"
          >
            Launch Agent
            <ArrowRight className="w-4 h-4" />
          </button>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-200 py-8 text-center text-xs text-gray-500 mt-8">
          BI Migration Studio · Powered by Multi-Agent AI + FastAPI + Vite-React
        </footer>

      </div>
    </div>
  );
}
