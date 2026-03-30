'use client';

import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { WorkflowNodeData } from '@/types';

const baseStyle = 'px-4 py-3 rounded-lg shadow-md border-2 min-w-[160px] text-center text-sm font-medium transition-all hover:shadow-lg';

export function StartNode({ data, selected }: NodeProps) {
  const d = data as WorkflowNodeData;
  return (
    <div className={`${baseStyle} bg-emerald-50 border-emerald-500 ${selected ? 'ring-2 ring-emerald-400 ring-offset-2' : ''}`}>
      <div className="flex items-center justify-center gap-2">
        <span className="text-emerald-600 text-lg">▶</span>
        <span className="text-emerald-800">{d.label}</span>
      </div>
      <div className="text-[10px] text-emerald-500 mt-1 uppercase tracking-wider">Start</div>
      <Handle type="source" position={Position.Bottom} className="!bg-emerald-500 !w-3 !h-3" />
    </div>
  );
}

export function ProcessNode({ data, selected }: NodeProps) {
  const d = data as WorkflowNodeData;
  return (
    <div className={`${baseStyle} bg-blue-50 border-blue-500 ${selected ? 'ring-2 ring-blue-400 ring-offset-2' : ''}`}>
      <Handle type="target" position={Position.Top} className="!bg-blue-500 !w-3 !h-3" />
      <div className="flex items-center justify-center gap-2">
        <span className="text-blue-600 text-lg">⚙</span>
        <span className="text-blue-800">{d.label}</span>
      </div>
      <div className="text-[10px] text-blue-500 mt-1 uppercase tracking-wider">Process</div>
      <Handle type="source" position={Position.Bottom} className="!bg-blue-500 !w-3 !h-3" />
    </div>
  );
}

export function DecisionNode({ data, selected }: NodeProps) {
  const d = data as WorkflowNodeData;
  const condition = d.config?.conditions?.[0];
  return (
    <div className={`${baseStyle} bg-amber-50 border-amber-500 rotate-0 ${selected ? 'ring-2 ring-amber-400 ring-offset-2' : ''}`}
         style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)', minWidth: '180px', padding: '30px 20px' }}>
      <Handle type="target" position={Position.Top} className="!bg-amber-500 !w-3 !h-3" />
      <div className="text-amber-800 text-xs font-bold">{d.label}</div>
      {condition && (
        <div className="text-[9px] text-amber-600 mt-1">
          {condition.variableName} {condition.comparator} {String(condition.value)}
        </div>
      )}
      <Handle type="source" position={Position.Bottom} className="!bg-amber-500 !w-3 !h-3" id="bottom" />
      <Handle type="source" position={Position.Left} className="!bg-red-500 !w-3 !h-3" id="left" />
      <Handle type="source" position={Position.Right} className="!bg-green-500 !w-3 !h-3" id="right" />
    </div>
  );
}

export function CalculationNode({ data, selected }: NodeProps) {
  const d = data as WorkflowNodeData;
  return (
    <div className={`${baseStyle} bg-purple-50 border-purple-500 ${selected ? 'ring-2 ring-purple-400 ring-offset-2' : ''}`}>
      <Handle type="target" position={Position.Top} className="!bg-purple-500 !w-3 !h-3" />
      <div className="flex items-center justify-center gap-2">
        <span className="text-purple-600 text-lg">∑</span>
        <span className="text-purple-800">{d.label}</span>
      </div>
      {d.config?.resultVariable && (
        <div className="text-[10px] text-purple-500 mt-1">→ {d.config.resultVariable}</div>
      )}
      <div className="text-[10px] text-purple-400 uppercase tracking-wider">Calculation</div>
      <Handle type="source" position={Position.Bottom} className="!bg-purple-500 !w-3 !h-3" />
    </div>
  );
}

export function SubprocessNode({ data, selected }: NodeProps) {
  const d = data as WorkflowNodeData;
  return (
    <div className={`${baseStyle} bg-cyan-50 border-cyan-500 border-double border-4 ${selected ? 'ring-2 ring-cyan-400 ring-offset-2' : ''}`}>
      <Handle type="target" position={Position.Top} className="!bg-cyan-500 !w-3 !h-3" />
      <div className="flex items-center justify-center gap-2">
        <span className="text-cyan-600 text-lg">↗</span>
        <span className="text-cyan-800">{d.label}</span>
      </div>
      <div className="text-[10px] text-cyan-500 mt-1 uppercase tracking-wider">Subprocess</div>
      <Handle type="source" position={Position.Bottom} className="!bg-cyan-500 !w-3 !h-3" />
    </div>
  );
}

export function EndNode({ data, selected }: NodeProps) {
  const d = data as WorkflowNodeData;
  return (
    <div className={`${baseStyle} bg-red-50 border-red-500 rounded-full ${selected ? 'ring-2 ring-red-400 ring-offset-2' : ''}`}>
      <Handle type="target" position={Position.Top} className="!bg-red-500 !w-3 !h-3" />
      <div className="flex items-center justify-center gap-2">
        <span className="text-red-600 text-lg">⏹</span>
        <span className="text-red-800 text-xs">{d.label}</span>
      </div>
      {d.config?.outputLabel && (
        <div className="text-[9px] text-red-500 mt-1">{d.config.outputLabel}</div>
      )}
      <div className="text-[10px] text-red-400 uppercase tracking-wider">End</div>
    </div>
  );
}

export const nodeTypes = {
  start: StartNode,
  process: ProcessNode,
  decision: DecisionNode,
  calculation: CalculationNode,
  subprocess: SubprocessNode,
  end: EndNode,
};
