import type { Node, Edge } from '@xyflow/react';
import type { Workflow, Variable, WorkflowNodeData } from '@/types';

// --- Sample Chest Pain Triage Workflow ---
export const sampleNodes: Node<WorkflowNodeData>[] = [
  {
    id: 'start-1',
    type: 'start',
    position: { x: 350, y: 0 },
    data: { label: 'Patient Intake', nodeType: 'start' },
  },
  {
    id: 'decision-1',
    type: 'decision',
    position: { x: 300, y: 120 },
    data: {
      label: 'Age >= 65?',
      nodeType: 'decision',
      config: {
        conditions: [{ variableName: 'age', comparator: '>=', value: 65, logicalOp: null }],
      },
    },
  },
  {
    id: 'decision-2',
    type: 'decision',
    position: { x: 100, y: 260 },
    data: {
      label: 'Has Chest Pain?',
      nodeType: 'decision',
      config: {
        conditions: [{ variableName: 'hasChestPain', comparator: '==', value: true, logicalOp: null }],
      },
    },
  },
  {
    id: 'calc-1',
    type: 'calculation',
    position: { x: 500, y: 260 },
    data: {
      label: 'Calculate Risk Score',
      nodeType: 'calculation',
      config: {
        resultVariable: 'riskScore',
        expression: {
          operator: 'add',
          operands: [{ variable: 'age' }, { value: 10 }],
        },
      },
    },
  },
  {
    id: 'process-1',
    type: 'process',
    position: { x: 0, y: 400 },
    data: { label: 'Standard Assessment', nodeType: 'process' },
  },
  {
    id: 'process-2',
    type: 'process',
    position: { x: 250, y: 400 },
    data: { label: 'Urgent Assessment', nodeType: 'process' },
  },
  {
    id: 'decision-3',
    type: 'decision',
    position: { x: 450, y: 400 },
    data: {
      label: 'Risk Score > 75?',
      nodeType: 'decision',
      config: {
        conditions: [{ variableName: 'riskScore', comparator: '>', value: 75, logicalOp: null }],
      },
    },
  },
  {
    id: 'process-3',
    type: 'process',
    position: { x: 600, y: 530 },
    data: { label: 'Cardiology Referral', nodeType: 'process' },
  },
  {
    id: 'end-1',
    type: 'end',
    position: { x: 100, y: 560 },
    data: {
      label: 'Low Risk - Discharge',
      nodeType: 'end',
      config: { outputVariable: 'recommendation', outputLabel: 'Discharge with follow-up' },
    },
  },
  {
    id: 'end-2',
    type: 'end',
    position: { x: 350, y: 560 },
    data: {
      label: 'Medium Risk - Monitor',
      nodeType: 'end',
      config: { outputVariable: 'recommendation', outputLabel: 'Admit for observation' },
    },
  },
  {
    id: 'end-3',
    type: 'end',
    position: { x: 600, y: 660 },
    data: {
      label: 'High Risk - Immediate',
      nodeType: 'end',
      config: { outputVariable: 'recommendation', outputLabel: 'Immediate cardiology referral' },
    },
  },
];

export const sampleEdges: Edge[] = [
  { id: 'e-start-d1', source: 'start-1', target: 'decision-1', type: 'smoothstep', animated: true },
  { id: 'e-d1-d2', source: 'decision-1', target: 'decision-2', label: 'No', type: 'smoothstep', style: { stroke: '#ef4444' } },
  { id: 'e-d1-calc', source: 'decision-1', target: 'calc-1', label: 'Yes', type: 'smoothstep', style: { stroke: '#22c55e' } },
  { id: 'e-d2-p1', source: 'decision-2', target: 'process-1', label: 'No', type: 'smoothstep', style: { stroke: '#ef4444' } },
  { id: 'e-d2-p2', source: 'decision-2', target: 'process-2', label: 'Yes', type: 'smoothstep', style: { stroke: '#22c55e' } },
  { id: 'e-calc-d3', source: 'calc-1', target: 'decision-3', type: 'smoothstep', animated: true },
  { id: 'e-p1-end1', source: 'process-1', target: 'end-1', type: 'smoothstep' },
  { id: 'e-p2-end2', source: 'process-2', target: 'end-2', type: 'smoothstep' },
  { id: 'e-d3-end2', source: 'decision-3', target: 'end-2', label: 'No', type: 'smoothstep', style: { stroke: '#ef4444' } },
  { id: 'e-d3-p3', source: 'decision-3', target: 'process-3', label: 'Yes', type: 'smoothstep', style: { stroke: '#22c55e' } },
  { id: 'e-p3-end3', source: 'process-3', target: 'end-3', type: 'smoothstep' },
];

export const sampleVariables: Variable[] = [
  { id: 'v1', name: 'age', type: 'number', isDerived: false, defaultValue: '45' },
  { id: 'v2', name: 'hasChestPain', type: 'boolean', isDerived: false, defaultValue: 'true' },
  { id: 'v3', name: 'bloodPressure', type: 'number', isDerived: false, defaultValue: '130' },
  { id: 'v4', name: 'painDuration', type: 'number', isDerived: false, defaultValue: '15' },
  { id: 'v5', name: 'riskCategory', type: 'enum', isDerived: false, enumOptions: ['Low', 'Medium', 'High'], defaultValue: 'Medium' },
  { id: 'v6', name: 'riskScore', type: 'number', isDerived: true },
  { id: 'v7', name: 'recommendation', type: 'string', isDerived: true },
];

// --- Library Workflows ---
export const libraryWorkflows: Workflow[] = [
  {
    id: 'wf-1',
    name: 'Chest Pain Triage',
    description: 'Assess chest pain patients and determine appropriate care pathway based on age, symptoms, and risk score.',
    status: 'valid',
    version: 3,
    outputType: 'string',
    variables: sampleVariables,
    outputs: [{ variableName: 'recommendation', outputType: 'string', label: 'Recommendation' }],
    createdAt: '2026-03-25T10:00:00Z',
    updatedAt: '2026-03-29T14:30:00Z',
    nodeCount: 11,
  },
  {
    id: 'wf-2',
    name: 'Blood Pressure Assessment',
    description: 'Evaluate blood pressure readings and recommend monitoring or medication adjustments.',
    status: 'draft',
    version: 1,
    outputType: 'string',
    variables: [],
    outputs: [],
    createdAt: '2026-03-28T09:00:00Z',
    updatedAt: '2026-03-28T09:00:00Z',
    nodeCount: 8,
  },
  {
    id: 'wf-3',
    name: 'Patient Referral Routing',
    description: 'Determine the correct specialist referral path based on symptoms and initial assessment.',
    status: 'published',
    version: 5,
    outputType: 'string',
    variables: [],
    outputs: [],
    createdAt: '2026-03-10T08:00:00Z',
    updatedAt: '2026-03-27T16:45:00Z',
    nodeCount: 15,
  },
  {
    id: 'wf-4',
    name: 'Medication Dosage Calculator',
    description: 'Calculate appropriate medication dosage based on patient weight, age, and renal function.',
    status: 'valid',
    version: 2,
    outputType: 'number',
    variables: [],
    outputs: [],
    createdAt: '2026-03-20T11:00:00Z',
    updatedAt: '2026-03-26T10:15:00Z',
    nodeCount: 9,
  },
  {
    id: 'wf-5',
    name: 'Diabetes Risk Screening',
    description: 'Screen patients for diabetes risk factors and recommend appropriate testing.',
    status: 'draft',
    version: 1,
    outputType: 'string',
    variables: [],
    outputs: [],
    createdAt: '2026-03-29T15:00:00Z',
    updatedAt: '2026-03-29T15:00:00Z',
    nodeCount: 6,
  },
  {
    id: 'wf-6',
    name: 'Emergency Triage Protocol',
    description: 'Standard emergency department triage protocol following Manchester Triage System.',
    status: 'published',
    version: 8,
    outputType: 'enum',
    variables: [],
    outputs: [],
    createdAt: '2026-02-15T08:00:00Z',
    updatedAt: '2026-03-25T12:00:00Z',
    nodeCount: 22,
  },
];

// --- Chat Demo Responses ---
export const demoConversation = [
  {
    trigger: 'create a workflow for triaging chest pain',
    responses: [
      {
        content: "I'll create a chest pain triage workflow for you. Let me start by setting up the variables and building the decision logic.",
        toolCalls: ['create_workflow("Chest Pain Triage")'],
        delay: 800,
      },
      {
        content: "Registering input variables: **age** (number), **hasChestPain** (boolean), **bloodPressure** (number), **painDuration** (number), **riskCategory** (enum)...",
        toolCalls: ['register_variable("age", number)', 'register_variable("hasChestPain", boolean)', 'register_variable("bloodPressure", number)'],
        delay: 1200,
      },
      {
        content: "Building the workflow nodes. I'm adding:\n- **Start**: Patient Intake\n- **Decision**: Age check (≥ 65)\n- **Decision**: Chest pain check\n- **Calculation**: Risk score computation\n- **Process**: Assessment pathways\n- **End**: Three outcome paths (Low/Medium/High risk)\n\n✅ Workflow built successfully with 11 nodes and 11 edges. The workflow has been validated and is ready for preview.",
        toolCalls: ['add_node(start)', 'add_node(decision x3)', 'add_node(calculation)', 'add_node(process x3)', 'add_node(end x3)', 'add_edge(x11)', 'validate_workflow()'],
        delay: 2000,
      },
    ],
  },
  {
    trigger: 'add a subprocess',
    responses: [
      {
        content: "I'll add a subprocess node that references the **Blood Pressure Assessment** workflow. This will take the patient's blood pressure as input and return an assessment result.\n\n🔗 Subprocess node added and connected to the main flow.",
        toolCalls: ['add_node(subprocess, "BP Assessment")', 'add_edge(process-2, subprocess-1)'],
        delay: 1500,
      },
    ],
  },
  {
    trigger: 'validate',
    responses: [
      {
        content: "✅ **Validation Passed**\n\nAll checks passed:\n- ✓ Single start node\n- ✓ All nodes reachable from start\n- ✓ All edges reference valid nodes\n- ✓ Decision nodes have both true/false branches\n- ✓ All variable references resolved\n- ✓ Output definitions consistent\n\nThe workflow is ready for preview execution or export.",
        toolCalls: ['validate_workflow()'],
        delay: 1000,
      },
    ],
  },
];

export const defaultResponses = [
  "I can help you with that! Could you provide more details about the workflow you'd like to create?",
  "I understand. Let me think about the best way to structure that as a workflow with decision nodes and process steps.",
  "Great question! In LEMON, you can use decision nodes with compound conditions (AND/OR) to handle complex logic like that.",
  "I can modify the workflow for you. Which node would you like me to change?",
  "Would you like me to add a calculation node to compute that value automatically?",
];
