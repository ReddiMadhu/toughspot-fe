/**
 * Logic Graph Canvas - Visualize calculation dependencies using ReactFlow
 */
import { useCallback, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';

import Card from '../common/Card';

// Custom node component for calculations
function CalculationNode({ data }) {
  // Styles depending on node types
  const nodeStyles = {
    MEASURE: { background: '#f59e0b', border: '1px solid #d97706' }, // amber/orange
    CALCULATED_COLUMN: { background: '#3b82f6', border: '1px solid #2563eb' }, // blue
    LOD_EXPRESSION: { background: '#8b5cf6', border: '2px solid #7c3aed' }, // purple
    TABLE_CALCULATION: { background: '#ec4899', border: '1px solid #db2777' }, // pink
    PARAMETER: { background: '#10b981', border: '1px solid #059669' }, // green
    STANDARD: { background: '#6b7280', border: '1px solid #4b5563' } // gray
  };

  const currentStyle = nodeStyles[data.calcType] || nodeStyles.STANDARD;

  return (
    <div
      className="px-4 py-3 rounded-lg shadow-lg min-w-[200px] text-white relative"
      style={{
        backgroundColor: currentStyle.background,
        border: currentStyle.border,
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#ffffff', width: 6, height: 6 }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: '#ffffff', width: 6, height: 6 }}
      />
      <div className="font-semibold text-sm mb-1">{data.label}</div>
      {data.formula && (
        <div className="text-xs opacity-90 truncate max-w-[180px] font-mono">
          {data.formula}
        </div>
      )}
      <div className="text-[10px] opacity-75 mt-1 flex justify-between">
        <span>{data.calcType}</span>
        <span>Lvl {data.level}</span>
      </div>
    </div>
  );
}

const nodeTypes = {
  calculationNode: CalculationNode,
};

export default function LogicGraphCanvas({ graph, onNodeClick }) {
  const initialNodes = useMemo(() => {
    if (!graph || !graph.nodes) return [];
    return graph.nodes;
  }, [graph]);

  const initialEdges = useMemo(() => {
    if (!graph || !graph.edges) return [];
    return graph.edges;
  }, [graph]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const handleNodeClick = useCallback(
    (event, node) => {
      if (onNodeClick) {
        onNodeClick(node.id);
      }
    },
    [onNodeClick]
  );

  if (!graph || !graph.nodes || graph.nodes.length === 0) {
    return (
      <Card className="h-full flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p className="text-lg font-medium mb-2">No logic graph available</p>
          <p className="text-sm">
            The logic graph will appear here once calculations are analyzed.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="w-full h-full bg-white rounded-lg border border-gray-200" style={{ minHeight: '450px' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
      >
        <Background color="#e5e7eb" gap={16} />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            if (node.data.isLOD) return '#8b5cf6'; // purple for LOD
            if (node.data.calcType === 'MEASURE') return '#f59e0b'; // orange
            if (node.data.calcType === 'TABLE_CALCULATION') return '#ec4899'; // pink
            return '#3b82f6'; // blue
          }}
          maskColor="rgba(0, 0, 0, 0.1)"
        />
      </ReactFlow>
    </div>
  );
}
