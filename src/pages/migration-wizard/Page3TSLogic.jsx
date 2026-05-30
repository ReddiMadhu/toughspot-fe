/**
 * Page 3: Field Mapping - ThoughtSpot Logic Mapping
 */
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Calculator, Sliders, BarChart2, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

import Button from '../../components/common/Button';
import MigrationSidebar from '../../components/migration/MigrationSidebar';
import useMigrationCacheStore from '../../stores/migrationCacheStore';
import migrationApi from '../../services/migrationApi';

export default function Page3TSLogic() {
  const navigate = useNavigate();
  const { migrationId } = useParams();
  const loadWorkbookMetadata = useMigrationCacheStore(
    (state) => state.loadWorkbookMetadata
  );

  const [isLoading, setIsLoading] = useState(true);
  const [metadata, setMetadata] = useState(null);
  const [filters, setFilters] = useState([]);

  useEffect(() => {
    if (!migrationId) {
      toast.error('No migration found. Please start a migration first.');
      navigate('/');
      return;
    }
    loadData();
  }, [migrationId, navigate]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [metaData, filtersData] = await Promise.all([
        loadWorkbookMetadata(migrationId),
        migrationApi.getFilters(migrationId)
      ]);
      setMetadata(metaData);
      setFilters(filtersData.filters || []);
    } catch (error) {
      console.error('Failed to load metadata:', error);
      toast.error('Failed to load ThoughtSpot metadata');
    } finally {
      setIsLoading(false);
    }
  };

  const getCalculatedFields = () => {
    if (!metadata?.workbooks) return [];
    return metadata.workbooks.flatMap(wb =>
      wb.calculated_fields.map(cf => ({
        ...cf,
        name: cf.name,
        formula: cf.formula,
        workbook: wb.filename
      }))
    );
  };

  const getMeasures = () => {
    if (!metadata?.workbooks) return [];
    const measures = [];
    metadata.workbooks.forEach(wb => {
      wb.data_sources?.forEach(ds => {
        ds.table_details?.forEach(table => {
          table.column_details?.forEach(col => {
            if (col.role === 'measure') {
              measures.push({
                name: col.name,
                table: table.display_name || table.table_name,
                datatype: col.data_type || col.datatype,
                aggregation: col.aggregation || 'SUM',
                workbook: wb.filename
              });
            }
          });
        });
      });
    });
    return measures;
  };

  if (isLoading) {
    return (
      <div className="h-screen flex overflow-hidden" style={{ backgroundColor: '#e5e5e5' }}>
        <MigrationSidebar currentStep={3} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader className="w-8 h-8 animate-spin text-primary-650 mx-auto mb-4" />
            <p className="text-gray-655 font-medium">Loading ThoughtSpot metadata...</p>
          </div>
        </div>
      </div>
    );
  }

  const calculatedFields = getCalculatedFields();
  const measures = getMeasures();

  return (
    <div className="h-screen flex overflow-hidden" style={{ backgroundColor: '#e5e5e5' }}>
      <MigrationSidebar currentStep={3} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 shadow-sm px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Field Mapping & Logic</h1>
              <p className="text-sm text-gray-600 mt-1">
                Review ThoughtSpot formulas, filters, and column definitions
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                onClick={() => navigate(`/migration-wizard/${migrationId}/model-intelligence`)}
              >
                Back
              </Button>
              <Button onClick={() => navigate(`/migration-wizard/${migrationId}/formula-conversion`)}>
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
                  <Calculator className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{calculatedFields.length}</div>
                  <div className="text-xs text-gray-500 font-semibold uppercase">Calculated Fields</div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm flex items-center gap-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Sliders className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{filters.length}</div>
                  <div className="text-xs text-gray-500 font-semibold uppercase">Worksheet Filters</div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm flex items-center gap-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <BarChart2 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{measures.length}</div>
                  <div className="text-xs text-gray-500 font-semibold uppercase">Measures</div>
                </div>
              </div>
            </div>

            {/* Calculated Fields Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-blue-600" />
                  Calculated Fields ({calculatedFields.length})
                </h2>
              </div>
              <div className="overflow-x-auto font-sans">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-55 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-3 text-left">Calculated Field</th>
                      <th className="px-6 py-3 text-left">TML Formula</th>
                      <th className="px-6 py-3 text-left">Type</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100 text-sm">
                    {calculatedFields.map((field, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-gray-900">{field.name}</td>
                        <td className="px-6 py-4 text-gray-700 font-mono text-xs max-w-md truncate" title={field.formula}>
                          {field.formula || 'N/A'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            field.role === 'measure' ? 'bg-green-150 text-green-800' : 'bg-blue-150 text-blue-800'
                          }`}>
                            {field.role || 'measure'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Filters Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-purple-600" />
                  Worksheet Filters ({filters.length})
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-55 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-3 text-left">Filter Column</th>
                      <th className="px-6 py-3 text-left">Worksheet</th>
                      <th className="px-6 py-3 text-left">Values</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {filters.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="px-6 py-8 text-center text-gray-500">
                          No active filters found in ThoughtSpot models
                        </td>
                      </tr>
                    ) : (
                      filters.map((filter, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 font-semibold text-gray-900">{filter.column}</td>
                          <td className="px-6 py-4 text-gray-700">{filter.worksheet}</td>
                          <td className="px-6 py-4 text-gray-600 font-mono text-xs">{filter.allowable_values?.join(', ') || 'ALL'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Measures Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-green-600" />
                  Source Measures ({measures.length})
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-55 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-3 text-left">Measure Name</th>
                      <th className="px-6 py-3 text-left">Table</th>
                      <th className="px-6 py-3 text-left">Default Aggregation</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {measures.map((measure, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-gray-900">{measure.name}</td>
                        <td className="px-6 py-4 text-gray-700">{measure.table}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-0.5 bg-green-50 text-green-800 border border-green-200 rounded text-xs font-semibold">
                            {measure.aggregation}
                          </span>
                        </td>
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
