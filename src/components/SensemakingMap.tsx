import React, { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ExtractedNode } from '../services/smartContentAnalyzer';

interface SensemakingMapProps {
  extractedNodes: ExtractedNode[];
  onNodeUpdate?: (nodeId: string, updates: Partial<ExtractedNode>) => void;
}

const nodeColors = {
  role: '#90EE90',      // Light green for past roles
  project: '#87CEEB',   // Sky blue for projects
  education: '#DDA0DD', // Plum for education
  skill: '#F0E68C',     // Khaki for skills
  goal: '#FFB6C1',      // Light pink for future goals
  interest: '#FFA07A'   // Light salmon for interests
};

const SensemakingMap: React.FC<SensemakingMapProps> = ({ 
  extractedNodes, 
  onNodeUpdate 
}) => {
  // Convert ExtractedNode to ReactFlow Node format
  const initialNodes: Node[] = useMemo(() => 
    extractedNodes.map(node => ({
      id: node.id,
      position: node.position,
      data: { 
        label: node.label,
        type: node.type,
        timeframe: node.timeframe,
        sourceDocuments: node.sourceDocuments,
        extractedText: node.metadata.extractedText
      },
      type: 'default',
      style: {
        background: nodeColors[node.type],
        border: '2px solid #333',
        borderRadius: '8px',
        padding: '10px',
        fontSize: '12px',
        fontWeight: 'bold',
        color: '#333',
        minWidth: '120px',
        textAlign: 'center' as const
      }
    })), [extractedNodes]
  );

  // Convert connections to ReactFlow Edge format
  const initialEdges: Edge[] = useMemo(() => {
    const edges: Edge[] = [];
    extractedNodes.forEach(node => {
      node.connections.forEach(connectionId => {
        // Only add edge if it doesn't already exist (to avoid duplicates)
        const edgeExists = edges.some(edge => 
          (edge.source === node.id && edge.target === connectionId) ||
          (edge.source === connectionId && edge.target === node.id)
        );
        
        if (!edgeExists) {
          edges.push({
            id: `edge-${node.id}-${connectionId}`,
            source: node.id,
            target: connectionId,
            type: 'smoothstep',
            style: { stroke: '#666', strokeWidth: 2 },
            animated: false
          });
        }
      });
    });
    return edges;
  }, [extractedNodes]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    console.log('Node clicked:', node);
    // You can add a modal or sidebar to show node details here
  }, []);

  const onNodeDoubleClick = useCallback((event: React.MouseEvent, node: Node) => {
    // Enable editing on double click
    const newLabel = prompt('Edit node label:', String(node.data.label || ''));
    if (newLabel && newLabel !== node.data.label) {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === node.id
            ? { ...n, data: { ...n.data, label: newLabel } }
            : n
        )
      );
      
      // Notify parent component of the update
      if (onNodeUpdate) {
        onNodeUpdate(node.id, { label: newLabel });
      }
    }
  }, [setNodes, onNodeUpdate]);

  const customNodeTypes = useMemo(() => ({}), []);

  return (
    <div className="w-full h-full bg-gray-50">
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onNodeDoubleClick={onNodeDoubleClick}
          nodeTypes={customNodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
        >
          <Background color="#aaa" gap={16} />
          <Controls />
          <MiniMap 
            nodeColor={(node) => nodeColors[node.data.type as keyof typeof nodeColors] || '#ddd'}
            maskColor="rgb(240, 240, 240, 0.6)"
            position="top-left"
          />
        </ReactFlow>
      </ReactFlowProvider>
      
      {/* Legend - Moved to bottom right to avoid button overlap */}
      <div className="absolute bottom-4 right-4 bg-white p-3 rounded-lg shadow-lg border max-w-xs">
        <h3 className="font-semibold mb-2 text-sm">Node Types</h3>
        <div className="grid grid-cols-2 gap-1 text-xs">
          {Object.entries(nodeColors).map(([type, color]) => (
            <div key={type} className="flex items-center space-x-1">
              <div 
                className="w-3 h-3 rounded border border-gray-400 flex-shrink-0"
                style={{ backgroundColor: color }}
              />
              <span className="capitalize truncate">{type}</span>
            </div>
          ))}
        </div>
        <div className="mt-2 text-xs text-gray-600 border-t pt-2">
          <p>• Double-click to edit • Drag to move</p>
        </div>
      </div>
    </div>
  );
};

export default SensemakingMap;