'use client';

import { useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  type OnConnect,
  type OnNodesChange,
  type OnEdgesChange,
  applyNodeChanges,
  applyEdgeChanges,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import type { WorkflowNodeData } from '@/types';
import type { Node } from '@xyflow/react';
import { nodeTypes } from './nodes';
import { EditorToolbar } from './EditorToolbar';
import { NodePropertiesPanel } from './NodePropertiesPanel';
import { useAppStore } from '@/lib/store';

export default function WorkflowEditor() {
  const { nodes, edges, setNodes, setEdges, selectedNodeId, setSelectedNodeId, workflowName, workflowLoaded } = useAppStore();

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes(applyNodeChanges(changes, nodes) as Node<WorkflowNodeData>[]),
    [nodes, setNodes],
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges(applyEdgeChanges(changes, edges)),
    [edges, setEdges],
  );

  const onConnect: OnConnect = useCallback(
    (connection) => setEdges(addEdge({ ...connection, type: 'smoothstep', animated: true }, edges)),
    [edges, setEdges],
  );

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  return (
    <div className="flex flex-col h-full">
      <EditorToolbar />
      <div className="flex-1 relative">
        {!workflowLoaded && nodes.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="text-center text-gray-400">
              <div className="text-6xl mb-4">🍋</div>
              <p className="text-lg font-medium">No workflow loaded</p>
              <p className="text-sm mt-2">Use the chat to create a workflow, or open one from the library</p>
            </div>
          </div>
        ) : null}
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          onNodeClick={(_, node) => setSelectedNodeId(node.id)}
          onPaneClick={() => setSelectedNodeId(null)}
          fitView
          attributionPosition="bottom-left"
          className="bg-gray-50"
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#e5e7eb" />
          <Controls className="!bg-white !shadow-lg !border !border-gray-200 !rounded-lg" />
          <MiniMap
            nodeStrokeWidth={3}
            className="!bg-white !shadow-lg !border !border-gray-200 !rounded-lg"
            maskColor="rgba(0,0,0,0.1)"
          />
        </ReactFlow>
        {selectedNode && (
          <div className="absolute top-2 right-2 z-20 w-72">
            <NodePropertiesPanel node={selectedNode} onClose={() => setSelectedNodeId(null)} />
          </div>
        )}
      </div>
      {workflowLoaded && (
        <div className="h-8 bg-gray-100 border-t border-gray-200 px-4 flex items-center justify-between text-xs text-gray-500">
          <span>{workflowName}</span>
          <span>{nodes.length} nodes · {edges.length} edges</span>
        </div>
      )}
    </div>
  );
}
