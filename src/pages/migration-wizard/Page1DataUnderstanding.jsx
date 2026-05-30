/**
 * Page 1: Data Understanding - COMMAND CENTER DASHBOARD for ThoughtSpot
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
  Loader
} from 'lucide-react';
import toast from 'react-hot-toast';

import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import useMigrationCacheStore from '../../stores/migrationCacheStore';
import MigrationSidebar from '../../components/migration/MigrationSidebar';

export default function Page1DataUnderstanding() {
  const navigate = useNavigate();
  const { migrationId } = useParams();
  const loadWorkbookMetadata = useMigrationCacheStore(
    (state) => state.loadWorkbookMetadata
  );

  const [isLoading, setIsLoading] = useState(true);
  const [metadata, setMetadata] = useState(null);

  // Search filters
  const [worksheetSearch, setWorksheetSearch] = useState('');
  const [calcFieldSearch, setCalcFieldSearch] = useState('');
  const [tableSearch, setTableSearch] = useState('');

  const [expandedFormulas, setExpandedFormulas] = useState(new Set());
  const [selectedWorksheet, setSelectedWorksheet] = useState(null);

  useEffect(() => {
    if (!migrationId) {
      toast.error('No migration found. Please start a migration first.');
      navigate('/');
      return;
    }

    loadComprehensiveMetadata(migrationId);
  }, [migrationId, navigate]);

  const loadComprehensiveMetadata = async (id) => {
    setIsLoading(true);
    try {
      const data = await loadWorkbookMetadata(id);
      setMetadata(data);
    } catch (error) {
      console.error('Failed to load metadata:', error);
      toast.error('Failed to load migration data.');
    } finally {
      setIsLoading(false);
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

  const getAllWorksheets = () => {
    if (!metadata?.workbooks) return [];
    const sheets = metadata.workbooks.flatMap(wb =>
      wb.worksheets.map(ws => ({ ...ws, workbook: wb.filename }))
    );

    if (!worksheetSearch) return sheets;
    return sheets.filter(ws =>
      ws.name.toLowerCase().includes(worksheetSearch.toLowerCase())
    );
  };

  const getAllCalculatedFields = () => {
    if (!metadata?.workbooks) return [];
    const fields = metadata.workbooks.flatMap(wb =>
      wb.calculated_fields.map(cf => ({
        id: cf.id,
        name: cf.name,
        formula: cf.formula,
        workbook: wb.filename,
        role: cf.role,
        datatype: cf.datatype
      }))
    );

    let filtered = fields;
    if (calcFieldSearch) {
      const search = calcFieldSearch.toLowerCase();
      filtered = fields.filter(cf =>
        cf.name?.toLowerCase().includes(search) ||
        cf.formula?.toLowerCase().includes(search)
      );
    }

    if (selectedWorksheet) {
      const wsCalcNames = new Set(selectedWorksheet.measures?.map(m => m.name) || []);
      filtered = filtered.filter(cf => wsCalcNames.has(cf.name));
    }

    return filtered;
  };

  const getAllTables = () => {
    if (!metadata?.workbooks) return [];
    const allTables = metadata.workbooks.flatMap(wb =>
      (wb.data_sources || []).flatMap(ds =>
        (ds.table_details || []).map(table => ({
          ...table,
          data_source: ds.name,
          workbook: wb.filename
        }))
      )
    );

    const uniqueTables = [];
    const seenTableNames = new Set();
    for (const table of allTables) {
      if (!seenTableNames.has(table.display_name)) {
        seenTableNames.add(table.display_name);
        uniqueTables.push(table);
      }
    }

    if (!tableSearch) return uniqueTables;
    return uniqueTables.filter(t =>
      t.display_name.toLowerCase().includes(tableSearch.toLowerCase())
    );
  };

  if (isLoading) {
    return (
      <div className="h-screen flex overflow-hidden" style={{ backgroundColor: '#e5e5e5' }}>
        <MigrationSidebar currentStep={1} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader className="w-8 h-8 animate-spin text-primary-650 mx-auto mb-4" />
            <p className="text-gray-655 font-medium">Loading comprehensive metadata...</p>
          </div>
        </div>
      </div>
    );
  }

  const worksheets = getAllWorksheets();
  const calculatedFields = getAllCalculatedFields();
  const tables = getAllTables();

  return (
    <div className="h-screen flex overflow-hidden" style={{ backgroundColor: '#e5e5e5' }}>
      <MigrationSidebar currentStep={1} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 shadow-sm px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Source Object Exploration</h1>
              <p className="text-sm text-gray-600 mt-1">
                Explore worksheets, tables, and calculations extracted from ThoughtSpot TML
              </p>
            </div>
            <Button onClick={handleNext} size="md" className="px-6">
              Next Step
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Summary Row */}
            {metadata?.summary && (
              <div className="grid grid-cols-4 gap-6">
                <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Layout className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{metadata.summary.total_dashboards || 1}</div>
                    <div className="text-xs text-gray-500 font-semibold uppercase">Dashboards / Models</div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Grid className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{metadata.summary.total_worksheets}</div>
                    <div className="text-xs text-gray-500 font-semibold uppercase">Worksheets</div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Database className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{metadata.summary.total_tables}</div>
                    <div className="text-xs text-gray-500 font-semibold uppercase">Data Tables</div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Code className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{metadata.summary.total_calculated_fields}</div>
                    <div className="text-xs text-gray-500 font-semibold uppercase">TML Formulas</div>
                  </div>
                </div>
              </div>
            )}

            {/* Tables sections */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Worksheets */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[500px]">
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                  <h3 className="font-bold text-gray-950 flex items-center gap-2">
                    <Grid className="w-4 h-4 text-blue-600" /> Worksheets ({worksheets.length})
                  </h3>
                  <div className="relative mt-2">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search worksheets..."
                      value={worksheetSearch}
                      onChange={(e) => setWorksheetSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-1.5 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>
                </div>
                <div className="flex-1 overflow-auto divide-y divide-gray-100">
                  {worksheets.map((ws, i) => (
                    <div
                      key={i}
                      onClick={() => setSelectedWorksheet(selectedWorksheet?.name === ws.name ? null : ws)}
                      className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedWorksheet?.name === ws.name ? 'bg-primary-50 border-l-4 border-primary-650' : ''
                      }`}
                    >
                      <h4 className="font-semibold text-gray-900 text-sm">{ws.name}</h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {ws.measures?.length || 0} measures · {ws.dimensions?.length || 0} dimensions
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* TML Formulas */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[500px] lg:col-span-2">
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                  <h3 className="font-bold text-gray-950 flex items-center gap-2">
                    <Code className="w-4 h-4 text-green-600" /> TML Formulas ({calculatedFields.length})
                  </h3>
                  <div className="relative mt-2">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search formulas..."
                      value={calcFieldSearch}
                      onChange={(e) => setCalcFieldSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-1.5 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>
                </div>
                <div className="flex-1 overflow-auto divide-y divide-gray-100">
                  {calculatedFields.map((cf, i) => {
                    const isExpanded = expandedFormulas.has(cf.name);
                    return (
                      <div key={i} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between cursor-pointer" onClick={() => toggleFormula(cf.name)}>
                          <div>
                            <h4 className="font-semibold text-gray-900 text-sm">{cf.name}</h4>
                            <p className="text-xs text-gray-450 mt-0.5">{cf.workbook}</p>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                            cf.role === 'measure' ? 'bg-green-50 text-green-800' : 'bg-blue-50 text-blue-800'
                          }`}>
                            {cf.role}
                          </span>
                        </div>
                        {isExpanded && (
                          <div className="mt-3 p-3 bg-gray-50 border border-gray-100 rounded-lg font-mono text-xs text-gray-800 whitespace-pre-wrap">
                            {cf.formula}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Tables List */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-bold text-gray-950 flex items-center gap-2">
                  <Database className="w-4 h-4 text-orange-600" /> Data Tables ({tables.length})
                </h3>
                <div className="relative w-64">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search tables..."
                    value={tableSearch}
                    onChange={(e) => setTableSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-1.5 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-55">
                    <tr>
                      <th className="px-6 py-3 text-left font-semibold text-gray-500 uppercase tracking-wider">Table Name</th>
                      <th className="px-6 py-3 text-left font-semibold text-gray-500 uppercase tracking-wider">Source TML</th>
                      <th className="px-6 py-3 text-right font-semibold text-gray-500 uppercase tracking-wider">Columns</th>
                      <th className="px-6 py-3 text-right font-semibold text-gray-500 uppercase tracking-wider">Estimated Rows</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {tables.map((t, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-gray-900">{t.display_name}</td>
                        <td className="px-6 py-4 text-gray-500 text-xs font-mono">{t.workbook}</td>
                        <td className="px-6 py-4 text-right text-gray-700">{t.column_count}</td>
                        <td className="px-6 py-4 text-right text-gray-700">{t.row_count?.toLocaleString()}</td>
                      </tr>
                    ))}
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
