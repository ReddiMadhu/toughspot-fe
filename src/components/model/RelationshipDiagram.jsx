/**
 * RelationshipDiagram — interactive ReactFlow ERD for the data model.
 *
 * Props:
 *   tables    Array<TableDef>   from the intermediate model
 *   joins     Array<JoinDef>    from the intermediate model
 *   height    number            canvas height in px (default 520)
 *   loading   boolean           show loading skeleton
 */
import ReactFlow, {
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  Handle,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useEffect } from 'react';
import Spinner from '../common/Spinner.jsx';

// ── Custom Table Node ──────────────────────────────────────────────────────────
function TableNode({ data }) {
  return (
    <div className="bg-white rounded-lg border-2 border-primary-200 shadow-md min-w-[165px] overflow-hidden relative">
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#ec3f06', width: 8, height: 8 }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: '#ec3f06', width: 8, height: 8 }}
      />
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-3 py-2">
        <p className="text-xs font-bold text-white truncate">{data.label}</p>
        <p className="text-[10px] text-primary-200">
          {data.columnCount} column{data.columnCount !== 1 ? 's' : ''}
        </p>
      </div>
      <div className="px-3 py-2 space-y-0.5 max-h-36 overflow-y-auto">
        {data.columns.slice(0, 8).map((col) => (
          <div key={col.name} className="flex items-center gap-1.5 text-[11px]">
            <span
              className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                col.type === 'MEASURE' ? 'bg-amber-400' : 'bg-gray-300'
              }`}
            />
            <span className="text-gray-600 truncate">{col.name}</span>
            <span className="text-gray-300 text-[10px] ml-auto flex-shrink-0">
              {col.dataType?.slice(0, 3)}
            </span>
          </div>
        ))}
        {data.columns.length > 8 && (
          <p className="text-[10px] text-gray-500 pl-3">
            +{data.columns.length - 8} more
          </p>
        )}
      </div>
    </div>
  );
}

const NODE_TYPES = { tableNode: TableNode };

// ── Build nodes/edges from model data ─────────────────────────────────────────
function buildGraphElements(tables = [], joins = []) {
  const COLS    = Math.min(3, tables.length || 1);
  const H_SPACE = 280;
  const V_SPACE = 290;

  const nodes = tables.map((table, i) => ({
    id:       table.name,
    type:     'tableNode',
    position: {
      x: (i % COLS) * H_SPACE + 40,
      y: Math.floor(i / COLS) * V_SPACE + 40,
    },
    data: {
      label:       table.name,
      columnCount: table.column_details?.length ?? 0,
      columns: (table.column_details ?? []).map((c) => ({
        name:     c.name,
        dataType: c.data_type ?? '',
        type:     c.column_type ?? 'ATTRIBUTE',
      })),
    },
  }));

  const edges = joins.map((join, i) => ({
    id:         `e${i}`,
    source:     join.left_table,
    target:     join.right_table,
    label:      join.cardinality?.replace(/_/g, ':') ?? '',
    style:      { stroke: '#ec3f06', strokeWidth: 2 },
    labelStyle: { fontSize: 10, fontFamily: 'Inter', fill: '#6b7280' },
    labelBgStyle: { fill: '#f9fafb', rx: 4 },
    animated:   false,
    markerEnd:  { type: 'arrowclosed', color: '#ec3f06' },
  }));

  return { nodes, edges };
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function RelationshipDiagram({
  tables  = [],
  joins   = [],
  height  = 520,
  loading = false,
}) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    const { nodes: n, edges: e } = buildGraphElements(tables, joins);
    setNodes(n);
    setEdges(e);
  }, [tables, joins]);

  if (loading) {
    return (
      <div
        className="bg-white rounded-lg border border-gray-200 shadow-sm flex items-center justify-center"
        style={{ height }}
      >
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" />
          <p className="text-sm text-gray-500">Loading data model…</p>
        </div>
      </div>
    );
  }

  if (nodes.length === 0) {
    return (
      <div
        className="bg-white rounded-lg border border-gray-200 shadow-sm flex items-center justify-center text-center px-8"
        style={{ height }}
      >
        <div>
          <p className="text-gray-500 text-sm mb-1">No table data available</p>
          <p className="text-xs text-gray-300">
            The migration may not have produced table definitions yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden"
      style={{ height }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={NODE_TYPES}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        minZoom={0.3}
        maxZoom={2}
      >
        <Controls className="bg-white border border-gray-200 rounded-lg shadow-sm" />
        <MiniMap
          nodeColor="#ec3f06"
          maskColor="rgba(249,250,251,0.7)"
          style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8 }}
        />
        <Background color="#e5e7eb" gap={20} size={1} />
      </ReactFlow>
    </div>
  );
}
