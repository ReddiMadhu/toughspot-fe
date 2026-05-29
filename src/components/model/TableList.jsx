/**
 * TableList — shows all tables in the data model with column details.
 *
 * Props:
 *   tables  Array<{ name, source, columns, column_details }>
 *   onTableClick  (tableName) => void   optional selection callback
 *   selectedTable string                currently selected table name
 */
import { Database, Columns3, Hash, Type } from 'lucide-react';

const TYPE_ICON = {
  string:   { label: 'abc', color: 'text-blue-500 bg-blue-50' },
  int64:    { label: '123', color: 'text-emerald-600 bg-emerald-50' },
  double:   { label: '1.0', color: 'text-amber-600 bg-amber-50' },
  boolean:  { label: 'T/F', color: 'text-purple-600 bg-purple-50' },
  dateTime: { label: 'date', color: 'text-rose-500 bg-rose-50' },
};

function TypeBadge({ dataType }) {
  const info = TYPE_ICON[dataType] ?? { label: dataType || '?', color: 'text-gray-500 bg-gray-100' };
  return (
    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${info.color}`}>
      {info.label}
    </span>
  );
}

function TableCard({ table, selected, onClick }) {
  const cols = table.column_details || [];
  return (
    <div
      onClick={() => onClick?.(table.name)}
      className={`
        rounded-lg border transition-all cursor-pointer select-none
        ${selected
          ? 'border-primary-400 bg-primary-50/50 shadow-md shadow-primary-100'
          : 'border-gray-200 bg-white hover:border-primary-200 hover:shadow-sm'}
      `}
    >
      {/* Table header */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-inherit">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${selected ? 'bg-primary-600' : 'bg-gray-100'}`}>
          <Database className={`w-4 h-4 ${selected ? 'text-white' : 'text-gray-500'}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900 truncate">{table.name}</p>
          {table.source && (
            <p className="text-[10px] text-gray-500 truncate font-mono">{table.source}</p>
          )}
        </div>
        <span className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full font-medium">
          {cols.length} cols
        </span>
      </div>

      {/* Column list */}
      <div className="px-4 py-2 space-y-1 max-h-48 overflow-y-auto">
        {cols.length === 0 && (
          <p className="text-xs text-gray-500 py-1">No column details available</p>
        )}
        {cols.map((col) => (
          <div key={col.name} className="flex items-center gap-2 py-0.5">
            <TypeBadge dataType={col.data_type} />
            <span className="text-xs text-gray-700 truncate flex-1">{col.name}</span>
            {col.column_type === 'MEASURE' && (
              <span className="text-[10px] text-primary-500 font-medium">∑</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TableList({
  tables        = [],
  selectedTable = null,
  onTableClick,
}) {
  if (tables.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-12 text-gray-500">
        <Database className="w-8 h-8" />
        <p className="text-sm">No tables found in this migration</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {tables.map((table) => (
        <TableCard
          key={table.name}
          table={table}
          selected={selectedTable === table.name}
          onClick={onTableClick}
        />
      ))}
    </div>
  );
}
