import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import AppShell from '../components/layout/AppShell.jsx';
import api from '../services/api.js';
import useMigrationStore from '../stores/migrationStore.js';
import { useMigrationProgressStream } from '../hooks/useMigrationProgressStream.js';

const STAGES = [
  { key: 'parsing', label: 'Parsing TML files', progress: 15 },
  { key: 'building_graph', label: 'Building logic graph & dependencies', progress: 28 },
  { key: 'converting', label: 'Converting formulas to DAX', progress: 55 },
  { key: 'generating_pbip', label: 'Generating Power BI project (PBIP)', progress: 70 },
  { key: 'exporting', label: 'Generating exports & summaries', progress: 85 },
  { key: 'packaging', label: 'Packaging outputs', progress: 95 },
  { key: 'completed', label: 'Migration complete!', progress: 100 },
];

export default function ProcessingPage() {
  const { migrationId } = useParams();
  const navigate = useNavigate();
  const { actions } = useMigrationStore();

  const [stageIndex, setStageIndex] = useState(0);
  const [progress, setProgress] = useState(5);
  const [status, setStatus] = useState('processing');
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  // Hook into real-time Server-Sent Events (SSE) updates
  const { lastMessage, connected } = useMigrationProgressStream(migrationId, status === 'processing');

  // Initial Status Load to fetch current progress or redirect if already completed/failed
  useEffect(() => {
    if (!migrationId) return;
    const initStatus = async () => {
      try {
        const { data } = await api.getStatus(migrationId);
        if (data.status === 'completed') {
          setProgress(100);
          setStageIndex(STAGES.length - 1);
          setStatus('completed');
          setStats(data);
          actions.completeMigration(data);
          navigate(`/migration/${migrationId}/workspace`);
        } else if (data.status === 'failed') {
          setStatus('failed');
          setError(data.error_message || 'Migration pipeline failed');
          actions.failMigration(data.error_message);
        } else {
          // processing
          setProgress(data.progress_percent || 5);
          const idx = STAGES.findIndex(s => s.key === data.current_stage);
          if (idx !== -1) {
            setStageIndex(idx);
          }
          actions.setProgress(data.progress_percent || 5, data.current_stage || 'parsing', 'Resuming progress tracking...');
        }
      } catch (e) {
        console.error('Failed to fetch initial status:', e);
      }
    };
    initStatus();
  }, [migrationId, actions, navigate]);

  // Handle WebSocket / Polling Messages
  useEffect(() => {
    if (!lastMessage) return;
    try {
      const data = typeof lastMessage.data === 'string' ? JSON.parse(lastMessage.data) : lastMessage.data;
      
      const isCompleted = data.type === 'completed' || data.current_stage === 'completed' || data.status === 'completed' || data.progress_percent === 100;
      const isFailed = data.type === 'failed' || data.current_stage === 'failed' || data.status === 'failed' || data.progress_percent < 0;

      if (isCompleted) {
        setProgress(100);
        setStageIndex(STAGES.length - 1);
        setStatus('completed');
        
        const fetchFinalStats = async () => {
          try {
            const response = await api.getStatus(migrationId);
            setStats(response.data);
            actions.completeMigration(response.data);
          } catch (err) {
            console.error(err);
          }
        };
        fetchFinalStats();
        
        toast.success('Migration complete! Redirecting to workspace...');
        setTimeout(() => navigate(`/migration/${migrationId}/workspace`), 1200);
      } else if (isFailed) {
        setStatus('failed');
        setError(data.message || 'Migration pipeline failed');
        actions.failMigration(data.message);
        toast.error('Migration failed');
      } else if (data.type === 'progress') {
        setProgress(data.progress_percent);
        const idx = STAGES.findIndex(s => s.key === data.current_stage);
        if (idx !== -1) {
          setStageIndex(idx);
        }
        actions.setProgress(data.progress_percent, data.current_stage, data.message);
      }
    } catch (err) {
      console.error('Failed to parse WS message:', err);
    }
  }, [lastMessage, migrationId, actions, navigate]);

  const handleRetry = () => navigate('/upload');

  const currentStage = STAGES[stageIndex] || STAGES[0];

  return (
    <AppShell title="Step 2 — Processing">
      <div className="max-w-xl mx-auto animate-slide-up">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
          {status === 'failed' ? (
            /* Error state */
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
                onClick={handleRetry}
                className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors mx-auto hover:scale-105"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
            </div>
          ) : status === 'completed' ? (
            /* Success */
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4 animate-pulse-ring">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Migration Complete!</h3>
              <p className="text-sm text-gray-500">Redirecting to review...</p>
            </div>
          ) : (
            /* Processing */
            <>
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-full bg-primary-50 flex items-center justify-center mx-auto mb-4">
                  <div className="w-7 h-7 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin" style={{ borderWidth: '3px' }} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Migrating your ThoughtSpot content</h3>
                <p className="text-sm text-gray-500 mb-2">This usually takes 10–30 seconds. Do not close this page.</p>
                
                {/* Connection status indicator */}
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
                    className="h-2 rounded-full progress-shimmer transition-all duration-700"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Stage checklist */}
              <div className="space-y-2 mt-4">
                {STAGES.slice(0, -1).map((stage, i) => {
                  const isDone = i < stageIndex;
                  const isActive = i === stageIndex;
                  return (
                    <div key={stage.key} className={`flex items-center gap-2.5 text-sm transition-colors ${isDone ? 'text-gray-500' : isActive ? 'text-primary-700 font-medium' : 'text-gray-300'}`}>
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
                <p className="text-xs text-gray-500 text-center font-mono">
                  Migration ID: {migrationId}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}
