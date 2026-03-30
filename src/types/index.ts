export type NodeType = 'start' | 'process' | 'decision' | 'calculation' | 'subprocess' | 'end';
export type VariableType = 'string' | 'number' | 'boolean' | 'date' | 'enum';
export type WorkflowStatus = 'draft' | 'valid' | 'published';

export interface Variable {
  id: string;
  name: string;
  type: VariableType;
  enumOptions?: string[];
  isDerived: boolean;
  defaultValue?: string;
}

export interface WorkflowOutput {
  variableName: string;
  outputType: VariableType;
  label: string;
}

export interface DecisionCondition {
  variableName: string;
  comparator: '==' | '!=' | '>' | '<' | '>=' | '<=' | 'contains' | 'startsWith';
  value: string | number | boolean;
  logicalOp?: 'AND' | 'OR' | null;
}

export interface CalculationExpression {
  operator: 'add' | 'subtract' | 'multiply' | 'divide' | 'modulo' | 'round' | 'abs';
  operands: Array<{ variable?: string; value?: number; expression?: CalculationExpression }>;
}

export interface NodeConfig {
  conditions?: DecisionCondition[];
  resultVariable?: string;
  expression?: CalculationExpression;
  referencedWorkflowId?: string;
  inputMappings?: Record<string, string>;
  outputVariable?: string;
  outputLabel?: string;
}

export interface WorkflowNodeData {
  label: string;
  nodeType: NodeType;
  config?: NodeConfig;
  [key: string]: unknown;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  status: WorkflowStatus;
  version: number;
  outputType: VariableType;
  variables: Variable[];
  outputs: WorkflowOutput[];
  createdAt: string;
  updatedAt: string;
  nodeCount: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
  toolCalls?: string[];
}

export interface ValidationError {
  code: string;
  message: string;
  nodeId?: string;
  severity: 'error' | 'warning';
}

export interface ExecutionStep {
  stepNumber: number;
  nodeId: string;
  nodeLabel: string;
  nodeType: NodeType;
  action: string;
  variableChanges?: Record<string, unknown>;
}

export interface ExecutionResult {
  success: boolean;
  steps: ExecutionStep[];
  output: string;
  finalVariables: Record<string, unknown>;
  totalSteps: number;
  executionPath: string[];
}
