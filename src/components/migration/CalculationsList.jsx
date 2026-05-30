/**
 * Calculations List - Display all conversions in a table
 */
import { CheckCircle, AlertCircle, HelpCircle, ExternalLink } from 'lucide-react';

export default function CalculationsList({ conversions, onSelect }) {
  if (!conversions || conversions.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg font-medium mb-2">No conversions yet</p>
        <p className="text-sm">Conversions will appear here once processing begins.</p>
      </div>
    );
  }

  const getStatusIcon = (conversion) => {
    if (conversion.requires_review) {
      return <AlertCircle className="w-5 h-5 text-amber-500" />;
    }
    const confidence = conversion.confidence ?? 1.0;
    if (confidence >= 0.9) {
      return <CheckCircle className="w-5 h-5 text-emerald-500" />;
    }
    if (confidence >= 0.6) {
      return <AlertCircle className="w-5 h-5 text-amber-500" />;
    }
    return <HelpCircle className="w-5 h-5 text-red-500" />;
  };

  const getValidationStatusBadge = (conversion) => {
    if (conversion.requires_review) {
      return (
        <span className="px-2 py-1 rounded text-xs font-medium bg-amber-100 text-amber-800">
          ⚠ Review Needed
        </span>
      );
    }

    const confidence = conversion.confidence ?? 1.0;
    if (confidence >= 0.9) {
      return (
        <span className="px-2 py-1 rounded text-xs font-medium bg-emerald-100 text-emerald-800">
          ✓ High Conf ({Math.round(confidence * 100)}%)
        </span>
      );
    } else if (confidence >= 0.6) {
      return (
        <span className="px-2 py-1 rounded text-xs font-medium bg-amber-100 text-amber-800">
          ⚠ Medium Conf ({Math.round(confidence * 100)}%)
        </span>
      );
    } else {
      return (
        <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
          ✗ Low Conf ({Math.round(confidence * 100)}%)
        </span>
      );
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-16">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Measure / Calculation
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              DAX Formula
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Pattern / Type
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Confidence & Review
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {conversions.map((conversion, index) => (
            <tr
              key={conversion.conversion_id || index}
              className="hover:bg-gray-50 transition-colors"
            >
              <td className="px-4 py-4">
                <div className="flex items-center justify-center">
                  {getStatusIcon(conversion)}
                </div>
              </td>

              <td className="px-4 py-4">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {conversion.measure_name || `Measure_${index}`}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 truncate max-w-xs font-mono">
                    {conversion.original_formula || 'N/A'}
                  </p>
                </div>
              </td>

              <td className="px-4 py-4">
                <code className="text-xs bg-gray-50 border border-gray-100 px-2 py-1 rounded max-w-md block truncate font-mono">
                  {conversion.dax_formula}
                </code>
              </td>

              <td className="px-4 py-4">
                <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                  {conversion.pattern || 'FALLBACK'}
                </span>
              </td>

              <td className="px-4 py-4">
                {getValidationStatusBadge(conversion)}
              </td>

              <td className="px-4 py-4">
                <button
                  onClick={() => onSelect(conversion.conversion_id)}
                  className="text-primary-600 hover:text-primary-700 text-sm font-semibold flex items-center gap-1 hover:underline"
                >
                  View
                  <ExternalLink className="w-3 h-3" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
