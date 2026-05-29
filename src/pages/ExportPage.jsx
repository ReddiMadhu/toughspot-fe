import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Package, FileSpreadsheet, FileCode, FileJson, CheckCircle2, Clock, Table2 } from 'lucide-react';
import toast from 'react-hot-toast';
import AppShell from '../components/layout/AppShell.jsx';
import api from '../services/api.js';
import useMigrationStore from '../stores/migrationStore.js';

const DOWNLOAD_OPTIONS = [
  {
    id: 'all',
    icon: Package,
    title: 'Download Full Package',
    desc: 'PBIP project + Excel report + DAX file + JSON model — everything in one ZIP',
    color: 'text-primary-600',
    bg: 'bg-primary-50',
    border: 'border-primary-200',
    primary: true,
  },
  {
    id: 'pbip',
    icon: Package,
    title: 'PBIP Project (.zip)',
    desc: 'Power BI Project folder — open directly in Power BI Desktop',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
  },
  {
    id: 'excel',
    icon: FileSpreadsheet,
    title: 'Migration Report (.xlsx)',
    desc: '5-sheet Excel: DAX Conversions, Data Model, Visualizations, Notes, Dependencies',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
  },
  {
    id: 'dax',
    icon: FileCode,
    title: 'DAX Measures (.dax)',
    desc: 'All converted measures as a standalone DAX file',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-100',
  },
  {
    id: 'json',
    icon: FileJson,
    title: 'Intermediate Model (.json)',
    desc: 'Parsed ThoughtSpot model as structured JSON for debugging or custom processing',
    color: 'text-violet-600',
    bg: 'bg-violet-50',
    border: 'border-violet-100',
  },
];

export default function ExportPage() {
  const { migrationId } = useParams();
  const navigate = useNavigate();
  const { stats, narrativeSummary, actions } = useMigrationStore();
  const [downloading, setDownloading] = useState({});

  useEffect(() => {
    actions.setActiveStep(5);
  }, []);

  const handleDownload = (fileType) => {
    setDownloading((prev) => ({ ...prev, [fileType]: true }));
    const url = api.getDownloadUrl(migrationId, fileType);
    const link = document.createElement('a');
    link.href = url;
    link.click();
    toast.success('Download started!');
    setTimeout(() => setDownloading((prev) => ({ ...prev, [fileType]: false })), 2000);
  };

  const confPct = stats.formulasConverted > 0
    ? Math.round((stats.highConfidence / stats.formulasConverted) * 100)
    : 0;

  return (
    <AppShell title="Step 5 — Export">
      <div className="max-w-3xl mx-auto animate-slide-up">
        {/* Summary card */}
        <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg p-6 text-white mb-6 shadow-lg shadow-primary-200">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold mb-0.5">Migration Complete! 🎉</h2>
              <p className="text-primary-200 text-sm">Your Power BI artifacts are ready to download</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: Table2, label: 'Tables', value: stats.tables },
              { icon: FileCode, label: 'Formulas', value: stats.formulasConverted },
              { icon: CheckCircle2, label: 'Auto-converted', value: `${confPct}%` },
              { icon: Clock, label: 'Time', value: stats.elapsedSeconds ? `${stats.elapsedSeconds}s` : '—' },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="bg-white/10 rounded-lg p-3 text-center">
                  <Icon className="w-4 h-4 mx-auto mb-1 text-primary-200" />
                  <p className="text-lg font-bold">{s.value}</p>
                  <p className="text-[11px] text-primary-300">{s.label}</p>
                </div>
              );
            })}
          </div>

          {/* Confidence breakdown */}
          {stats.formulasConverted > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-[11px] text-primary-300 mb-1">
                <span>Formula confidence</span>
                <span>{stats.highConfidence} high · {stats.mediumConfidence} medium · {stats.lowConfidence} low</span>
              </div>
              <div className="w-full h-2 bg-white/20 rounded-full flex overflow-hidden">
                <div className="bg-emerald-400 h-full" style={{ width: `${(stats.highConfidence / stats.formulasConverted) * 100}%` }} />
                <div className="bg-amber-400 h-full" style={{ width: `${(stats.mediumConfidence / stats.formulasConverted) * 100}%` }} />
                <div className="bg-red-400 h-full" style={{ width: `${(stats.lowConfidence / stats.formulasConverted) * 100}%` }} />
              </div>
            </div>
          )}
        </div>

        {/* AI Business Narrative & Summary */}
        {narrativeSummary && (
          <div className="bg-gray-900 text-gray-100 rounded-lg p-6 mb-6 shadow-xl border border-gray-800 backdrop-blur-md bg-opacity-95">
            <div className="flex items-center gap-2 mb-4 border-b border-gray-800 pb-3">
              <div className="w-8 h-8 rounded-lg bg-primary-500 bg-opacity-20 flex items-center justify-center border border-primary-500 border-opacity-30">
                <span className="text-sm">✨</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white mb-0">AI Executive Narrative Summary</h3>
                <p className="text-[10px] text-gray-500">Semantic reasoning report generated by Gemini</p>
              </div>
            </div>
            <div className="prose prose-sm max-h-[350px] overflow-y-auto text-gray-300 pr-2 space-y-4 font-sans leading-relaxed text-xs">
              {narrativeSummary.split('\n').map((line, idx) => {
                const trimmed = line.trim();
                if (!trimmed) return <div key={idx} className="h-2" />;
                if (trimmed.startsWith('### ')) {
                  return <h4 key={idx} className="text-[11px] font-bold text-primary-400 mt-4 mb-1 uppercase tracking-wider">{trimmed.replace('### ', '')}</h4>;
                }
                if (trimmed.startsWith('## ')) {
                  return <h3 key={idx} className="text-xs font-extrabold text-white mt-5 mb-1.5">{trimmed.replace('## ', '')}</h3>;
                }
                if (trimmed.startsWith('# ')) {
                  return <h2 key={idx} className="text-sm font-black text-white mt-6 mb-2">{trimmed.replace('# ', '')}</h2>;
                }
                if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                  return (
                    <div key={idx} className="flex gap-2 pl-2">
                      <span className="text-primary-400">•</span>
                      <span>{trimmed.substring(2)}</span>
                    </div>
                  );
                }
                return <p key={idx} className="text-gray-300">{trimmed}</p>;
              })}
            </div>
          </div>
        )}


        {/* Download options */}
        <div className="space-y-3">
          {DOWNLOAD_OPTIONS.map((option) => {
            const Icon = option.icon;
            const isLoading = downloading[option.id];
            return (
              <div
                key={option.id}
                className={`bg-white rounded-lg border ${option.primary ? 'border-primary-300 shadow-sm shadow-primary-100' : 'border-gray-200'} p-4 flex items-center gap-4 card-hover`}
              >
                <div className={`w-10 h-10 rounded-lg ${option.bg} border ${option.border} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${option.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{option.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{option.desc}</p>
                </div>
                <button
                  id={`download-${option.id}-btn`}
                  onClick={() => handleDownload(option.id)}
                  disabled={isLoading}
                  className={`flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg transition-all flex-shrink-0 ${
                    option.primary
                      ? 'bg-primary-600 hover:bg-primary-700 text-white shadow-sm hover:scale-105'
                      : `${option.bg} ${option.color} hover:brightness-95 border ${option.border}`
                  }`}
                >
                  {isLoading ? (
                    <div className={`w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin`} />
                  ) : (
                    '↓'
                  )}
                  {option.primary ? 'Download All' : 'Download'}
                </button>
              </div>
            );
          })}
        </div>

        {/* Next steps hint */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Next Steps in Power BI Desktop</p>
          <ol className="space-y-1">
            {[
              'Extract the PBIP zip and open the .pbip file in Power BI Desktop',
              'Go to Home → Transform Data → Data Source Settings to reconnect your data',
              'Review any measures marked "Needs Review" in the DAX editor',
              'Add your visuals and report pages using the migrated measures',
            ].map((step, i) => (
              <li key={i} className="flex gap-2 text-xs text-gray-500">
                <span className="text-gray-300 flex-shrink-0">{i + 1}.</span>
                {step}
              </li>
            ))}
          </ol>
        </div>

        {/* Bottom nav */}
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
          <button
            onClick={() => navigate(`/migration/${migrationId}/data-model`)}
            className="text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors"
          >
            ← Data Model
          </button>
          <button
            onClick={() => { actions.reset(); navigate('/'); }}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
          >
            Start new migration →
          </button>
        </div>
      </div>
    </AppShell>
  );
}
