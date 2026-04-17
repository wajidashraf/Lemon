import { create } from 'zustand';
import type { Node, Edge } from '@xyflow/react';
import type { ChatMessage, Variable, ValidationError, WorkflowNodeData, NodeType } from '@/types';
import { sampleNodes, sampleEdges, sampleVariables } from './mock-data';

interface HistoryEntry {
  nodes: Node<WorkflowNodeData>[];
  edges: Edge[];
}

interface ContextMenu {
  nodeId: string;
  x: number;
  y: number;
}

interface AppState {
  // Workflow editor
  nodes: Node<WorkflowNodeData>[];
  edges: Edge[];
  variables: Variable[];
  selectedNodeId: string | null;
  workflowName: string;
  workflowLoaded: boolean;

  // Edit modal
  editingNodeId: string | null;

  // Context menu
  contextMenu: ContextMenu | null;

  // Undo / redo
  history: HistoryEntry[];
  historyIndex: number;

  // Chat
  messages: ChatMessage[];
  isChatLoading: boolean;

  // Modals
  showPreview: boolean;
  showExport: boolean;
  showValidation: boolean;
  validationErrors: ValidationError[];

  // ─── Actions ──────────────────────────────────────────────────────────────
  setNodes: (nodes: Node<WorkflowNodeData>[]) => void;
  setEdges: (edges: Edge[]) => void;
  setVariables: (variables: Variable[]) => void;
  setSelectedNodeId: (id: string | null) => void;
  setWorkflowName: (name: string) => void;

  // Node CRUD
  addNode: (type: NodeType, position?: { x: number; y: number }) => void;
  updateNode: (id: string, data: Partial<WorkflowNodeData>) => void;
  deleteNode: (id: string) => void;
  duplicateNode: (id: string) => void;

  // Edge CRUD
  updateEdge: (id: string, label: string) => void;
  deleteEdge: (id: string) => void;

  // Edit modal
  setEditingNodeId: (id: string | null) => void;

  // Context menu
  setContextMenu: (menu: ContextMenu | null) => void;

  // Undo / redo
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;

  loadSampleWorkflow: () => void;
  clearWorkflow: () => void;
  addMessage: (message: ChatMessage) => void;
  setChatLoading: (loading: boolean) => void;
  setShowPreview: (show: boolean) => void;
  setShowExport: (show: boolean) => void;
  setShowValidation: (show: boolean) => void;
  setValidationErrors: (errors: ValidationError[]) => void;
}

let nodeCounter = 100;

function defaultDataForType(type: NodeType): WorkflowNodeData {
  switch (type) {
    case 'start':
      return { label: 'Start', nodeType: 'start' };
    case 'end':
      return { label: 'End', nodeType: 'end', config: { outputLabel: 'Output' } };
    case 'decision':
      return {
        label: 'Decision',
        nodeType: 'decision',
        config: { conditions: [{ variableName: 'variable', comparator: '==', value: 'value', logicalOp: null }] },
      };
    case 'calculation':
      return {
        label: 'Calculate',
        nodeType: 'calculation',
        config: {
          resultVariable: 'result',
          expression: { operator: 'add', operands: [{ variable: 'a' }, { value: 0 }] },
        },
      };
    case 'subprocess':
      return { label: 'Subprocess', nodeType: 'subprocess', config: { referencedWorkflowId: '' } };
    default:
      return { label: 'Process', nodeType: 'process' };
  }
}

export const useAppStore = create<AppState>((set, get) => ({
  nodes: [],
  edges: [],
  variables: [],
  selectedNodeId: null,
  workflowName: 'Untitled Workflow',
  workflowLoaded: false,
  editingNodeId: null,
  contextMenu: null,
  history: [],
  historyIndex: -1,

  messages: [
    {
      id: 'welcome',
      role: 'assistant',
      content:
        "Welcome to LEMON! 🍋\n\nI'm your AI workflow assistant. I can help you:\n\n- **Create workflows** from natural language\n- **Upload a diagram** to reconstruct it\n- **Edit nodes** and connections\n- **Validate** your workflow\n\nTry saying: *\"Create a workflow for triaging chest pain\"*",
      timestamp: new Date(),
    },
  ],
  isChatLoading: false,

  showPreview: false,
  showExport: false,
  showValidation: false,
  validationErrors: [],

  // ─── Basic setters ─────────────────────────────────────────────────────────
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  setVariables: (variables) => set({ variables }),
  setSelectedNodeId: (id) => set({ selectedNodeId: id, contextMenu: null }),
  setWorkflowName: (name) => set({ workflowName: name }),

  // ─── Node CRUD ─────────────────────────────────────────────────────────────
  addNode: (type, position) => {
    get().pushHistory();
    const id = `${type}-${++nodeCounter}`;
    const pos = position ?? { x: 300 + Math.random() * 200, y: 200 + Math.random() * 200 };
    const newNode: Node<WorkflowNodeData> = {
      id,
      type,
      position: pos,
      data: defaultDataForType(type),
    };
    set((s) => ({ nodes: [...s.nodes, newNode], workflowLoaded: true }));
  },

  updateNode: (id, data) => {
    get().pushHistory();
    set((s) => ({
      nodes: s.nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, ...data } } : n,
      ),
    }));
  },

  deleteNode: (id) => {
    get().pushHistory();
    set((s) => ({
      nodes: s.nodes.filter((n) => n.id !== id),
      edges: s.edges.filter((e) => e.source !== id && e.target !== id),
      selectedNodeId: s.selectedNodeId === id ? null : s.selectedNodeId,
      editingNodeId: s.editingNodeId === id ? null : s.editingNodeId,
      contextMenu: null,
    }));
  },

  duplicateNode: (id) => {
    get().pushHistory();
    const node = get().nodes.find((n) => n.id === id);
    if (!node) return;
    const newId = `${node.type}-${++nodeCounter}`;
    const newNode: Node<WorkflowNodeData> = {
      ...node,
      id: newId,
      position: { x: node.position.x + 40, y: node.position.y + 40 },
      selected: false,
    };
    set((s) => ({ nodes: [...s.nodes, newNode], contextMenu: null }));
  },

  // ─── Edge CRUD ─────────────────────────────────────────────────────────────
  updateEdge: (id, label) => {
    get().pushHistory();
    set((s) => ({
      edges: s.edges.map((e) => (e.id === id ? { ...e, label } : e)),
    }));
  },

  deleteEdge: (id) => {
    get().pushHistory();
    set((s) => ({ edges: s.edges.filter((e) => e.id !== id) }));
  },

  // ─── Edit modal ────────────────────────────────────────────────────────────
  setEditingNodeId: (id) => set({ editingNodeId: id, contextMenu: null }),

  // ─── Context menu ──────────────────────────────────────────────────────────
  setContextMenu: (menu) => set({ contextMenu: menu }),

  // ─── Undo / Redo ───────────────────────────────────────────────────────────
  pushHistory: () => {
    const { nodes, edges, history, historyIndex } = get();
    const trimmed = history.slice(0, historyIndex + 1);
    const next = [...trimmed, { nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) }];
    set({ history: next.slice(-50), historyIndex: Math.min(next.length - 1, 49) });
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex <= 0) return;
    const entry = history[historyIndex - 1];
    set({ nodes: entry.nodes, edges: entry.edges, historyIndex: historyIndex - 1 });
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex >= history.length - 1) return;
    const entry = history[historyIndex + 1];
    set({ nodes: entry.nodes, edges: entry.edges, historyIndex: historyIndex + 1 });
  },

  // ─── Workflow-level ────────────────────────────────────────────────────────
  loadSampleWorkflow: () =>
    set({
      nodes: sampleNodes,
      edges: sampleEdges,
      variables: sampleVariables,
      workflowName: 'Chest Pain Triage',
      workflowLoaded: true,
      history: [],
      historyIndex: -1,
    }),

  clearWorkflow: () =>
    set({
      nodes: [],
      edges: [],
      variables: [],
      selectedNodeId: null,
      workflowName: 'Untitled Workflow',
      workflowLoaded: false,
      history: [],
      historyIndex: -1,
    }),

  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  setChatLoading: (loading) => set({ isChatLoading: loading }),
  setShowPreview: (show) => set({ showPreview: show }),
  setShowExport: (show) => set({ showExport: show }),
  setShowValidation: (show) => set({ showValidation: show }),
  setValidationErrors: (errors) => set({ validationErrors: errors }),
}));
