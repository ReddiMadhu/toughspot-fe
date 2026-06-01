/**
 * Page 1: Source Dashboard Exploration — Agent-Driven
 *
 * Flow:
 *   1. On mount, auto-triggers Agent 1 (Source Analysis) if idle
 *   2. Shows AgentProcessingOverlay with streaming events during processing
 *   3. Crossfades to full dashboard when agent completes
 *   4. On revisit (agent already completed), shows dashboard immediately
 */
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Grid,
  Layout,
  Code,
  Database,
  Search,
  ChevronDown,
  ChevronUp,
  Loader,
  BarChart2,
} from 'lucide-react';
import toast from 'react-hot-toast';

import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import useMigrationCacheStore from '../../stores/migrationCacheStore';
import MigrationSidebar from '../../components/migration/MigrationSidebar';
import AgentProcessingOverlay from '../../components/migration/AgentProcessingOverlay';
import { useAgentTrigger } from '../../hooks/useAgentTrigger';
import useAgentStore from '../../stores/agentStore';

export default function Page1DataUnderstanding() {
  const navigate = useNavigate();
  const { migrationId } = useParams();
  const loadWorkbookMetadata = useMigrationCacheStore(
    (state) => state.loadWorkbookMetadata
  );

  const agentState = useAgentStore((state) => state.agents.source_analysis);
  const { trigger, retry, status, progress, events, error, subPhase, message } = useAgentTrigger(migrationId, 'source_analysis');

  const [metadata, setMetadata] = useState(null);
  const [isLoadingResults, setIsLoadingResults] = useState(false);

  // Search filters
  const [worksheetSearch, setWorksheetSearch] = useState('');
  const [calcFieldSearch, setCalcFieldSearch] = useState('');
  const [tableSearch, setTableSearch] = useState('');

  // Formula expansion state
  const [expandedFormulas, setExpandedFormulas] = useState(new Set());

  // Selected Worksheet for cross-filtering calculated fields
  const [selectedWorksheet, setSelectedWorksheet] = useState(null);

  // Auto-trigger Agent 1 on mount (only if idle)
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
    if (status === 'completed' && migrationId && !metadata) {
      loadResults();
    }
  }, [status, migrationId]);

  const loadResults = async () => {
    setIsLoadingResults(true);
    try {
      const data = await loadWorkbookMetadata(migrationId, true);
      setMetadata(data);
    } catch (error) {
      console.error('Failed to load metadata:', error);
      toast.error('Failed to load migration data.');
    } finally {
      setIsLoadingResults(false);
    }
  };

  const handleNext = () => {
    navigate(`/migration-wizard/${migrationId}/model-intelligence`);
  };

  const toggleFormula = (fieldName) => {
    const newExpanded = new Set(expandedFormulas);
    if (newExpanded.has(fieldName)) {
      newExpanded.delete(fieldName);
    } else {
      newExpanded.add(fieldName);
    }
    setExpandedFormulas(newExpanded);
  };

  // ── Caption Resolution Helpers ────────────────────────────────────────────────
  const buildCalculationMap = () => {
    const map = {};
    metadata?.workbooks?.forEach((wb) => {
      wb.calculated_fields.forEach((cf) => {
        const displayName = cf.caption || cf.name;
        map[cf.id || cf.name] = displayName;
      });
    });
    return map;
  };

  const replaceInternalNames = (formula, calcMap) => {
    if (!formula) return '';
    let updated = formula;
    const keys = Object.keys(calcMap).sort((a, b) => b.length - a.length);
    keys.forEach((internalName) => {
      const readableName = calcMap[internalName];
      try {
        const bracketRegex = new RegExp(`\\[${internalName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\]`, 'g');
        updated = updated.replace(bracketRegex, `[${readableName}]`);
      } catch {
        updated = updated.split(`[${internalName}]`).join(`[${readableName}]`);
      }
    });
    return updated;
  };

  // ── Data Helpers ──────────────────────────────────────────────────────────────
  const getAllWorksheets = () => {
    if (!metadata?.workbooks) return [];
    const sheets = metadata.workbooks.flatMap((wb) =>
      wb.worksheets.map((ws) => ({ ...ws, workbook: wb.filename }))
    );
    if (!worksheetSearch) return sheets;
    return sheets.filter((ws) =>
      ws.name.toLowerCase().includes(worksheetSearch.toLowerCase())
    );
  };

  const getAllCalculatedFields = () => {
    if (!metadata?.workbooks) return [];
    const calcMap = buildCalculationMap();
    const fields = metadata.workbooks.flatMap((wb) =>
      wb.calculated_fields.map((cf) => ({
        id: cf.id,
        name: cf.caption || cf.name,
        formula: replaceInternalNames(cf.formula, calcMap),
        workbook: wb.filename,
        role: cf.role,
        datatype: cf.datatype,
      }))
    );
    let filtered = fields;
    if (calcFieldSearch) {
      const search = calcFieldSearch.toLowerCase();
      filtered = fields.filter(
        (cf) =>
          cf.name?.toLowerCase().includes(search) ||
          cf.formula?.toLowerCase().includes(search)
      );
    }
    if (selectedWorksheet) {
      const wsCalcNames = new Set();
      selectedWorksheet.measures?.forEach((m) => {
        if (m.type === 'calculated') wsCalcNames.add(m.name);
      });
      const allCalcNames = new Set(fields.map((f) => f.name));
      selectedWorksheet.dimensions?.forEach((d) => {
        if (allCalcNames.has(d)) wsCalcNames.add(d);
      });
      filtered = filtered.filter((cf) => wsCalcNames.has(cf.name));
    }
    return filtered;
  };

  const getAllTables = () => {
    if (!metadata?.workbooks) return [];
    const allTables = metadata.workbooks.flatMap((wb) =>
      (wb.data_sources || []).flatMap((ds) =>
        (ds.table_details || []).map((table) => ({
          ...table,
          data_source: ds.name,
          workbook: wb.filename,
        }))
      )
    );
    const uniqueTables = [];
    const seen = new Set();
    for (const table of allTables) {
      if (!seen.has(table.display_name)) {
        seen.add(table.display_name);
        uniqueTables.push(table);
      }
    }
    if (!tableSearch) return uniqueTables;
    return uniqueTables.filter((t) =>
      t.display_name.toLowerCase().includes(tableSearch.toLowerCase())
    );
  };

  // ── Processing State — Show Agent Overlay ─────────────────────────────────
  if (status === 'running' || status === 'idle') {
    return (
      <div className="h-screen flex overflow-hidden" style={{ backgroundColor: '#e5e5e5' }}>
        <MigrationSidebar currentStep={1} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="bg-white border-b border-gray-200 shadow-sm px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-900">Source Dashboard Exploration</h1>
            <p className="text-sm text-gray-600 mt-1">
              Agent analyzing your ThoughtSpot SpotApp...
            </p>
          </div>
          <AgentProcessingOverlay
            agentName="source_analysis"
            agentDisplayName="Source Analysis Agent"
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
        <MigrationSidebar currentStep={1} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="bg-white border-b border-gray-200 shadow-sm px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-900">Source Dashboard Exploration</h1>
          </div>
          <AgentProcessingOverlay
            agentName="source_analysis"
            agentDisplayName="Source Analysis Agent"
            events={events}
            status="failed"
            error={error}
            onRetry={retry}
          />
        </div>
      </div>
    );
  }

  // ── Loading results after agent completed ─────────────────────────────────
  if (isLoadingResults || !metadata) {
    return (
      <div className="h-screen flex overflow-hidden" style={{ backgroundColor: '#e5e5e5' }}>
        <MigrationSidebar currentStep={1} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader className="w-8 h-8 animate-spin text-primary-650 mx-auto mb-4" />
            <p className="text-gray-700 font-medium">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Dashboard Results ─────────────────────────────────────────────────────
  const worksheets = getAllWorksheets();
  const calculatedFields = getAllCalculatedFields();
  const tables = getAllTables();

  return (
    <div className="h-screen flex overflow-hidden" style={{ backgroundColor: '#e5e5e5' }}>
      <MigrationSidebar currentStep={1} />

      <div className="flex-1 flex flex-col overflow-hidden results-fade-in">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 shadow-sm px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Source Dashboard Exploration</h1>
              <p className="text-sm text-gray-600 mt-1">
                Complete inspection of your ThoughtSpot SpotApp — liveboards, visuals, formulas &amp; tables
              </p>
            </div>
            <Button onClick={handleNext} size="md" className="px-6">
              Next Step
            </Button>
          </div>
        </div>

        {/* Summary Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="grid grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Layout className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{metadata.summary?.total_dashboards || 1}</div>
                <div className="text-xs text-gray-600 font-medium uppercase tracking-wide">Liveboards</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Grid className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{metadata.summary?.total_worksheets || 0}</div>
                <div className="text-xs text-gray-600 font-medium uppercase tracking-wide">Visuals</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Database className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{metadata.summary?.total_tables || 0}</div>
                <div className="text-xs text-gray-600 font-medium uppercase tracking-wide">Data Tables</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Code className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{metadata.summary?.total_calculated_fields || 0}</div>
                <div className="text-xs text-gray-600 font-medium uppercase tracking-wide">TML Formulas</div>
              </div>
            </div>
          </div>
        </div>

        {/* Grid: Worksheets + Calculated Fields */}
        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* Worksheets / Visualizations Card */}
            <Card className="flex flex-col" style={{ height: '450px' }}>
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-3">
                  <BarChart2 className="w-5 h-5 text-blue-600" />
                  Visuals ({worksheets.length})
                </h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search visuals..."
                    value={worksheetSearch}
                    onChange={(e) => setWorksheetSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-2">
                  {worksheets.length === 0 && (
                    <p className="text-sm text-gray-400 italic text-center py-8">No visuals found</p>
                  )}
                  {worksheets.map((ws, idx) => {
                    const isSelected = selectedWorksheet?.name === ws.name;
                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg transition-colors cursor-pointer border ${
                          isSelected
                            ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-300'
                            : 'bg-gray-50 border-transparent hover:bg-gray-100'
                        }`}
                        onClick={() => setSelectedWorksheet(isSelected ? null : ws)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 text-sm">{ws.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-500">
                                Chart: <span className="font-medium text-gray-700">{ws.ts_chart_type || ws.mark_type || '—'}</span>
                              </span>
                              <span className="text-xs text-gray-400">·</span>
                              <span className="text-xs text-gray-500">
                                {(ws.measures || ws.rows || []).length} Y-Axis · {(ws.dimensions || ws.cols || []).length} X-Axis
                              </span>
                            </div>
                          </div>
                          {isSelected ? (
                            <ChevronUp className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                          )}
                        </div>
                        {isSelected && (
                          <div className="mt-3 pt-3 border-t border-blue-200 text-xs space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <span className="font-semibold text-gray-700 block mb-1">Cols (X-Axis) / Dimensions:</span>
                                <div className="max-h-24 overflow-y-auto bg-white border border-blue-100 rounded p-1 space-y-0.5">
                                  {(ws.dimensions || ws.cols || []).length > 0 ? (ws.dimensions || ws.cols || []).map((d, i) => (
                                    <div key={i} className="truncate text-gray-600 pl-1 border-l-2 border-purple-200">{typeof d === 'object' ? d.name || d.caption : String(d)}</div>
                                  )) : <span className="text-gray-400 italic pl-1">None</span>}
                                </div>
                              </div>
                              <div>
                                <span className="font-semibold text-gray-700 block mb-1">Rows (Y-Axis) / Measures:</span>
                                <div className="max-h-24 overflow-y-auto bg-white border border-blue-100 rounded p-1 space-y-0.5">
                                  {(ws.measures || ws.rows || []).length > 0 ? (ws.measures || ws.rows || []).map((m, i) => (
                                    <div key={i} className="truncate pl-1 border-l-2 border-green-200 text-gray-600">{typeof m === 'object' ? m.name || m.caption : String(m)}</div>
                                  )) : <span className="text-gray-400 italic pl-1">None</span>}
                                </div>
                              </div>
                            </div>
                            {ws.source_liveboard && (
                              <div className="pt-1">
                                <span className="text-gray-400">Source Liveboard: </span>
                                <span className="font-medium text-gray-700">{ws.source_liveboard}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>

            {/* Calculated Fields / TML Formulas Card */}
            <Card className="flex flex-col" style={{ height: '450px' }}>
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-3">
                  <Code className="w-5 h-5 text-green-600" />
                  TML Formulas ({calculatedFields.length})
                </h2>
                {selectedWorksheet && (
                  <div className="flex items-center gap-2 mb-2 p-2 bg-blue-50 rounded border border-blue-100 text-xs">
                    <span className="font-medium text-blue-800">
                      Filtered by visual: {selectedWorksheet.name}
                    </span>
                    <button
                      onClick={() => setSelectedWorksheet(null)}
                      className="ml-auto text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      Clear ✕
                    </button>
                  </div>
                )}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search fields or formulas..."
                    value={calcFieldSearch}
                    onChange={(e) => setCalcFieldSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-2">
                  {calculatedFields.length === 0 && (
                    <p className="text-sm text-gray-400 italic text-center py-8">
                      {selectedWorksheet ? 'No formulas found for this visual' : 'No calculated fields found'}
                    </p>
                  )}
                  {calculatedFields.map((cf, idx) => (
                    <div
                      key={idx}
                      className="border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 transition-colors"
                    >
                      <div
                        className="p-3 bg-white cursor-pointer flex items-center justify-between"
                        onClick={() => toggleFormula(cf.name)}
                      >
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-sm truncate">{cf.name}</h3>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              cf.role === 'measure' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                            }`}>
                              {cf.role || 'measure'}
                            </span>
                            {cf.datatype && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                                {cf.datatype}
                              </span>
                            )}
                          </div>
                        </div>
                        {expandedFormulas.has(cf.name) ? (
                          <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
                        )}
                      </div>
                      {expandedFormulas.has(cf.name) && (
                        <div className="px-3 py-2 bg-gray-50 border-t border-gray-200">
                          <code className="text-xs text-gray-800 font-mono break-all whitespace-pre-wrap">
                            {cf.formula || <span className="text-gray-400 italic">No formula expression</span>}
                          </code>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Data Tables Card — Full Width */}
          <Card className="flex flex-col" style={{ height: '500px' }}>
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-3">
                <Database className="w-5 h-5 text-orange-600" />
                Data Tables ({tables.length})
              </h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tables..."
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                {tables.length === 0 && (
                  <p className="text-sm text-gray-400 italic text-center py-8">No tables found</p>
                )}
                {tables.map((table, idx) => {
                  const colNames = Array.isArray(table.columns)
                    ? table.columns
                    : (table.column_details || []).map((c) => c.name);
                  return (
                    <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900">{table.display_name}</h3>
                            {table.data_source && (
                              <p className="text-xs text-gray-500 mt-0.5">
                                Source: <span className="font-medium">{table.data_source}</span>
                              </p>
                            )}
                          </div>
                          <span className="text-sm text-gray-600">
                            {table.row_count?.toLocaleString() || '—'} rows × {colNames.length} columns
                          </span>
                        </div>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                          <thead className="bg-gray-100">
                            <tr>
                              {colNames.slice(0, 10).map((col, i) => (
                                <th key={i} className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">
                                  {col}
                                </th>
                              ))}
                              {colNames.length > 10 && (
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 italic">
                                  +{colNames.length - 10} more
                                </th>
                              )}
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            <tr>
                              <td
                                colSpan={Math.min(colNames.length, 10) + (colNames.length > 10 ? 1 : 0)}
                                className="px-4 py-6 text-center text-xs text-gray-400 italic"
                              >
                                {`${colNames.length} columns · ${table.row_count?.toLocaleString() || '~5,000'} estimated rows`}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
