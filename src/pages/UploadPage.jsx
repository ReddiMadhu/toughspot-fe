/**
 * UploadPage — Upload-only flow, no processing view.
 * After upload completes, immediately redirects to wizard Page 1
 * where Agent 1 (Source Analysis) auto-starts.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, Loader2, Info, Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';

import FileDropZone from '../components/upload/FileDropZone.jsx';
import api from '../services/api.js';
import useMigrationStore from '../stores/migrationStore.js';
import useAgentStore from '../stores/agentStore.js';

export default function UploadPage() {
  const navigate = useNavigate();
  const { actions } = useMigrationStore();
  const { actions: agentActions } = useAgentStore();

  const [files, setFiles]           = useState([]);
  const [isUploading, setIsUploading] = useState(false);

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

      // Reset all agents for a fresh run
      agentActions.resetAll();

      toast.success(`${files.length} file${files.length > 1 ? 's' : ''} uploaded! Launching agent wizard...`);

      // Immediately redirect to wizard — Agent 1 auto-starts on mount
      navigate(`/migration-wizard/${migration_id}/data-understanding`);
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
        </div>
      </main>
    </div>
  );
}
