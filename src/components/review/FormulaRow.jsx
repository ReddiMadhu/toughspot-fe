import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { AlertTriangle } from 'lucide-react';
import ConfidenceBadge from './ConfidenceBadge.jsx';

export default function FormulaRow({ conversion }) {
  const [expanded, setExpanded] = useState(false);
  const isManualReview = conversion.requires_review;
  const isLow = (conversion.confidence ?? 0) < 0.6;

  return (
    <div
      className={`rounded-lg border transition-all ${
        isManualReview && isLow
          ? 'border-red-200 bg-red-50/30'
          : isManualReview
          ? 'border-amber-200 bg-amber-50/20'
          : 'border-gray-200 bg-white'
      }`}
    >
      {/* Header row */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-gray-900 truncate">
              {conversion.measure_name}
            </span>
            {conversion.pattern === 'AI_TRANSLATION' ? (
              <span className="text-[9px] font-bold bg-gradient-to-r from-violet-600 to-primary-600 text-white px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm shadow-primary-100 tracking-wide animate-pulse">
                ✨ AI TRANSLATED
              </span>
            ) : (
              <span className="text-[9px] font-mono bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-md">
                {conversion.pattern}
              </span>
            )}

          </div>
          <p className="text-xs text-gray-500 mt-0.5 truncate font-mono">
            {conversion.original_formula}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {isManualReview && (
            <span className="flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
              <AlertTriangle className="w-3 h-3" />
              Review
            </span>
          )}
          <ConfidenceBadge confidence={conversion.confidence} />
          <svg
            className={`w-4 h-4 text-gray-500 transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Expanded formula comparison */}
      {expanded && (
        <div className="px-4 pb-4 animate-fade-in">
          {isManualReview && isLow && (
            <div className="mb-3 flex gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
              <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-700">Manual Review Required</p>
                <p className="text-xs text-red-600 mt-0.5">
                  This formula uses dynamic grouping (query_groups) that has no direct DAX equivalent.
                  Please author the DAX manually in Power BI Desktop.
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* ThoughtSpot formula */}
            <div>
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
                ThoughtSpot Formula
              </p>
              <SyntaxHighlighter
                language="javascript"
                style={oneLight}
                customStyle={{
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  margin: 0,
                  border: '1px solid #e5e7eb',
                  background: '#f9fafb',
                }}
              >
                {conversion.original_formula || '(empty)'}
              </SyntaxHighlighter>
            </div>

            {/* DAX formula */}
            <div>
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                Generated DAX
              </p>
              <SyntaxHighlighter
                language="sql"
                style={oneLight}
                customStyle={{
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  margin: 0,
                  border: '1px solid #e5e7eb',
                  background: '#fffbf0',
                }}
              >
                {conversion.dax_formula || '(no output)'}
              </SyntaxHighlighter>
            </div>
          </div>

          {/* Notes */}
          {conversion.notes && conversion.notes.length > 0 && (
            <div className="mt-3">
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Notes</p>
              <ul className="space-y-0.5">
                {conversion.notes.map((note, i) => (
                  <li key={i} className="text-xs text-gray-500 flex gap-1.5">
                    <span className="text-gray-300">•</span>
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
