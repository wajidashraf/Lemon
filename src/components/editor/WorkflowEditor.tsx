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
  type Node,
  type NodeMouseHandler,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import type { WorkflowNodeData } from '@/types';
import { nodeTypes } from './nodes';
import { EditorToolbar } from './EditorToolbar';
import NodeContextMenu from './NodeContextMenu';
import NodeEditModal from './NodeEditModal';
import { NodePropertiesPanel } from './NodePropertiesPanel';
import { useAppStore } from '@/lib/store';

export default function WorkflowEditor() {
  const {
    nodes, edges,
    setNodes, setEdges,
    selectedNodeId, setSelectedNodeId,
    workflowName, workflowLoaded,
    setEditingNodeId,
    setContextMenu,
    pushHistory,
  } = useAppStore();

  /* ── Change handlers ────────────────────────────────────────────────────── */
  const onNodesChange: OnNodesChange = useCallback(
    (changes) => {
      // Push to undo history only for position drags (type==='position' and dragging===false means drag finished)
      const hasDragEnd = changes.some((c) => c.type === 'position' && !('dragging' in c && c.dragging));
      if (hasDragEnd) pushHistory();
      setNodes(applyNodeChanges(changes, nodes) as Node<WorkflowNodeData>[]);
    },
    [nodes, setNodes, pushHistory],
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges(applyEdgeChanges(changes, edges)),
    [edges, setEdges],
  );

  const onConnect: OnConnect = useCallback(
    (connection) => {
      pushHistory();
      setEdges(addEdge({ ...connection, type: 'smoothstep', animated: true }, edges));
    },
    [edges, setEdges, pushHistory],
  );

  /* ── Node interactions ──────────────────────────────────────────────────── */
  const onNodeClick: NodeMouseHandler = useCallback(
    (_, node) => {
      setSelectedNodeId(node.id);
      setContextMenu(null);
    },
    [setSelectedNodeId, setContextMenu],
  );

  const onNodeDoubleClick: NodeMouseHandler = useCallback(
    (_, node) => {
      setEditingNodeId(node.id);
    },
    [setEditingNodeId],
  );

  const onNodeContextMenu: NodeMouseHandler = useCallback(
    (event, node) => {
      event.preventDefault();
      setContextMenu({ nodeId: node.id, x: event.clientX, y: event.clientY });
    },
    [setContextMenu],
  );

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
    setContextMenu(null);
  }, [setSelectedNodeId, setContextMenu]);

  /* ── Keyboard shortcuts ─────────────────────────────────────────────────── */
  const { undo, redo } = useAppStore.getState();

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); undo(); }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) { e.preventDefault(); redo(); }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedNodeId) {
          e.preventDefault();
          useAppStore.getState().deleteNode(selectedNodeId);
        }
      }
    },
    [selectedNodeId, undo, redo],
  );

  return (
    <div className="flex flex-col h-full" onKeyDown={onKeyDown} tabIndex={0} style={{ outline: 'none' }}>
      <EditorToolbar />

      <div className="flex-1 relative">
        {/* Empty state */}
        {!workflowLoaded && nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <div className="text-center text-gray-400">
              <div className="text-6xl mb-4">🍋</div>
              <p className="text-lg font-medium">No workflow loaded</p>
              <p className="text-sm mt-2">Chat to create one, open from Library, or use <strong className="text-gray-500">+ Add Node</strong></p>
              <p className="text-xs mt-1 text-gray-300">Tip: right-click a node for options · double-click to edit</p>
            </div>
          </div>
        )}

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          onNodeClick={onNodeClick}
          onNodeDoubleClick={onNodeDoubleClick}
          onNodeContextMenu={onNodeContextMenu}
          onPaneClick={onPaneClick}
          fitView
          attributionPosition="bottom-left"
          className="bg-gray-50"
          deleteKeyCode={null} /* we handle delete ourselves */
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#e5e7eb" />
          <Controls className="!bg-white !shadow-lg !border !border-gray-200 !rounded-lg" />
          <MiniMap
            nodeStrokeWidth={3}
            className="!bg-white !shadow-lg !border !border-gray-200 !rounded-lg"
            maskColor="rgba(0,0,0,0.08)"
          />
        </ReactFlow>

        {/* Context Menu */}
        <NodeContextMenu />

        {/* Edit Modal */}
        <NodeEditModal />

        {/* Properties Panel (click to select) */}
        {selectedNodeId && (
          <div className="absolute top-3 right-3 z-10">
            <NodePropertiesPanel />
          </div>
        )}
      </div>

      {/* Status bar */}
      {workflowLoaded || nodes.length > 0 ? (
        <div className="h-7 bg-gray-100 border-t border-gray-200 px-4 flex items-center justify-between text-[11px] text-gray-500 shrink-0">
          <span className="font-medium">{workflowName}</span>
          <span>{nodes.length} nodes · {edges.length} edges · <span className="text-gray-400">double-click node to edit · right-click for options</span></span>
        </div>
      ) : null}
    </div>
  );
}
