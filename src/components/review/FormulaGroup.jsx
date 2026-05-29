import { useState } from 'react';
import { ChevronDown, ChevronRight, FileCode, BookOpen, Search } from 'lucide-react';
import FormulaRow from './FormulaRow.jsx';

const OBJECT_TYPE_CONFIG = {
  Model: { icon: BookOpen, color: 'text-primary-600', bg: 'bg-primary-50', border: 'border-primary-100' },
  Liveboard: { icon: FileCode, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
  Answer: { icon: Search, color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-100' },
  default: { icon: FileCode, color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' },
};

export default function FormulaGroup({ objectName, objectType, conversions }) {
  const [open, setOpen] = useState(true);
  const config = OBJECT_TYPE_CONFIG[objectType] || OBJECT_TYPE_CONFIG.default;
  const Icon = config.icon;

  const highCount = conversions.filter((c) => (c.confidence ?? 0) >= 0.9).length;
  const reviewCount = conversions.filter((c) => c.requires_review).length;

  return (
    <div className={`rounded-lg border ${config.border} overflow-hidden mb-3 animate-slide-up`}>
      {/* Group header */}
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center gap-3 px-4 py-3 ${config.bg} hover:brightness-95 transition-all text-left`}
      >
        <div className={`w-7 h-7 rounded-lg ${config.bg} border ${config.border} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-4 h-4 ${config.color}`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-900 truncate">{objectName || '(Unnamed)'}</span>
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${config.bg} ${config.color} border ${config.border}`}>
              {objectType}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-xs text-gray-500">{conversions.length} formula{conversions.length !== 1 ? 's' : ''}</span>
            {highCount > 0 && (
              <span className="text-[11px] text-emerald-600">✓ {highCount} auto-converted</span>
            )}
            {reviewCount > 0 && (
              <span className="text-[11px] text-amber-600">⚠ {reviewCount} need review</span>
            )}
          </div>
        </div>

        {open
          ? <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
          : <ChevronRight className="w-4 h-4 text-gray-500 flex-shrink-0" />
        }
      </button>

      {/* Formula rows */}
      {open && (
        <div className="p-3 space-y-2 bg-white">
          {conversions.map((conv) => (
            <FormulaRow key={conv.conversion_id || conv.measure_name} conversion={conv} />
          ))}
        </div>
      )}
    </div>
  );
}
