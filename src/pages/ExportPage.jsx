/**
 * Export Page — Wizard-style layout with MigrationSidebar
 * Matches the look & feel of Page1–Page5 in the migration wizard.
 */
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Package,
  FileSpreadsheet,
  FileCode,
  FileJson,
  CheckCircle2,
  Clock,
  Table2,
  Download,
  FileText,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';
import toast from 'react-hot-toast';

import MigrationSidebar from '../components/migration/MigrationSidebar.jsx';
import Button from '../components/common/Button.jsx';
import api from '../services/api.js';
import useMigrationStore from '../stores/migrationStore.js';

// ── Download option definitions ───────────────────────────────────────────────
const DOWNLOAD_OPTIONS = [
  {
    id: 'all',
    icon: Package,
    title: 'Full Migration Package (.zip)',
    desc: 'PBIP project + Excel report + DAX file + JSON model — everything bundled',
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
    desc: 'All converted measures as a standalone DAX file for Power BI paste-in',
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

// ── Package contents items ────────────────────────────────────────────────────
const PACKAGE_CONTENTS = [
  {
    icon: FileSpreadsheet,
    color: 'text-emerald-600',
    title: 'Excel Report',
    sub: 'migration_report.xlsx',
    desc: 'Conversions index, worksheet mapping, and stats',
  },
  {
    icon: Package,
    color: 'text-purple-600',
    title: 'Power BI Project (PBIP)',
    sub: 'pbip/ folder',
    desc: 'Native TMDL model metadata files',
  },
  {
    icon: FileCode,
    color: 'text-amber-600',
    title: 'DAX Measures File',
    sub: 'measures.dax',
    desc: 'All converted DAX measures for quick copy-paste',
  },
  {
    icon: FileText,
    color: 'text-blue-600',
    title: 'Model Enhancements Guide',
    sub: 'MODEL_ENHANCEMENTS_REQUIRED.md',
    desc: 'M-scripts and setup steps for window calculations',
  },
];

// ── Next steps ────────────────────────────────────────────────────────────────
const NEXT_STEPS = [
  'Extract the PBIP zip and open the .pbip file in Power BI Desktop',
  'Go to Home → Transform Data → Data Source Settings to reconnect your data',
  'Review any measures marked "Needs Review" in the DAX editor',
  'Add your visuals and report pages using the migrated measures',
];

// ─────────────────────────────────────────────────────────────────────────────

export default function ExportPage() {
  const { migrationId } = useParams();
  const navigate = useNavigate();
  const { stats, actions } = useMigrationStore();
  const [downloading, setDownloading] = useState({});
  const [migrationInfo, setMigrationInfo] = useState(null);

  useEffect(() => {
    // Fetch latest status for stats display
    if (migrationId) {
      api.getStatus(migrationId)
        .then((r) => setMigrationInfo(r.data))
        .catch(() => {});
    }
  }, [migrationId]);

  const handleDownload = (fileType) => {
    setDownloading((prev) => ({ ...prev, [fileType]: true }));
    const url = api.getDownloadUrl(migrationId, fileType);
    const link = document.createElement('a');
    link.href = url;
    link.click();
    toast.success('Download started!');
    setTimeout(() => setDownloading((prev) => ({ ...prev, [fileType]: false })), 2000);
  };

  const confPct =
    stats.formulasConverted > 0
      ? Math.round((stats.highConfidence / stats.formulasConverted) * 100)
      : 0;

  const displayStats = [
    { icon: Table2,       label: 'Tables',        value: migrationInfo?.tables ?? stats.tables },
    { icon: FileCode,     label: 'Formulas',       value: migrationInfo?.formulas_converted ?? stats.formulasConverted },
    { icon: CheckCircle2, label: 'Auto-converted', value: `${confPct}%` },
    {
      icon: Clock,
      label: 'Time',
      value: (migrationInfo?.elapsed_seconds ?? stats.elapsedSeconds)
        ? `${Math.round(migrationInfo?.elapsed_seconds ?? stats.elapsedSeconds)}s`
        : '—',
    },
  ];

  return (
    <div className="h-screen flex overflow-hidden" style={{ backgroundColor: '#e5e5e5' }}>
      {/* ── Left Sidebar ── */}
      <MigrationSidebar currentStep={5} />

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* ── Header ── */}
        <div className="bg-white border-b border-gray-200 shadow-sm px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Download &amp; Export</h1>
              <p className="text-sm text-gray-600 mt-1">
                Your ThoughtSpot → Power BI migration is complete. Download your artifacts below.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                onClick={() => navigate(`/migration-wizard/${migrationId}/formula-conversion`)}
              >
                ← Back
              </Button>
              <Button onClick={() => navigate(`/migration/${migrationId}/workspace`)}>
                Go to Workspace
              </Button>
            </div>
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">

            {/* ── Success Banner ── */}
            <div className="bg-gradient-to-r from-emerald-50 to-blue-50 border-2 border-emerald-200 rounded-xl shadow-md p-8 text-center">
              <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Analysis &amp; Conversion Complete!
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto text-sm leading-relaxed">
                Your ThoughtSpot TML models and worksheet columns have been parsed,
                converted to Power BI measures, and validated. The final packaged artifacts
                are ready for download.
              </p>

              {/* Quick stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
                {displayStats.map((s) => {
                  const Icon = s.icon;
                  return (
                    <div key={s.label} className="bg-white/70 rounded-lg p-3 text-center border border-white shadow-sm">
                      <Icon className="w-4 h-4 mx-auto mb-1 text-emerald-500" />
                      <p className="text-xl font-bold text-gray-900">{s.value ?? '—'}</p>
                      <p className="text-[11px] text-gray-500">{s.label}</p>
                    </div>
                  );
                })}
              </div>

              {/* Confidence bar */}
              {stats.formulasConverted > 0 && (
                <div className="mt-5 max-w-sm mx-auto">
                  <div className="flex justify-between text-[11px] text-gray-500 mb-1">
                    <span>Formula confidence</span>
                    <span>
                      {stats.highConfidence} high · {stats.mediumConfidence} med · {stats.lowConfidence} low
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full flex overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full transition-all"
                      style={{ width: `${(stats.highConfidence / stats.formulasConverted) * 100}%` }}
                    />
                    <div
                      className="bg-amber-400 h-full transition-all"
                      style={{ width: `${(stats.mediumConfidence / stats.formulasConverted) * 100}%` }}
                    />
                    <div
                      className="bg-red-400 h-full transition-all"
                      style={{ width: `${(stats.lowConfidence / stats.formulasConverted) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* ── Package Contents + Primary Download ── */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl shadow-md p-8">
              <div className="flex flex-col items-center mb-6">
                <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center mb-3 shadow-lg">
                  <Download className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Download Complete Migration Package</h2>
                <p className="text-gray-500 text-sm mt-1 text-center max-w-lg">
                  The packaged archive contains the PBIP project folder, DAX measures script,
                  model enhancements guide, and tabular JSON models.
                </p>
              </div>

              {/* Package contents grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8 max-w-3xl mx-auto">
                {PACKAGE_CONTENTS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.title}
                      className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-200 shadow-sm"
                    >
                      <Icon className={`w-5 h-5 ${item.color} flex-shrink-0 mt-0.5`} />
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{item.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5 font-mono">{item.sub}</p>
                        <p className="text-xs text-gray-400 mt-1">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Primary Download button */}
              <div className="text-center">
                <button
                  id="download-all-btn"
                  onClick={() => handleDownload('all')}
                  disabled={downloading['all']}
                  className="inline-flex items-center gap-2 px-8 py-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all hover:scale-105"
                >
                  {downloading['all'] ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  Download Complete Package (ZIP)
                </button>
              </div>
            </div>

            {/* ── Individual Downloads ── */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="text-base font-bold text-gray-900 mb-4">Individual Artifacts</h3>
              <div className="space-y-3">
                {DOWNLOAD_OPTIONS.filter((o) => o.id !== 'all').map((option) => {
                  const Icon = option.icon;
                  const isLoading = downloading[option.id];
                  return (
                    <div
                      key={option.id}
                      className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all"
                    >
                      <div
                        className={`w-10 h-10 rounded-xl ${option.bg} border ${option.border} flex items-center justify-center flex-shrink-0`}
                      >
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
                        className={`flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg transition-all flex-shrink-0 ${option.bg} ${option.color} border ${option.border} hover:brightness-95 disabled:opacity-60`}
                      >
                        {isLoading ? (
                          <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Download className="w-3.5 h-3.5" />
                        )}
                        Download
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── Next Steps ── */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">
                Next Steps in Power BI Desktop
              </h3>
              <ol className="space-y-3">
                {NEXT_STEPS.map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-sm text-gray-600">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* ── Footer Actions ── */}
            <div className="flex justify-between items-center pb-4">
              <button
                onClick={() => navigate(`/migration-wizard/${migrationId}/formula-conversion`)}
                className="text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors"
              >
                ← DAX Conversion
              </button>
              <button
                onClick={() => { actions.reset(); navigate('/'); }}
                className="inline-flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 font-semibold transition-colors"
              >
                Start new migration
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
