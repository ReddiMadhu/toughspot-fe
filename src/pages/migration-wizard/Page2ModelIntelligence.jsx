/**
 * Page 2: Model Intelligence & Calculation Dependency Configuration
 *
 * Flow:
 *   1. On mount, auto-triggers Agent 2 (Data Model Analysis) if idle
 *   2. Shows AgentProcessingOverlay during execution
 *   3. Renders rich premium Multi-Tab Analysis view on completion
 *   4. Tab options:
 *      - Tab 1: "Semantic ERD" (Interactive ERD using RelationshipDiagram)
 *      - Tab 2: "Calculations Graph" (ReactFlow DAG using LogicGraphCanvas)
 *      - Tab 3: "Classifications & Quality" (Fact/Dim tables, column quality metrics)
 *      - Tab 4: "Model Enhancements" (Presents alerts & instructions for complex ThoughtSpot aggregate functions)
 */
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Loader,
  GitFork,
  Network,
  Database,
  AlertCircle,
  Table,
  Zap,
  Info,
  CheckCircle,
  TrendingUp,
} from 'lucide-react';
import toast from 'react-hot-toast';

import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import RelationshipDiagram from '../../components/model/RelationshipDiagram';
import LogicGraphCanvas from '../../components/migration/LogicGraphCanvas';
import ModelEnhancementAlert from '../../components/migration/ModelEnhancementAlert';
import MigrationSidebar from '../../components/migration/MigrationSidebar';
import AgentProcessingOverlay from '../../components/migration/AgentProcessingOverlay';
import { useAgentTrigger } from '../../hooks/useAgentTrigger';
import useAgentStore from '../../stores/agentStore';
import migrationApi from '../../services/migrationApi';

export default function Page2ModelIntelligence() {
  const navigate = useNavigate();
  const { migrationId } = useParams();

  const { trigger, retry, status, progress, events, error, subPhase, message } = useAgentTrigger(migrationId, 'data_model');

  // Results State
  const [tables, setTables] = useState([]);
  const [joins, setJoins] = useState([]);
  const [logicGraph, setLogicGraph] = useState(null);
  const [modelIntelligence, setModelIntelligence] = useState(null);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [activeTab, setActiveTab] = useState('erd'); // 'erd' | 'logic-graph' | 'classifications' | 'enhancements'

  // Auto-trigger Agent 2 on mount if idle
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

  // Load results when agent completes
  useEffect(() => {
    if (status === 'completed' && migrationId) {
      loadResults();
    }
  }, [status, migrationId]);

  const loadResults = async () => {
    setIsLoadingResults(true);
    try {
      // 1. Fetch tables and joins from JSON download
      const response = await fetch(`/api/v1/ts-migration/${migrationId}/download?file=json`);
      if (!response.ok) throw new Error(`Status: ${response.status}`);
      const data = await response.json();
      if (data?.tables) {
        setTables(data.tables);
        setJoins(data.joins || []);
      }

      // 2. Fetch logic graph
      const graphData = await migrationApi.getLogicGraph(migrationId);
      setLogicGraph(graphData);

      // 3. Fetch model intelligence (classifications & data quality)
      const intelData = await migrationApi.getModelIntelligence(migrationId);
      setModelIntelligence(intelData);
    } catch (err) {
      console.error('Failed to load model intelligence results:', err);
      toast.error('Failed to load analyzed model data');
    } finally {
      setIsLoadingResults(false);
    }
  };

  const handleNext = () => {
    navigate(`/migration-wizard/${migrationId}/dax-conversion`);
  };

  // ── Processing State ──
  if (status === 'running' || status === 'idle') {
    return (
      <div className="h-screen flex overflow-hidden" style={{ backgroundColor: '#e5e5e5' }}>
        <MigrationSidebar currentStep={2} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="bg-white border-b border-gray-200 shadow-sm px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-900">Data Model & calculations Analysis</h1>
            <p className="text-sm text-gray-600 mt-1">
              Agent building schema ERD and compiling logic graph...
            </p>
          </div>
          <AgentProcessingOverlay
            agentName="data_model"
            agentDisplayName="Data Model Agent"
            events={events}
            status={status}
            progress={progress}
            subPhase={subPhase}
            message={message}
            error={error}
            onRetry={retry}
          />
        </div>
      </div>
    );
  }

  // ── Failed State ──
  if (status === 'failed') {
    return (
      <div className="h-screen flex overflow-hidden" style={{ backgroundColor: '#e5e5e5' }}>
        <MigrationSidebar currentStep={2} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="bg-white border-b border-gray-200 shadow-sm px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-900">Data Model & Calculations Analysis</h1>
          </div>
          <AgentProcessingOverlay
            agentName="data_model"
            agentDisplayName="Data Model Agent"
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
        <MigrationSidebar currentStep={2} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader className="w-8 h-8 animate-spin text-primary-650 mx-auto mb-4" />
            <p className="text-gray-700 font-medium">Loading schema model details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden" style={{ backgroundColor: '#e5e5e5' }}>
      <MigrationSidebar currentStep={2} />

      <div className="flex-1 flex flex-col overflow-hidden results-fade-in">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 shadow-sm px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Data Model Configuration</h1>
              <p className="text-sm text-gray-600 mt-1">
                Visualizing ERD, formula logic graph dependencies, and suggested model enhancements
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                onClick={() => navigate(`/migration-wizard/${migrationId}/data-understanding`)}
              >
                Back
              </Button>
              <Button onClick={handleNext} className="px-6">
                Next Step
              </Button>
            </div>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="bg-white border-b border-gray-200 px-6 py-1 shrink-0 flex items-center gap-4">
          <button
            onClick={() => setActiveTab('erd')}
            className={`py-3 px-4 border-b-2 font-semibold text-sm transition-all flex items-center gap-2 ${
              activeTab === 'erd'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Network className="w-4 h-4" />
            Semantic ERD
          </button>
          <button
            onClick={() => setActiveTab('logic-graph')}
            className={`py-3 px-4 border-b-2 font-semibold text-sm transition-all flex items-center gap-2 ${
              activeTab === 'logic-graph'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <GitFork className="w-4 h-4" />
            Calculations Logic Graph
          </button>
          <button
            onClick={() => setActiveTab('classifications')}
            className={`py-3 px-4 border-b-2 font-semibold text-sm transition-all flex items-center gap-2 ${
              activeTab === 'classifications'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Table className="w-4 h-4" />
            Classifications &amp; Quality
          </button>
          <button
            onClick={() => setActiveTab('enhancements')}
            className={`py-3 px-4 border-b-2 font-semibold text-sm transition-all flex items-center gap-2 relative ${
              activeTab === 'enhancements'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-500" />
            Model Enhancements
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto h-full flex flex-col">
            {/* Tab 1: Semantic ERD */}
            {activeTab === 'erd' && (
              <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden flex flex-col min-h-[500px]">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between shrink-0">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Suggested Table Relationships</h2>
                    <p className="text-xs text-gray-500">Auto-detected cardinality based on ThoughtSpot TML schema</p>
                  </div>
                  <span className="px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-xs font-semibold text-blue-700">
                    {joins.length} Joins Found
                  </span>
                </div>
                <div className="flex-1 relative min-h-[450px]">
                  <RelationshipDiagram
                    tables={tables}
                    joins={joins}
                    height={500}
                    loading={false}
                  />
                </div>
              </div>
            )}

            {/* Tab 2: Logic Graph dependency */}
            {activeTab === 'logic-graph' && (
              <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden flex flex-col min-h-[500px]">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between shrink-0">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Calculations Dependency Graph (DAG)</h2>
                    <p className="text-xs text-gray-500">Traces how fields flow into workbook visualizations</p>
                  </div>
                  <span className="px-3 py-1 bg-purple-50 border border-purple-200 rounded-full text-xs font-semibold text-purple-700">
                    {logicGraph?.nodes?.length || 0} Nodes
                  </span>
                </div>
                <div className="flex-1 relative min-h-[450px]">
                  <LogicGraphCanvas graph={logicGraph} />
                </div>
              </div>
            )}

            {/* Tab 3: Table Classifications & Quality */}
            {activeTab === 'classifications' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden">
                  <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Table Schema Classifications</h2>
                    <p className="text-xs text-gray-500">FACT vs DIMENSION classification driven by primary column checks</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                      <thead className="bg-gray-55 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        <tr>
                          <th className="px-6 py-3 text-left">Table Name</th>
                          <th className="px-6 py-3 text-left">Classification</th>
                          <th className="px-6 py-3 text-left">Quality Assessment</th>
                          <th className="px-6 py-3 text-right">Estimated Rows</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {modelIntelligence?.classifications?.map((c, i) => (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="px-6 py-4 font-semibold text-gray-900">{c.table_name}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                c.classification === 'FACT'
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                  : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                              }`}>
                                {c.classification}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-xs font-semibold">
                                {c.join_quality || 'HIGH'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right text-gray-600 font-mono">
                              ~5,000
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden">
                  <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Fields &amp; Columns Integrity</h2>
                    <p className="text-xs text-gray-500">Auto-detected data types and profiling from TML worksheets</p>
                  </div>
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {modelIntelligence?.data_quality?.map((q, i) => (
                      <div key={i} className="border border-gray-100 rounded-lg p-4 bg-gray-50/50">
                        <div className="font-semibold text-gray-900 mb-2 border-b pb-1 text-sm flex items-center justify-between">
                          <span>Table: {q.table_name}</span>
                          <span className="text-xs text-gray-400 font-normal">{q.columns?.length || 0} fields</span>
                        </div>
                        <div className="max-h-40 overflow-y-auto space-y-1">
                          {q.columns?.slice(0, 10).map((col, idx) => (
                            <div key={idx} className="flex justify-between text-xs text-gray-600 bg-white p-1.5 border border-gray-100 rounded">
                              <span className="font-medium text-gray-800 font-sans">{col.column_name}</span>
                              <span className="font-mono text-gray-400">{col.data_type}</span>
                            </div>
                          ))}
                          {q.columns?.length > 10 && (
                            <div className="text-[11px] text-gray-400 italic text-center pt-1">
                              + {q.columns.length - 10} more columns
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 4: Enhancements Guidance */}
            {activeTab === 'enhancements' && (
              <div className="space-y-6">
                <ModelEnhancementAlert migrationId={migrationId} />

                <div className="bg-white rounded-xl border border-gray-200 shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Info className="w-5 h-5 text-blue-600" />
                    How to apply Power BI Model Enhancements
                  </h3>
                  <div className="prose prose-sm text-gray-600 max-w-none space-y-4">
                    <p>
                      ThoughtSpot has a flexible runtime aggregation layer which allows formulas to use complex window functions
                      (like cumulative calculations or running averages) that refer directly to tables in the database.
                    </p>
                    <p>
                      In Power BI, these are handled differently:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <div className="font-semibold text-gray-900 mb-1">Method A: Power Query (M script)</div>
                        <p className="text-xs text-gray-600">
                          We auto-generate Power Query script blocks. You can paste these directly into the Advanced Editor
                          in Power Query to pre-calculate accumulators during the refresh load. Highly recommended for performance.
                        </p>
                      </div>
                      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <div className="font-semibold text-gray-900 mb-1">Method B: DAX Calculated Columns</div>
                        <p className="text-xs text-gray-600">
                          We auto-generate DAX Calculated Column templates. You can add these inside your tables inside Power BI
                          Desktop. Useful for smaller transaction tables or static date dimensional lookups.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
