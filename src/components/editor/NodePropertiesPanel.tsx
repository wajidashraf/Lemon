'use client';

import type { Node } from '@xyflow/react';
import type { WorkflowNodeData } from '@/types';

interface Props {
  node: Node<WorkflowNodeData>;
  onClose: () => void;
}

export function NodePropertiesPanel({ node, onClose }: Props) {
  const d = node.data as WorkflowNodeData;
  const typeColors: Record<string, string> = {
    start: 'border-emerald-500 bg-emerald-50',
    process: 'border-blue-500 bg-blue-50',
    decision: 'border-amber-500 bg-amber-50',
    calculation: 'border-purple-500 bg-purple-50',
    subprocess: 'border-cyan-500 bg-cyan-50',
    end: 'border-red-500 bg-red-50',
  };

  return (
    <div className={`bg-white rounded-lg shadow-xl border-l-4 ${typeColors[d.nodeType] || 'border-gray-300'} p-4`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-gray-800">Node Properties</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">&times;</button>
      </div>

      <div className="space-y-2 text-xs">
        <div>
          <label className="text-gray-500 block">ID</label>
          <span className="text-gray-700 font-mono">{node.id}</span>
        </div>
        <div>
          <label className="text-gray-500 block">Type</label>
          <span className="capitalize font-medium text-gray-700">{d.nodeType}</span>
        </div>
        <div>
          <label className="text-gray-500 block">Label</label>
          <input type="text" defaultValue={d.label} className="w-full border rounded px-2 py-1 text-gray-700" readOnly />
        </div>

        {d.config?.conditions && (
          <div>
            <label className="text-gray-500 block">Conditions</label>
            {d.config.conditions.map((c, i) => (
              <div key={i} className="bg-gray-50 rounded px-2 py-1 mt-1 font-mono text-[11px]">
                {c.logicalOp && <span className="text-blue-600">{c.logicalOp} </span>}
                {c.variableName} <span className="text-amber-600">{c.comparator}</span> {String(c.value)}
              </div>
            ))}
          </div>
        )}

        {d.config?.resultVariable && (
          <div>
            <label className="text-gray-500 block">Result Variable</label>
            <span className="font-mono text-purple-600">{d.config.resultVariable}</span>
          </div>
        )}

        {d.config?.outputLabel && (
          <div>
            <label className="text-gray-500 block">Output</label>
            <span className="text-gray-700">{d.config.outputLabel}</span>
          </div>
        )}

        <div>
          <label className="text-gray-500 block">Position</label>
          <span className="font-mono text-gray-600">x: {Math.round(node.position.x)}, y: {Math.round(node.position.y)}</span>
        </div>
      </div>
    </div>
  );
}
