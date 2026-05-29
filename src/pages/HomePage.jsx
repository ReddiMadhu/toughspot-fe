import { useNavigate } from 'react-router-dom';
import { ArrowRight, Zap, FileCode2, Database, BarChart3, FileSpreadsheet, CheckCircle2 } from 'lucide-react';

const FEATURES = [
  {
    icon: FileCode2,
    title: 'TML Parser',
    desc: 'Parse .tml and .zip SpotApp bundles — Tables, Models, Liveboards, Answers.',
    color: 'text-primary-600',
    bg: 'bg-primary-50',
  },
  {
    icon: Zap,
    title: 'DAX Converter',
    desc: 'Auto-convert ThoughtSpot formulas to DAX — group_sum, conditionals, date functions, and more.',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
  {
    icon: Database,
    title: 'PBIP Generator',
    desc: 'Generate a complete Power BI Project folder (PBIP) with TMDL semantic models.',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    icon: FileSpreadsheet,
    title: 'Excel Report',
    desc: '5-sheet migration report: DAX Conversions, Data Model, Visualizations, Notes, Dependencies.',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
];

const STEPS_PREVIEW = [
  'Upload your ThoughtSpot .tml files or SpotApp .zip bundle',
  'Parser extracts tables, joins, formulas, and visualizations',
  'Formula converter maps ThoughtSpot expressions → Power BI DAX',
  'PBIP project generated with TMDL semantic model',
  'Download PBIP, Excel report, DAX file, and model JSON',
];

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        {/* Nav */}
        <header className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center shadow-sm">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider leading-none">ThoughtSpot</p>
              <p className="text-sm font-bold text-gray-900 leading-tight">→ Power BI</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/upload')}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm hover:scale-105"
          >
            Start Migration <ArrowRight className="w-4 h-4" />
          </button>
        </header>

        {/* Hero */}
        <section className="text-center mb-12 animate-fade-in">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-primary-50 border border-primary-100 text-primary-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
            ThoughtSpot TML → Power BI PBIP
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Migrate ThoughtSpot content
            <br />
            <span className="gradient-text">to Power BI in minutes</span>
          </h1>

          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10">
            Upload your ThoughtSpot TML exports and get a complete Power BI project with
            auto-converted DAX formulas, semantic models, and a detailed migration report.
          </p>

          {/* CTA buttons */}
          <div className="flex gap-3 justify-center flex-wrap">
            <button
              id="start-migration-btn"
              onClick={() => navigate('/upload')}
              className="flex items-center gap-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-8 py-3.5 rounded-lg text-base transition-all shadow-lg shadow-primary-200 hover:shadow-xl hover:shadow-primary-200 hover:-translate-y-0.5 hover:scale-105"
            >
              <Zap className="w-5 h-5" />
              Start Migration
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Key metrics */}
          <div className="flex gap-8 justify-center mt-12 flex-wrap">
            {[
              { label: 'Formula patterns', value: '40+' },
              { label: 'TML object types', value: '5' },
              { label: 'Output formats', value: '4' },
              { label: 'Excel sheets', value: '5' },
            ].map((m) => (
              <div key={m.label} className="text-center">
                <p className="text-3xl font-bold text-primary-600">{m.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{m.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* What happens section */}
        <section className="max-w-4xl mx-auto mb-16">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 animate-slide-up">
            <h2 className="text-base font-bold text-gray-700 mb-5 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary-500" />
              What happens during migration
            </h2>
            <ol className="space-y-3">
              {STEPS_PREVIEW.map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Features grid */}
        <section className="max-w-4xl mx-auto pb-12">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">What's included</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="bg-white rounded-lg border border-gray-200 p-5 card-hover shadow-sm">
                  <div className={`w-10 h-10 rounded-lg ${f.bg} flex items-center justify-center mb-3`}>
                    <Icon className={`w-5 h-5 ${f.color}`} />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 mb-1">{f.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-200 py-6 text-center text-xs text-gray-500">
          ThoughtSpot → Power BI Migration Tool · Built with FastAPI + React
        </footer>
      </div>
    </div>
  );
}
