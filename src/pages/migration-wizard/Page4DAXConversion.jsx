/**
 * Page 3: Formula Conversion - ThoughtSpot TML to DAX Conversion Results (Old UI Format)
 *
 * Flow:
 *   1. On mount, auto-triggers Agent 3 (DAX Conversion) if idle
 *   2. Shows AgentProcessingOverlay with streaming events during processing
 *   3. Crossfades to the classic, clean tabular results view on completion
 */
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Code,
  CheckCircle,
  AlertCircle,
  Copy,
  Loader,
  Edit2,
  Check,
  X,
  XCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

import Button from '../../components/common/Button';
import MigrationSidebar from '../../components/migration/MigrationSidebar';
import AgentProcessingOverlay from '../../components/migration/AgentProcessingOverlay';
import { useAgentTrigger } from '../../hooks/useAgentTrigger';
import useMigrationCacheStore from '../../stores/migrationCacheStore';
import migrationApi from '../../services/migrationApi';

export default function Page4DAXConversion() {
  const navigate = useNavigate();
  const { migrationId } = useParams();
  const loadWorkbookMetadata = useMigrationCacheStore(state => state.loadWorkbookMetadata);

  const { trigger, retry, status, progress, events, error, subPhase, message } = useAgentTrigger(migrationId, 'dax_conversion');

  const [isLoadingResults, setIsLoadingResults] = useState(true);
  const [conversions, setConversions] = useState([]);
  const [metadata, setMetadata] = useState(null);
  const [editingConvId, setEditingConvId] = useState(null);
  const [editFormula, setEditFormula] = useState('');
  const [saving, setSaving] = useState(false);

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

  // Auto-trigger Agent 3 on mount if idle
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
      const [convData, metaData] = await Promise.all([
        migrationApi.getConversions(migrationId),
        loadWorkbookMetadata(migrationId)
      ]);
      setConversions(convData.conversions || []);
      setMetadata(metaData);
    } catch (error) {
      console.error('Failed to load conversions:', error);
      toast.error('Failed to load conversion data');
    } finally {
      setIsLoadingResults(false);
    }
  };

  const handleCopyDAX = (dax) => {
    navigator.clipboard.writeText(dax);
    toast.success('DAX copied to clipboard');
  };

  const startEditing = (conv) => {
    setEditingConvId(conv.conversion_id);
    setEditFormula(conv.dax_formula);
  };

  const cancelEditing = () => {
    setEditingConvId(null);
    setEditFormula('');
  };

  const saveOverride = async (conversionId) => {
    setSaving(true);
    try {
      await migrationApi.updateConversion(
        migrationId,
        conversionId,
        editFormula,
        "User manual override in wizard"
      );
      toast.success('Formula updated and marked as passed');
      setEditingConvId(null);
      await loadResults(); // Reload results
    } catch (error) {
      console.error('Failed to save manual override:', error);
      toast.error('Failed to update formula');
    } finally {
      setSaving(false);
    }
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
        <MigrationSidebar currentStep={3} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="bg-white border-b border-gray-200 shadow-sm px-6 py-3">
            <h1 className="text-lg font-bold text-gray-900">DAX Convertor</h1>
          </div>
          <AgentProcessingOverlay
            agentName="dax_conversion"
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
        <MigrationSidebar currentStep={3} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="bg-white border-b border-gray-200 shadow-sm px-6 py-3">
            <h1 className="text-lg font-bold text-gray-900">DAX Convertor</h1>
          </div>
          <AgentProcessingOverlay
            agentName="dax_conversion"
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
  if (isLoadingResults) {
    return (
      <div className="h-screen flex overflow-hidden" style={{ backgroundColor: '#e5e5e5' }}>
        <MigrationSidebar currentStep={3} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader className="w-8 h-8 animate-spin text-primary-650 mx-auto mb-4" />
            <p className="text-gray-655 font-medium">Loading conversions...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden" style={{ backgroundColor: '#e5e5e5' }}>
      <MigrationSidebar currentStep={3} />

      <div className="flex-1 flex flex-col overflow-hidden results-fade-in">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 shadow-sm px-6 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-gray-900">DAX Convertor</h1>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                onClick={() => navigate(`/migration-wizard/${migrationId}/model-intelligence`)}
              >
                Back
              </Button>
              <Button onClick={() => navigate(`/migration-wizard/${migrationId}/export`)}>
                Next Step
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Code className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{conversions.length}</div>
                  <div className="text-xs text-gray-500 font-semibold uppercase">Total Conversions</div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-green-200 p-5 shadow-sm flex items-center gap-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {conversions.filter(c => !c.requires_review).length}
                  </div>
                  <div className="text-xs text-gray-500 font-semibold uppercase">Passed</div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-red-200 p-5 shadow-sm flex items-center gap-4">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {conversions.filter(c => c.requires_review).length}
                  </div>
                  <div className="text-xs text-gray-500 font-semibold uppercase">Failed</div>
                </div>
              </div>
            </div>

            {/* Conversions List */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Code className="w-5 h-5 text-blue-600" />
                  Conversion Results ({conversions.length})
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-55 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-3 text-left">Measure Name</th>
                      <th className="px-6 py-3 text-left">Original Formula</th>
                      <th className="px-6 py-3 text-left">Converted DAX Measure</th>
                      <th className="px-6 py-3 text-center">Status</th>
                      <th className="px-6 py-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100 text-sm">
                    {conversions.map((conv, idx) => {
                      const isEditing = editingConvId === conv.conversion_id;
                      return (
                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 font-semibold text-gray-900">{conv.measure_name}</td>
                          <td className="px-6 py-4 font-mono text-xs text-gray-600 max-w-xs truncate" title={conv.original_formula}>
                            {conv.original_formula}
                          </td>
                          <td className="px-6 py-4 font-mono text-xs text-gray-700 max-w-sm">
                            {isEditing ? (
                              <textarea
                                value={editFormula}
                                onChange={(e) => setEditFormula(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded font-mono text-xs focus:outline-none focus:ring-1 focus:ring-primary-500"
                                rows={2}
                              />
                            ) : (
                              <div className="truncate" title={conv.dax_formula}>
                                {conv.dax_formula}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            {conv.requires_review ? (
                              <span
                                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 cursor-help shadow-sm border border-red-200"
                                title={conv.notes && conv.notes.length > 0 ? conv.notes[0] : "Requires manual review."}
                              >
                                <AlertCircle className="w-3 h-3 text-red-500" /> Failed
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 shadow-sm border border-green-200">
                                <CheckCircle className="w-3 h-3 text-green-500" /> Passed
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-xs font-semibold">
                            {isEditing ? (
                              <div className="flex justify-center gap-2">
                                <button
                                  onClick={() => saveOverride(conv.conversion_id)}
                                  disabled={saving}
                                  className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={cancelEditing}
                                  className="p-1 text-red-650 hover:bg-red-50 rounded"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex justify-center gap-3">
                                <button
                                  onClick={() => handleCopyDAX(conv.dax_formula)}
                                  className="text-primary-600 hover:text-primary-850 flex items-center gap-1"
                                >
                                  <Copy className="w-3.5 h-3.5" /> Copy
                                </button>
                                <button
                                  onClick={() => startEditing(conv)}
                                  className="text-gray-600 hover:text-gray-800 flex items-center gap-1"
                                >
                                  <Edit2 className="w-3.5 h-3.5" /> Edit
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
