/**
 * Validation Summary - Display validation results
 */
import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

import api from '../../services/api';
import Card from '../common/Card';

export default function ValidationSummary({ migrationId }) {
  const [validationData, setValidationData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadValidationResults = async () => {
    try {
      const { data } = await api.getValidationResults(migrationId);
      setValidationData(data);
      return data;
    } catch (error) {
      console.error('Failed to load validation results:', error);
      setValidationData(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadValidationResults();
  }, [migrationId]);

  // Auto-poll every 10s while no results are loaded (migration may still be in progress)
  useEffect(() => {
    if (validationData && validationData.results && validationData.results.length > 0) {
      return; // Already have data, no need to poll
    }

    const timer = setInterval(async () => {
      const result = await loadValidationResults();
      if (result && result.results && result.results.length > 0) {
        clearInterval(timer);
      }
    }, 10000);

    return () => clearInterval(timer);
  }, [migrationId, validationData]);

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-gray-500 text-sm">Loading validation results...</p>
      </div>
    );
  }

  if (!validationData || !validationData.results || validationData.results.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <p className="text-lg font-medium mb-2">No validation results yet</p>
        <p className="text-sm mb-4">
          Validation results will appear here once the migration pipeline completes.
        </p>
        <button
          onClick={loadValidationResults}
          className="text-sm text-primary-600 hover:text-primary-800 underline"
        >
          Refresh Now
        </button>
      </div>
    );
  }

  const summary = validationData.summary;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-gray-500 mb-1">Total Conversions</p>
          <p className="text-2xl font-bold text-gray-900">
            {summary.total_conversions}
          </p>
        </Card>

        <Card className="p-4 bg-emerald-50 border-emerald-200">
          <p className="text-sm text-emerald-700 mb-1">Passed</p>
          <p className="text-2xl font-bold text-emerald-900">
            {summary.passed}
          </p>
        </Card>

        <Card className="p-4 bg-red-50 border-red-200">
          <p className="text-sm text-red-700 mb-1">Failed</p>
          <p className="text-2xl font-bold text-red-900">
            {summary.failed}
          </p>
        </Card>

        <Card className="p-4 bg-primary-50 border-primary-200">
          <p className="text-sm text-primary-700 mb-1">Pass Rate</p>
          <p className="text-2xl font-bold text-primary-950">
            {summary.pass_rate.toFixed(1)}%
          </p>
        </Card>
      </div>

      {/* Detailed Results */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Validation Details
        </h3>

        <div className="space-y-4">
          {validationData.results.map((result, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${
                result.overall_passed
                  ? 'bg-emerald-50/30 border-emerald-100'
                  : 'bg-red-50/30 border-red-100'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {result.overall_passed ? (
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <span className="font-semibold text-gray-900">
                    {result.measure_name || `Measure ${index + 1}`}
                  </span>
                </div>

                {result.correction_attempts > 0 && (
                  <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full font-medium">
                    {result.correction_attempts} correction
                    {result.correction_attempts > 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {/* Test Slices */}
              {result.test_slices && result.test_slices.length > 0 && (
                <div className="mt-3 space-y-2">
                  {result.test_slices.map((slice, sliceIndex) => (
                    <div
                      key={sliceIndex}
                      className="text-sm bg-white rounded p-3 border border-gray-155"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-700">
                          Test Slice {sliceIndex + 1}
                        </span>
                        <span
                          className={`text-xs font-bold ${
                            slice.passed ? 'text-emerald-600' : 'text-red-600'
                          }`}
                        >
                          {slice.passed ? '✓ PASS' : '✗ FAIL'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-gray-500">Dimensions:</span>
                          <span className="ml-2 text-gray-900 font-medium">
                            {JSON.stringify(slice.dimensions)}
                          </span>
                        </div>

                        <div>
                          <span className="text-gray-500">Error Category:</span>
                          <span className="ml-2 text-gray-900 font-medium">
                            {slice.error_category}
                          </span>
                        </div>

                        <div>
                          <span className="text-gray-500">ThoughtSpot Value:</span>
                          <span className="ml-2 text-gray-900 font-mono font-medium">
                            {(() => {
                              const val = slice.source_value ?? slice.tableau_value;
                              return typeof val === 'number' ? val.toFixed(2) : val || 'N/A';
                            })()}
                          </span>
                        </div>

                        <div>
                          <span className="text-gray-500">DAX Value:</span>
                          <span className="ml-2 text-gray-900 font-mono font-medium">
                            {typeof slice.dax_value === 'number' ? slice.dax_value.toFixed(2) : slice.dax_value || 'N/A'}
                          </span>
                        </div>

                        {!slice.passed && (
                          <>
                            <div>
                              <span className="text-gray-500">Delta:</span>
                              <span className="ml-2 text-red-600 font-mono font-semibold">
                                {slice.delta?.toFixed(4)}
                              </span>
                            </div>

                            <div>
                              <span className="text-gray-500">Relative Error:</span>
                              <span className="ml-2 text-red-600 font-mono font-semibold">
                                {(slice.relative_error * 100).toFixed(2)}%
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
