'use client';

import { useCallback } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { WorkflowNodeData } from '@/types';
import { useAppStore } from '@/lib/store';

/* ── shared style ────────────────────────────────────────────────────────── */
const base =
  'px-4 py-3 rounded-lg shadow-md border-2 min-w-[160px] text-center text-sm font-medium transition-all hover:shadow-xl group relative cursor-pointer';

/* ── tiny edit-hint that floats on hover ────────────────────────────────── */
function EditHint() {
  return (
    <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[9px] px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
      Double-click to edit
    </span>
  );
}

/* ── hook: open edit modal on double-click ──────────────────────────────── */
function useOpenEdit(id: string) {
  const setEditingNodeId = useAppStore((s) => s.setEditingNodeId);
  return useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setEditingNodeId(id);
    },
    [id, setEditingNodeId],
  );
}

/* ─────────────────────────────────────────────────────────────────────────── *
 *  Node renderers
 * ─────────────────────────────────────────────────────────────────────────── */

export function StartNode({ data, selected, id }: NodeProps) {
  const d = data as WorkflowNodeData;
  const onDoubleClick = useOpenEdit(id);
  return (
    <div
      onDoubleClick={onDoubleClick}
      className={`${base} bg-emerald-50 border-emerald-500 ${selected ? 'ring-2 ring-emerald-400 ring-offset-2' : ''}`}
    >
      <EditHint />
      <div className="flex items-center justify-center gap-2">
        <span className="text-emerald-600 text-lg">▶</span>
        <span className="text-emerald-800">{d.label}</span>
      </div>
      <div className="text-[10px] text-emerald-500 mt-1 uppercase tracking-wider">Start</div>
      <Handle type="source" position={Position.Bottom} className="!bg-emerald-500 !w-3 !h-3" />
    </div>
  );
}

export function ProcessNode({ data, selected, id }: NodeProps) {
  const d = data as WorkflowNodeData;
  const onDoubleClick = useOpenEdit(id);
  return (
    <div
      onDoubleClick={onDoubleClick}
      className={`${base} bg-blue-50 border-blue-500 ${selected ? 'ring-2 ring-blue-400 ring-offset-2' : ''}`}
    >
      <EditHint />
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

export function DecisionNode({ data, selected, id }: NodeProps) {
  const d = data as WorkflowNodeData;
  const condition = d.config?.conditions?.[0];
  const onDoubleClick = useOpenEdit(id);
  return (
    <div
      onDoubleClick={onDoubleClick}
      className={`${base} bg-amber-50 border-amber-500 ${selected ? 'ring-2 ring-amber-400 ring-offset-2' : ''}`}
      style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)', minWidth: '180px', padding: '30px 20px' }}
    >
      <EditHint />
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

export function CalculationNode({ data, selected, id }: NodeProps) {
  const d = data as WorkflowNodeData;
  const onDoubleClick = useOpenEdit(id);
  return (
    <div
      onDoubleClick={onDoubleClick}
      className={`${base} bg-purple-50 border-purple-500 ${selected ? 'ring-2 ring-purple-400 ring-offset-2' : ''}`}
    >
      <EditHint />
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

export function SubprocessNode({ data, selected, id }: NodeProps) {
  const d = data as WorkflowNodeData;
  const onDoubleClick = useOpenEdit(id);
  return (
    <div
      onDoubleClick={onDoubleClick}
      className={`${base} bg-cyan-50 border-cyan-500 border-double border-4 ${selected ? 'ring-2 ring-cyan-400 ring-offset-2' : ''}`}
    >
      <EditHint />
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

export function EndNode({ data, selected, id }: NodeProps) {
  const d = data as WorkflowNodeData;
  const onDoubleClick = useOpenEdit(id);
  return (
    <div
      onDoubleClick={onDoubleClick}
      className={`${base} bg-red-50 border-red-500 rounded-full ${selected ? 'ring-2 ring-red-400 ring-offset-2' : ''}`}
    >
      <EditHint />
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
