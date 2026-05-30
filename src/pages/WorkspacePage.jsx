/**
 * Migration Workspace Page - Main interface for reviewing migration
 */
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FileText,
  GitBranch,
  CheckCircle,
  Download,
  RefreshCw,
  AlertCircle,
  Brain,
  Database
} from 'lucide-react';
import toast from 'react-hot-toast';

import Card from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import AppShell from '../components/layout/AppShell.jsx';
import useMigrationStore from '../stores/migrationStore';
import api from '../services/api';
import { useMigrationProgressStream } from '../hooks/useMigrationProgressStream';

// Import migration components
import MigrationStatsCards from '../components/migration/MigrationStatsCards';
import LogicGraphCanvas from '../components/migration/LogicGraphCanvas';
import CalculationsList from '../components/migration/CalculationsList';
import ValidationSummary from '../components/migration/ValidationSummary';
import DiscrepancyInspector from '../components/migration/DiscrepancyInspector';
import AgentTraceViewer from '../components/migration/AgentTraceViewer';
import ModelEnhancementAlert from '../components/migration/ModelEnhancementAlert';

export default function WorkspacePage() {
  const { migrationId } = useParams();
  const navigate = useNavigate();

  const { status: storeStatus, conversions, progressPercent, currentStage, error: storeError, actions } =
    useMigrationStore();

  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [migrationInfo, setMigrationInfo] = useState(null);
  const [logicGraph, setLogicGraph] = useState(null);
  const [fidelityValidation, setFidelityValidation] = useState(null);
  const [correctionHistory, setCorrectionHistory] = useState([]);

  // SSE stream for real-time progress updates
  const { lastMessage, connected } = useMigrationProgressStream(
    migrationId,
    storeStatus === 'processing'
  );

  // Load migration data
  useEffect(() => {
    if (!migrationId) return;
    loadMigrationData();
  }, [migrationId]);

  // Handle WebSocket updates
  useEffect(() => {
    if (!lastMessage) return;

    try {
      const data = typeof lastMessage.data === 'string' ? JSON.parse(lastMessage.data) : lastMessage.data;

      const isCompleted = data.type === 'completed' || data.current_stage === 'completed' || data.status === 'completed' || data.progress_percent === 100;
      const isFailed = data.type === 'failed' || data.current_stage === 'failed' || data.status === 'failed' || data.progress_percent < 0;

      if (isCompleted || isFailed || data.type === 'progress') {
        const percent = isCompleted ? 100 : (isFailed ? -1 : data.progress_percent);
        const stage = isCompleted ? 'completed' : (isFailed ? 'failed' : data.current_stage);
        actions.setProgress(percent, stage, data.message);
        
        // Refresh overview info if state changes to completed
        if (isCompleted) {
          loadMigrationData();
        }
      }
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  }, [lastMessage]);

  const loadMigrationData = async () => {
    setIsLoading(true);
    try {
      // Load status and conversions in parallel
      const statusRes = await api.getStatus(migrationId);
      const migration = statusRes.data;
      setMigrationInfo(migration);
      
      // Update global store status
      if (migration.status === 'completed') {
        actions.completeMigration(migration);
      } else if (migration.status === 'failed') {
        actions.failMigration(migration.error_message);
      }

      // Fetch conversions & logic graph
      const [convsRes, graphRes] = await Promise.all([
        api.getConversions(migrationId).catch(() => ({ data: { conversions: [] } })),
        api.getLogicGraph(migrationId).catch(() => ({ data: { nodes: [], edges: [] } }))
      ]);

      const convs = convsRes.data.conversions || [];
      actions.setConversions(convs);
      setLogicGraph(graphRes.data);

      // Attempt to load fidelity validation and correction history (graceful fallbacks)
      try {
        if (api.getFidelityValidation) {
          const fidRes = await api.getFidelityValidation(migrationId);
          setFidelityValidation(fidRes.data);
        }
        if (api.getCorrectionHistory) {
          const corrRes = await api.getCorrectionHistory(migrationId);
          setCorrectionHistory(corrRes.data.correction_attempts || []);
        }
      } catch (err) {
        console.warn('Optional fidelity/healing data not yet available:', err);
      }

    } catch (error) {
      console.error('Failed to load migration data:', error);
      toast.error('Failed to load migration data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    loadMigrationData();
    toast.success('Refreshed migration data');
  };

  const handleExport = () => {
    navigate(`/migration/${migrationId}/export`);
  };

  if (isLoading && conversions.length === 0) {
    return (
      <AppShell title="Loading Workspace...">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <RefreshCw className="w-8 h-8 text-primary-600 animate-spin mb-4" />
          <p className="text-gray-500 text-sm">Loading migration data from server...</p>
        </div>
      </AppShell>
    );
  }

  // Calculate local stats for Stats Cards
  const total = conversions.length;
  const validated = conversions.filter(c => !c.requires_review && (c.confidence ?? 0) >= 0.9).length;
  const pending = conversions.filter(c => c.requires_review || (c.confidence ?? 0) < 0.9).length;
  const failed = 0; 
  const passRate = total > 0 ? (validated / total) * 100 : 0;
  const avgConfidence = total > 0 
    ? (conversions.reduce((sum, c) => sum + (c.confidence ?? 0), 0) / total) * 100 
    : 100;

  const stats = { total, validated, pending, failed, passRate, avgConfidence };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FileText },
    { id: 'logic-graph', label: 'Logic Graph', icon: GitBranch },
    { id: 'conversions', label: 'Conversions', icon: FileText },
    { id: 'validation', label: 'Validation', icon: CheckCircle },
    { id: 'fidelity', label: '100% Fidelity', icon: Brain },
  ];

  return (
    <AppShell title="Migration Workspace">
      <div className="max-w-6xl mx-auto space-y-6 animate-slide-up">
        {/* Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                ThoughtSpot to Power BI Workspace
              </h1>
              <p className="text-xs text-gray-500 mt-1 font-mono">
                Migration ID: {migrationId} • Status:{' '}
                <span
                  className={`font-semibold uppercase ${
                    storeStatus === 'completed'
                      ? 'text-emerald-600'
                      : storeStatus === 'failed'
                      ? 'text-red-650'
                      : 'text-primary-600'
                  }`}
                >
                  {storeStatus}
                </span>
              </p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate(`/migration-wizard/${migrationId}/data-understanding`)}
              >
                Launch Wizard
              </Button>

              {storeStatus === 'completed' && (
                <Button variant="primary" size="sm" onClick={handleExport}>
                  <Download className="w-4 h-4 mr-2" />
                  Export Artifacts
                </Button>
              )}
            </div>
          </div>

          {/* Real-time Progress Bar */}
          {storeStatus === 'processing' && (
            <div className="mt-5 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                <span className="font-semibold">{currentStage || 'Running migration pipeline...'}</span>
                <span>{progressPercent || 0}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300 progress-shimmer"
                  style={{
                    width: `${progressPercent || 0}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <MigrationStatsCards stats={stats} />

        {/* Main Tabbed Panel */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          {/* Custom tab headers */}
          <div className="flex border-b border-gray-200 overflow-x-auto scrollbar-none mb-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-3 border-b-2 text-sm font-semibold transition-all whitespace-nowrap ${
                    isActive
                      ? 'border-primary-600 text-primary-600 font-bold'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Contents */}
          <div className="min-h-[400px]">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <ModelEnhancementAlert migrationId={migrationId} />

                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-3">
                    Migration Summary
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Source worksheets</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {migrationInfo?.workbook_count || 0}
                      </p>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Source Formulas</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {migrationInfo?.calculation_count || 0}
                      </p>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">DAX Conversions</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.total}
                      </p>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Conversion Rate</p>
                      <p className="text-2xl font-bold text-emerald-600">
                        {stats.passRate.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* AI Executive Summary Panel */}
                {migrationInfo?.narrative_summary && (
                  <div className="p-5 bg-gradient-to-br from-primary-50/50 to-blue-50/50 rounded-lg border border-primary-100">
                    <div className="flex items-start gap-3">
                      <Brain className="w-5 h-5 text-primary-650 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 mb-2">AI Executive Summary</h4>
                        <div className="text-sm text-gray-700 leading-relaxed font-sans whitespace-pre-wrap">
                          {migrationInfo.narrative_summary}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {storeStatus === 'completed' && (
                  <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-lg">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-emerald-950 mb-1">
                          ThoughtSpot Migration Completed
                        </p>
                        <p className="text-xs text-emerald-800">
                          All formulas were loaded and successfully parsed. The generated Power BI Project (PBIP) is ready. You can inspect the logic graph, test conversions, or download the final artifacts.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {storeStatus === 'failed' && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-red-950 mb-1">
                          Migration Error Detected
                        </p>
                        <p className="text-xs text-red-800">
                          {storeError || 'An unexpected pipeline error occurred during migration.'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'logic-graph' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Calculation Dependency Graph</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Interactive topological dependency layout of TML formulas.</p>
                  </div>
                </div>
                <div className="h-[500px]">
                  <LogicGraphCanvas
                    graph={logicGraph}
                    onNodeClick={(nodeId) => {
                      toast.success(`Selected calculation: ${nodeId}`);
                      setActiveTab('conversions');
                    }}
                  />
                </div>
              </div>
            )}

            {activeTab === 'conversions' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">DAX Formula Review</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Inspect original formulas and converted DAX candidate measures.</p>
                  </div>
                </div>
                <CalculationsList
                  conversions={conversions}
                  onSelect={(conversionId) => {
                    navigate(`/migration/${migrationId}/review`);
                  }}
                />
              </div>
            )}

            {activeTab === 'validation' && (
              <ValidationSummary migrationId={migrationId} />
            )}

            {activeTab === 'fidelity' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-1">
                    Numerical Validation results
                  </h3>
                  <p className="text-xs text-gray-500 mb-4">Functional equivalence between source worksheets and target candidate model values.</p>
                  <DiscrepancyInspector validationResults={fidelityValidation} />
                </div>

                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-1">
                    Self-Healing Agent Activity
                  </h3>
                  <p className="text-xs text-gray-500 mb-4">History of automated code improvements and corrections made by the validation agent.</p>
                  <AgentTraceViewer correctionHistory={correctionHistory} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
