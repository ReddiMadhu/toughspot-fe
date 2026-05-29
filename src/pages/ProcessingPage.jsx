import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import AppShell from '../components/layout/AppShell.jsx';
import api from '../services/api.js';
import useMigrationStore from '../stores/migrationStore.js';

const STAGES = [
  { key: 'parsing', label: 'Parsing TML files', progress: 20 },
  { key: 'converting', label: 'Converting formulas to DAX', progress: 50 },
  { key: 'generating', label: 'Generating Power BI project (PBIP)', progress: 75 },
  { key: 'exporting', label: 'Packaging Excel, DAX & JSON exports', progress: 90 },
  { key: 'done', label: 'Migration complete!', progress: 100 },
];

export default function ProcessingPage() {
  const { migrationId } = useParams();
  const navigate = useNavigate();
  const { actions, status: storeStatus } = useMigrationStore();

  const [stageIndex, setStageIndex] = useState(0);
  const [progress, setProgress] = useState(5);
  const [status, setStatus] = useState('processing');
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  const pollRef = useRef(null);
  const stageRef = useRef(null);

  // Animate through stages
  useEffect(() => {
    let idx = 0;
    stageRef.current = setInterval(() => {
      if (idx < STAGES.length - 1 && status === 'processing') {
        idx++;
        setStageIndex(idx);
        setProgress(STAGES[idx].progress);
      }
    }, 1800);
    return () => clearInterval(stageRef.current);
  }, []);

  // Poll backend for real status
  useEffect(() => {
    if (!migrationId) return;

    const poll = async () => {
      try {
        const { data } = await api.getStatus(migrationId);
        if (data.status === 'completed') {
          clearInterval(pollRef.current);
          clearInterval(stageRef.current);
          setStageIndex(STAGES.length - 1);
          setProgress(100);
          setStatus('completed');
          setStats(data);
          actions.completeMigration(data);
          toast.success('Migration complete! Redirecting to review...');
          setTimeout(() => navigate(`/migration/${migrationId}/review`), 1200);
        } else if (data.status === 'failed') {
          clearInterval(pollRef.current);
          clearInterval(stageRef.current);
          setStatus('failed');
          setError(data.error_message || 'Migration pipeline failed');
          actions.failMigration(data.error_message);
          toast.error('Migration failed');
        }
      } catch (e) {
        console.warn('Polling error:', e);
      }
    };

    pollRef.current = setInterval(poll, 2000);
    return () => clearInterval(pollRef.current);
  }, [migrationId]);

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
                <p className="text-sm text-gray-500">This usually takes 10–30 seconds. Do not close this page.</p>
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
