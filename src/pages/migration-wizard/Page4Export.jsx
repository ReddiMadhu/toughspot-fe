/**
 * Page 4: Export & Package — Agent-Driven Final Step
 *
 * Flow:
 *   1. On mount, auto-triggers Agent 4 (Export Agent) if idle
 *   2. Shows AgentProcessingOverlay during execution (generating PBIP, excel report, packaging zip)
 *   3. Crossfades on completion to display the premium download panel with quick stats, ZIP packaging card, individual downloads, and next steps.
 */
import { useEffect, useState, useRef } from 'react';
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
  ChevronRight,
  Grid,
  Loader,
} from 'lucide-react';
import toast from 'react-hot-toast';

import MigrationSidebar from '../../components/migration/MigrationSidebar.jsx';
import Button from '../../components/common/Button.jsx';
import api from '../../services/api.js';
import migrationApi from '../../services/migrationApi.js';
import AgentProcessingOverlay from '../../components/migration/AgentProcessingOverlay.jsx';
import { useAgentTrigger } from '../../hooks/useAgentTrigger.js';
import useMigrationCacheStore from '../../stores/migrationCacheStore.js';

const ARTIFACT_ITEMS = [
  {
    id: 'excel',
    icon: FileSpreadsheet,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
    title: 'Excel Report',
    sub: 'migration_report.xlsx',
    desc: 'Conversions index, worksheet mapping, and stats',
  },
  {
    id: 'pbip',
    icon: Package,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-100',
    title: 'Power BI Project (PBIP)',
    sub: 'pbip/ folder',
    desc: 'Native TMDL model metadata files',
  },
  {
    id: 'dax',
    icon: FileCode,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-100',
    title: 'DAX Measures File',
    sub: 'measures.dax',
    desc: 'All converted DAX measures for quick copy-paste',
  },
  {
    id: 'json',
    icon: FileText,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
    title: 'User Guide',
    sub: 'MODEL_ENHANCEMENTS_REQUIRED.md',
    desc: 'M-scripts and setup steps for window calculations',
  },
];

const NEXT_STEPS = [
  'Extract the PBIP zip and open the .pbip file in Power BI Desktop',
  'Go to Home → Transform Data → Data Source Settings to reconnect your data',
  'Review any measures marked "Needs Review" in the DAX editor',
  'Add your visuals and report pages using the migrated measures',
];

export default function Page4Export() {
  const { migrationId } = useParams();
  const navigate = useNavigate();

  const { trigger, retry, status, progress, events, error, subPhase, message } = useAgentTrigger(migrationId, 'export');

  const [downloading, setDownloading] = useState({});
  const [migrationInfo, setMigrationInfo] = useState(null);
  const loadWorkbookMetadata = useMigrationCacheStore((state) => state.loadWorkbookMetadata);
  const [metadata, setMetadata] = useState(null);
  const [isLoadingResults, setIsLoadingResults] = useState(false);

  // Track whether user has dismissed the agent stream overlay
  const [userDismissedOverlay, setUserDismissedOverlay] = useState(false);
  const wasRunning = useRef(false);

  // Auto-dismiss overlay if already completed on load
  useEffect(() => {
    if (status === 'completed') {
      if (!wasRunning.current) {
        setUserDismissedOverlay(true);
      }
    } else if (status === 'running') {
      wasRunning.current = true;
    }
  }, [status]);

  // Auto-trigger Agent 4 on mount if idle
  useEffect(() => {
    if (!migrationId) {
      toast.error('No migration found. Please start a migration first.');
      navigate('/');
      return;
    }
    if (status === 'idle') {
      trigger();
    }
  }, [migrationId]);

  // Load results when agent completes (only after user dismisses overlay)
  useEffect(() => {
    if (status === 'completed' && migrationId && userDismissedOverlay) {
      loadResults();
    }
  }, [status, migrationId, userDismissedOverlay]);

  const loadResults = async () => {
    setIsLoadingResults(true);
    try {
      const [statusData, metaData] = await Promise.all([
        migrationApi.getMigrationStatus(migrationId),
        loadWorkbookMetadata(migrationId),
      ]);
      setMigrationInfo(statusData);
      setMetadata(metaData);
    } catch (err) {
      console.error("Failed to load export details:", err);
      toast.error("Failed to load export metrics");
    } finally {
      setIsLoadingResults(false);
    }
  };

  const handleDownload = (fileType) => {
    setDownloading((prev) => ({ ...prev, [fileType]: true }));
    const url = api.getDownloadUrl(migrationId, fileType);
    const link = document.createElement('a');
    link.href = url;
    link.click();
    toast.success('Download started!');
    setTimeout(() => setDownloading((prev) => ({ ...prev, [fileType]: false })), 2000);
  };

  // Handler for overlay Next button
  const handleOverlayNext = () => {
    setUserDismissedOverlay(true);
  };

  // ── Processing State ──
  // Show overlay when running, idle, OR completed but not yet dismissed
  if (status === 'running' || status === 'idle' || (status === 'completed' && !userDismissedOverlay)) {
    return (
      <div className="h-screen flex overflow-hidden" style={{ backgroundColor: '#e5e5e5' }}>
        <MigrationSidebar currentStep={4} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="bg-white border-b border-gray-200 shadow-sm px-6 py-3">
            <h1 className="text-lg font-bold text-gray-900">Package Builder</h1>
          </div>
          <AgentProcessingOverlay
            agentName="export"
            agentDisplayName="BI Migration Agent"
            events={events}
            status={status}
            progress={progress}
            subPhase={subPhase}
            message={message}
            error={error}
            onRetry={retry}
            onNext={handleOverlayNext}
          />
        </div>
      </div>
    );
  }

  // ── Failed State ──
  if (status === 'failed') {
    return (
      <div className="h-screen flex overflow-hidden" style={{ backgroundColor: '#e5e5e5' }}>
        <MigrationSidebar currentStep={4} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="bg-white border-b border-gray-200 shadow-sm px-6 py-3">
            <h1 className="text-lg font-bold text-gray-900">Package Builder</h1>
          </div>
          <AgentProcessingOverlay
            agentName="export"
            agentDisplayName="BI Migration Agent"
            events={events}
            status="failed"
            error={error}
            onRetry={retry}
          />
        </div>
      </div>
    );
  }

  // ── Loading results ──
  if (isLoadingResults || !migrationInfo) {
    return (
      <div className="h-screen flex overflow-hidden" style={{ backgroundColor: '#e5e5e5' }}>
        <MigrationSidebar currentStep={4} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader className="w-8 h-8 animate-spin text-primary-650 mx-auto mb-4" />
            <p className="text-gray-700 font-medium">Assembling download dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  const displayStats = [
    { icon: Table2,       label: 'Tables',        value: migrationInfo?.tables ?? 0 },
    { icon: FileCode,     label: 'Formulas',       value: migrationInfo?.formulas_converted ?? 0 },
    { icon: Grid,         label: 'Visuals',        value: metadata?.summary?.total_worksheets ?? 0 },
    {
      icon: Clock,
      label: 'Time',
      value: migrationInfo?.elapsed_seconds
        ? `${Math.round(migrationInfo.elapsed_seconds)}s`
        : '—',
    },
  ];

  return (
    <div className="h-screen flex overflow-hidden" style={{ backgroundColor: '#e5e5e5' }}>
      <MigrationSidebar currentStep={4} />

      <div className="flex-1 flex flex-col overflow-hidden results-fade-in">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 shadow-sm px-6 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-gray-900">Package Builder</h1>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                onClick={() => navigate(`/migration-wizard/${migrationId}/dax-conversion`)}
              >
                Back
              </Button>
              <Button onClick={() => { navigate('/'); }} variant="primary">
                Start New Migration
              </Button>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Success Banner */}
            <div className="bg-gradient-to-r from-emerald-50 to-blue-50 border-2 border-emerald-200 rounded-xl shadow-md p-8 text-center">
              <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Migration Successfully Packaged!
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto text-sm leading-relaxed">
                Your ThoughtSpot TML models and worksheet columns have been fully parsed,
                converted to Power BI measures, and packaged. All artifacts are ready for download.
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
            </div>

            {/* Package Contents + Primary Download */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl shadow-md p-8">
              <div className="flex flex-col items-center mb-6">
                <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center mb-3 shadow-lg">
                  <Download className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Download Complete Migration Package</h2>
              </div>

              {/* Package contents grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8 max-w-3xl mx-auto">
                {ARTIFACT_ITEMS.map((item) => {
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

            {/* Individual Downloads */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="text-base font-bold text-gray-900 mb-4">Individual Artifacts</h3>
              <div className="space-y-3">
                {ARTIFACT_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isLoading = downloading[item.id];
                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all"
                    >
                      <div
                        className={`w-10 h-10 rounded-xl ${item.bg} border ${item.border} flex items-center justify-center flex-shrink-0`}
                      >
                        <Icon className={`w-5 h-5 ${item.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5 font-mono">{item.sub}</p>
                        <p className="text-xs text-gray-400 mt-1">{item.desc}</p>
                      </div>
                      <button
                        onClick={() => handleDownload(item.id)}
                        disabled={isLoading}
                        className={`flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg transition-all flex-shrink-0 ${item.bg} ${item.color} border ${item.border} hover:brightness-95 disabled:opacity-60`}
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

            {/* Next Steps in Power BI */}
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
          </div>
        </div>
      </div>
    </div>
  );
}
