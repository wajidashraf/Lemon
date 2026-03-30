import { create } from 'zustand';
import type { Node, Edge } from '@xyflow/react';
import type { ChatMessage, Variable, ValidationError, WorkflowNodeData } from '@/types';
import { sampleNodes, sampleEdges, sampleVariables } from './mock-data';

interface AppState {
  // Workflow editor
  nodes: Node<WorkflowNodeData>[];
  edges: Edge[];
  variables: Variable[];
  selectedNodeId: string | null;
  workflowName: string;
  workflowLoaded: boolean;

  // Chat
  messages: ChatMessage[];
  isChatLoading: boolean;

  // Modals
  showPreview: boolean;
  showExport: boolean;
  showValidation: boolean;
  validationErrors: ValidationError[];

  // Actions
  setNodes: (nodes: Node<WorkflowNodeData>[]) => void;
  setEdges: (edges: Edge[]) => void;
  setSelectedNodeId: (id: string | null) => void;
  setWorkflowName: (name: string) => void;
  loadSampleWorkflow: () => void;
  clearWorkflow: () => void;
  addMessage: (message: ChatMessage) => void;
  setChatLoading: (loading: boolean) => void;
  setShowPreview: (show: boolean) => void;
  setShowExport: (show: boolean) => void;
  setShowValidation: (show: boolean) => void;
  setValidationErrors: (errors: ValidationError[]) => void;
}

export const useAppStore = create<AppState>((set) => ({
  nodes: [],
  edges: [],
  variables: [],
  selectedNodeId: null,
  workflowName: 'Untitled Workflow',
  workflowLoaded: false,

  messages: [
    {
      id: 'welcome',
      role: 'assistant',
      content: "Welcome to LEMON! 🍋\n\nI'm your AI workflow assistant. I can help you:\n\n- **Create workflows** from natural language\n- **Upload a diagram** to reconstruct it\n- **Edit nodes** and connections\n- **Validate** your workflow\n\nTry saying: *\"Create a workflow for triaging chest pain\"*",
      timestamp: new Date(),
    },
  ],
  isChatLoading: false,

  showPreview: false,
  showExport: false,
  showValidation: false,
  validationErrors: [],

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  setSelectedNodeId: (id) => set({ selectedNodeId: id }),
  setWorkflowName: (name) => set({ workflowName: name }),

  loadSampleWorkflow: () =>
    set({
      nodes: sampleNodes,
      edges: sampleEdges,
      variables: sampleVariables,
      workflowName: 'Chest Pain Triage',
      workflowLoaded: true,
    }),

  clearWorkflow: () =>
    set({
      nodes: [],
      edges: [],
      variables: [],
      selectedNodeId: null,
      workflowName: 'Untitled Workflow',
      workflowLoaded: false,
    }),

  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  setChatLoading: (loading) => set({ isChatLoading: loading }),
  setShowPreview: (show) => set({ showPreview: show }),
  setShowExport: (show) => set({ showExport: show }),
  setShowValidation: (show) => set({ showValidation: show }),
  setValidationErrors: (errors) => set({ validationErrors: errors }),
}));
