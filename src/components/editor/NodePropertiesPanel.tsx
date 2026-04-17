'use client';

import { useAppStore } from '@/lib/store';
import type { WorkflowNodeData } from '@/types';

const typeColors: Record<string, { bg: string; border: string; badge: string; text: string }> = {
  start:       { bg: 'bg-emerald-50', border: 'border-emerald-500', badge: 'bg-emerald-100 text-emerald-700', text: 'text-emerald-700' },
  process:     { bg: 'bg-blue-50',    border: 'border-blue-500',    badge: 'bg-blue-100 text-blue-700',       text: 'text-blue-700'    },
  decision:    { bg: 'bg-amber-50',   border: 'border-amber-500',   badge: 'bg-amber-100 text-amber-700',     text: 'text-amber-700'   },
  calculation: { bg: 'bg-purple-50',  border: 'border-purple-500',  badge: 'bg-purple-100 text-purple-700',   text: 'text-purple-700'  },
  subprocess:  { bg: 'bg-cyan-50',    border: 'border-cyan-500',    badge: 'bg-cyan-100 text-cyan-700',       text: 'text-cyan-700'    },
  end:         { bg: 'bg-red-50',     border: 'border-red-500',     badge: 'bg-red-100 text-red-700',         text: 'text-red-700'     },
};

const typeIcons: Record<string, string> = {
  start: '▶', process: '⚙', decision: '◇', calculation: '∑', subprocess: '↗', end: '⏹',
};

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <span className="text-gray-400 shrink-0 text-[11px]">{label}</span>
      <span className={`text-gray-700 text-right text-[11px] ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  );
}

export function NodePropertiesPanel() {
  const { selectedNodeId, nodes, edges, setSelectedNodeId, setEditingNodeId, deleteNode } = useAppStore();
  const node = nodes.find((n) => n.id === selectedNodeId);

  if (!node) return null;

  const d = node.data as WorkflowNodeData;
  const colors = typeColors[d.nodeType] ?? {
    bg: 'bg-gray-50', border: 'border-gray-300', badge: 'bg-gray-100 text-gray-700', text: 'text-gray-700',
  };

  const inCount  = edges.filter((e) => e.target === node.id).length;
  const outCount = edges.filter((e) => e.source === node.id).length;
  const conditions = d.config?.conditions ?? [];

  return (
    <div className={`${colors.bg} rounded-xl shadow-2xl border-l-4 ${colors.border} w-72 overflow-hidden`}>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="px-4 pt-3 pb-2 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className={`text-lg ${colors.text}`}>{typeIcons[d.nodeType]}</span>
          <div>
            <p className="text-xs font-bold text-gray-800 leading-tight max-w-[180px] truncate">{d.label}</p>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium capitalize ${colors.badge}`}>
              {d.nodeType}
            </span>
          </div>
        </div>
        <button
          onClick={() => setSelectedNodeId(null)}
          className="text-gray-400 hover:text-gray-600 text-xl leading-none transition-colors mt-0.5"
        >
          ×
        </button>
      </div>

      {/* ── Body ────────────────────────────────────────────────────────── */}
      <div className="px-4 pb-3 space-y-2">

        {/* Basic info */}
        <div className="bg-white/70 rounded-lg px-3 py-2 space-y-1.5">
          <InfoRow label="ID"       value={node.id} mono />
          <InfoRow label="Position" value={`x: ${Math.round(node.position.x)}, y: ${Math.round(node.position.y)}`} mono />
          <InfoRow label="Links"    value={`↙ ${inCount} in · ${outCount} out ↗`} />
        </div>

        {/* Decision conditions */}
        {conditions.length > 0 && (
          <div>
            <p className="text-gray-500 font-semibold uppercase tracking-wider text-[10px] mb-1">Conditions</p>
            <div className="space-y-1">
              {conditions.map((c, i) => (
                <div key={i} className="bg-white/70 rounded-md px-2 py-1.5 font-mono text-[10px] text-gray-700">
                  {c.logicalOp && (
                    <span className="text-blue-600 font-bold">{c.logicalOp} </span>
                  )}
                  <span className="text-gray-900">{c.variableName}</span>
                  <span className="text-amber-600 mx-1">{c.comparator}</span>
                  <span className="text-gray-900">{String(c.value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Result variable */}
        {d.config?.resultVariable && (
          <div className="bg-white/70 rounded-lg px-3 py-2">
            <p className="text-gray-500 text-[10px] mb-0.5">Result Variable</p>
            <span className="font-mono text-purple-600 font-semibold text-xs">{d.config.resultVariable}</span>
          </div>
        )}

        {/* Output label */}
        {d.config?.outputLabel && (
          <div className="bg-white/70 rounded-lg px-3 py-2">
            <p className="text-gray-500 text-[10px] mb-0.5">Output</p>
            <span className="text-gray-700 text-xs">{d.config.outputLabel}</span>
          </div>
        )}

        {/* Referenced workflow */}
        {d.config?.referencedWorkflowId && (
          <div className="bg-white/70 rounded-lg px-3 py-2">
            <p className="text-gray-500 text-[10px] mb-0.5">Subprocess Ref</p>
            <span className="font-mono text-cyan-600 text-xs">{d.config.referencedWorkflowId}</span>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => setEditingNodeId(node.id)}
            className="flex-1 py-1.5 text-[11px] font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ✏ Edit
          </button>
          <button
            onClick={() => {
              if (confirm(`Delete "${d.label}" and its connections?`)) deleteNode(node.id);
            }}
            className="px-3 py-1.5 text-[11px] font-semibold bg-red-100 text-red-600 rounded-lg hover:bg-red-200 border border-red-200 transition-colors"
          >
            🗑
          </button>
        </div>
      </div>
    </div>
  );
}
