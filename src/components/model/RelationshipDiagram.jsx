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
import { useEffect, useState } from 'react';
import Spinner from '../common/Spinner.jsx';
import { Database, Sparkles } from 'lucide-react';

// Table description dictionary from the user's screenshot
const TABLE_DESCRIPTIONS = {
  'marker_actvation': "Markers' aggregated scores",
  'marker_coactivation_data': "Markers' coactivation details",
  'marker_seq_pairs2': "Markers' sequential patterns",
  'dim_marker': "Markers' dimension table",
  'markerchunk_1': "Marker scores at policy & claim level",
  'chunk_1': "Policy and claims data"
};

// ── Custom Table Node ──────────────────────────────────────────────────────────
// ── Custom Table Node ──────────────────────────────────────────────────────────
function TableNode({ data }) {
  const tableDesc = TABLE_DESCRIPTIONS[data.label?.toLowerCase()];

  return (
    <div className="bg-white rounded-lg border-2 border-primary-200 shadow-md min-w-[180px] overflow-hidden relative">
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
        {tableDesc && (
          <p className="text-blue-100 mt-1 leading-tight font-medium flex items-center gap-1" style={{ fontSize: '6.75px' }}>
            <Sparkles className="text-yellow-300 flex-shrink-0 animate-pulse" style={{ width: '8px', height: '8px' }} />
            <span className="truncate" title={tableDesc}>
              {tableDesc}
            </span>
          </p>
        )}
        <p className="text-[10px] text-primary-200 mt-1">
          {data.columnCount} column{data.columnCount !== 1 ? 's' : ''}
        </p>
      </div>
      <div className="px-3 py-2 space-y-0.5 max-h-36 overflow-y-auto">
        {data.columns.slice(0, 8).map((col) => (
          <div key={col.name} className="flex items-center gap-1.5 text-[11px]">
            <span
              className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                col.isJoinKey
                  ? 'bg-amber-500'
                  : col.type === 'MEASURE'
                  ? 'bg-amber-400'
                  : 'bg-gray-300'
              }`}
            />
            <span
              className={`truncate ${
                col.isJoinKey ? 'text-primary-700 font-bold' : 'text-gray-600'
              }`}
            >
              {col.name}
              {col.isJoinKey && (
                <span className="text-[10px] text-amber-500 ml-1">🔑</span>
              )}
            </span>
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

  // Build a set of joining columns: "tableName::columnName"
  const joinKeys = new Set();
  joins.forEach((j) => {
    if (j.left_table && j.left_column) {
      joinKeys.add(`${j.left_table}::${j.left_column}`);
    }
    if (j.right_table && j.right_column) {
      joinKeys.add(`${j.right_table}::${j.right_column}`);
    }
  });

  const nodes = tables.map((table, i) => {
    // Map and sort columns: join keys first, then non-join keys
    const mappedColumns = (table.column_details ?? [])
      .map((c) => ({
        name:     c.name,
        dataType: c.data_type ?? '',
        type:     c.column_type ?? 'ATTRIBUTE',
        isJoinKey: joinKeys.has(`${table.name}::${c.name}`),
      }))
      .sort((a, b) => {
        if (a.isJoinKey && !b.isJoinKey) return -1;
        if (!a.isJoinKey && b.isJoinKey) return 1;
        return 0;
      });

    return {
      id:       table.name,
      type:     'tableNode',
      position: {
        x: (i % COLS) * H_SPACE + 40,
        y: Math.floor(i / COLS) * V_SPACE + 40,
      },
      data: {
        label:       table.name,
        columnCount: table.column_details?.length ?? 0,
        columns:     mappedColumns,
      },
    };
  });

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
  const [selectedJoin, setSelectedJoin] = useState(null);

  useEffect(() => {
    const { nodes: n, edges: e } = buildGraphElements(tables, joins);
    setNodes(n);
    setEdges(e);
    setSelectedJoin(null); // Clear selected join on model reload
  }, [tables, joins]);

  const onEdgeClick = (event, edge) => {
    // Edge IDs are build in buildGraphElements as `e${i}`
    const joinIdx = parseInt(edge.id.slice(1), 10);
    const join = joins[joinIdx];
    if (join) {
      setSelectedJoin(join);
    }
  };

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
      className="w-full h-full bg-white overflow-hidden relative flex flex-col"
      style={{ height }}
    >
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onEdgeClick={onEdgeClick}
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

        {selectedJoin && (
          <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur border border-primary-100 rounded-xl p-4 shadow-lg z-50 flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center text-primary-650 flex-shrink-0">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Semantic Join Details</p>
                <p className="text-sm font-semibold text-gray-950">
                  <span className="text-primary-650 font-bold">'{selectedJoin.left_table}'</span>[{selectedJoin.left_column}]
                  <span className="mx-2 text-gray-400">→</span>
                  <span className="text-primary-650 font-bold">'{selectedJoin.right_table}'</span>[{selectedJoin.right_column}]
                </p>
                <p className="text-xs text-gray-500 mt-0.5 font-medium">
                  Type: <span className="font-semibold text-gray-700">{selectedJoin.join_type}</span> | 
                  Cardinality: <span className="font-semibold text-gray-700">{selectedJoin.cardinality?.replace(/_/g, ' ')}</span>
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedJoin(null)}
              className="text-gray-400 hover:text-gray-655 text-xs font-bold px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
