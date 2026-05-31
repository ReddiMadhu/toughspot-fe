/**
 * UploadPage — standalone upload + inline processing, no AppShell.
 * Phases: 'upload' → 'processing' → 'done' | 'failed'
 * After completion redirects to /migration-wizard/:id/data-understanding
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, Loader2, Info, Zap,
  CheckCircle2, XCircle, RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

import FileDropZone from '../components/upload/FileDropZone.jsx';
import api from '../services/api.js';
import useMigrationStore from '../stores/migrationStore.js';
import { useMigrationProgressStream } from '../hooks/useMigrationProgressStream.js';

const STAGES = [
  { key: 'parsing',        label: 'Parsing TML files' },
  { key: 'building_graph', label: 'Building logic graph & dependencies' },
  { key: 'converting',     label: 'Converting formulas to DAX' },
  { key: 'generating_pbip', label: 'Generating Power BI project (PBIP)' },
  { key: 'exporting',      label: 'Generating exports' },
  { key: 'packaging',      label: 'Packaging outputs' },
  { key: 'completed',      label: 'Migration complete!' },
];

// ── Inner processing view ─────────────────────────────────────────────────────
function ProcessingView({ migrationId, onComplete, onFail }) {
  const [stageIndex, setStageIndex] = useState(0);
  const [progress, setProgress]     = useState(5);
  const [status, setStatus]         = useState('processing'); // 'processing' | 'completed' | 'failed'
  const [error, setError]           = useState(null);
  const { actions } = useMigrationStore();

  const { lastMessage, connected } = useMigrationProgressStream(migrationId, status === 'processing');

  // Handle SSE messages
  useEffect(() => {
    if (!lastMessage) return;
    try {
      const data = typeof lastMessage.data === 'string'
        ? JSON.parse(lastMessage.data)
        : lastMessage.data;

      const isCompleted =
        data.type === 'completed' ||
        data.current_stage === 'completed' ||
        data.status === 'completed' ||
        data.progress_percent === 100;
      const isFailed =
        data.type === 'failed' ||
        data.current_stage === 'failed' ||
        data.status === 'failed' ||
        data.progress_percent < 0;

      if (isCompleted) {
        setProgress(100);
        setStageIndex(STAGES.length - 1);
        setStatus('completed');
        api.getStatus(migrationId)
          .then(r => actions.completeMigration(r.data))
          .catch(() => {});
        toast.success('Migration complete! Launching wizard...');
        setTimeout(() => onComplete(migrationId), 1200);
      } else if (isFailed) {
        setStatus('failed');
        setError(data.message || 'Migration pipeline failed');
        actions.failMigration(data.message);
        toast.error('Migration failed');
        onFail();
      } else if (data.type === 'progress') {
        setProgress(data.progress_percent);
        const idx = STAGES.findIndex(s => s.key === data.current_stage);
        if (idx !== -1) setStageIndex(idx);
        actions.setProgress(data.progress_percent, data.current_stage, data.message);
      }
    } catch (err) {
      console.error('Failed to parse SSE message:', err);
    }
  }, [lastMessage]);

  const currentStage = STAGES[stageIndex] || STAGES[0];

  if (status === 'failed') {
    return (
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
          <XCircle className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">Migration Failed</h3>
        <p className="text-sm text-gray-500 mb-2">An error occurred during the migration pipeline:</p>
        <div className="text-left bg-red-50 rounded-lg border border-red-100 p-3 mb-6">
          <p className="text-sm font-mono text-red-700 break-words">{error}</p>
        </div>
        <button
          onClick={onFail}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors mx-auto hover:scale-105"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    );
  }

  if (status === 'completed') {
    return (
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-emerald-500" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">Migration Complete!</h3>
        <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
      </div>
    );
  }

  return (
    <>
      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-full bg-primary-50 flex items-center justify-center mx-auto mb-4">
          <div className="w-7 h-7 border-primary-200 border-t-primary-600 rounded-full animate-spin" style={{ borderWidth: '3px', borderStyle: 'solid' }} />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">Migrating your ThoughtSpot content</h3>
        <p className="text-sm text-gray-500 mb-2">This usually takes 10–30 seconds. Do not close this page.</p>
        <div className="flex items-center justify-center gap-1.5 mt-2">
          <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
          <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">
            {connected ? 'Live Stream' : 'Connecting...'}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1.5">
          <span>{currentStage.label}</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
          <div
            className="h-2 rounded-full bg-primary-600 transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Stage checklist */}
      <div className="space-y-2 mt-4">
        {STAGES.slice(0, -1).map((stage, i) => {
          const isDone   = i < stageIndex;
          const isActive = i === stageIndex;
          return (
            <div
              key={stage.key}
              className={`flex items-center gap-2.5 text-sm transition-colors ${
                isDone ? 'text-gray-500' : isActive ? 'text-primary-700 font-medium' : 'text-gray-300'
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              ) : isActive ? (
                <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-gray-200 flex-shrink-0" />
              )}
              {stage.label}
            </div>
          );
        })}
      </div>

      <div className="mt-5 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-400 text-center font-mono">
          Migration ID: {migrationId}
        </p>
      </div>
    </>
  );
}

// ── Main UploadPage ───────────────────────────────────────────────────────────
export default function UploadPage() {
  const navigate = useNavigate();
  const { actions } = useMigrationStore();

  const [files, setFiles]           = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [phase, setPhase]           = useState('upload'); // 'upload' | 'processing'
  const [migrationId, setMigrationId] = useState(null);

  const handleStartMigration = async () => {
    if (files.length === 0) {
      toast.error('Please select at least one .tml or .zip file');
      return;
    }
    setIsUploading(true);
    actions.setStatus('uploading');
    actions.setFiles(files);

    try {
      const response = await api.upload(files);
      const { migration_id } = response.data;
      actions.startMigration(migration_id, files);
      toast.success(`${files.length} file${files.length > 1 ? 's' : ''} uploaded! Starting conversion...`);
      setMigrationId(migration_id);
      setPhase('processing');
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.error?.message ||
        'Upload failed. Please check your files and try again.';
      toast.error(msg);
      actions.setStatus('idle');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200 shadow-sm px-6 py-4 flex items-center gap-3">
        <div
          className="w-8 h-8 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center shadow-sm cursor-pointer"
          onClick={() => navigate('/')}
        >
          <Zap className="w-4 h-4 text-white" />
        </div>
        <div className="leading-tight cursor-pointer" onClick={() => navigate('/')}>
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">ThoughtSpot</p>
          <p className="text-sm font-bold text-gray-900">→ Power BI Migration</p>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">

          {phase === 'upload' && (
            <div className="animate-slide-up">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Upload ThoughtSpot Exports</h2>
                <p className="text-gray-500 text-sm">
                  Upload your ThoughtSpot TML files or a SpotApp .zip bundle to begin migration.
                </p>
              </div>

              {/* Info banner */}
              <div className="flex gap-3 p-4 bg-primary-50 rounded-lg border border-primary-100 mb-6">
                <Info className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-primary-700">
                  <p className="font-medium mb-1">What gets migrated:</p>
                  <ul className="space-y-0.5 text-primary-600 text-xs">
                    <li>✓ Tables → Power BI TMDL table definitions</li>
                    <li>✓ Worksheets / Models → Semantic model with relationships</li>
                    <li>✓ Formulas → DAX measures (auto-converted)</li>
                    <li>✓ Liveboards & Answers → Inventory in Excel report</li>
                  </ul>
                </div>
              </div>

              {/* Drop zone */}
              <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm mb-6">
                <FileDropZone onFilesChange={setFiles} disabled={isUploading} />
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center">
                <button
                  onClick={() => navigate('/')}
                  disabled={isUploading}
                  className="text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors disabled:opacity-40"
                >
                  ← Back to Home
                </button>
                <button
                  id="start-migration-action-btn"
                  onClick={handleStartMigration}
                  disabled={files.length === 0 || isUploading}
                  className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-200 disabled:text-gray-500 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-all shadow-sm hover:scale-105"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      Start Migration
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {phase === 'processing' && migrationId && (
            <div className="animate-slide-up bg-white rounded-lg border border-gray-200 shadow-sm p-8">
              <ProcessingView
                migrationId={migrationId}
                onComplete={(id) => navigate(`/migration-wizard/${id}/data-understanding`)}
                onFail={() => { setPhase('upload'); setFiles([]); actions.reset(); }}
              />
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
