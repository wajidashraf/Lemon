'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '@/lib/store';
import type { WorkflowNodeData, NodeType, DecisionCondition, NodeConfig } from '@/types';

const NODE_TYPES: NodeType[] = ['start', 'process', 'decision', 'calculation', 'subprocess', 'end'];
const COMPARATORS = ['==', '!=', '>', '<', '>=', '<=', 'contains', 'startsWith'] as const;
const CALC_OPERATORS = ['add', 'subtract', 'multiply', 'divide', 'modulo', 'round', 'abs'] as const;
const LOGIC_OPS = [null, 'AND', 'OR'] as const;

const typeAccent: Record<NodeType, string> = {
  start: 'from-emerald-500 to-emerald-600',
  process: 'from-blue-500 to-blue-600',
  decision: 'from-amber-500 to-amber-600',
  calculation: 'from-purple-500 to-purple-600',
  subprocess: 'from-cyan-500 to-cyan-600',
  end: 'from-red-500 to-red-600',
};

const typeLabel: Record<NodeType, string> = {
  start: '▶ Start',
  process: '⚙ Process',
  decision: '◇ Decision',
  calculation: '∑ Calculation',
  subprocess: '↗ Subprocess',
  end: '⏹ End',
};

type Tab = 'general' | 'config';

export default function NodeEditModal() {
  const { editingNodeId, setEditingNodeId, nodes, updateNode, deleteNode } = useAppStore();

  const node = nodes.find((n) => n.id === editingNodeId);

  // ─── local form state ──────────────────────────────────────────────────────
  const [label, setLabel] = useState('');
  const [nodeType, setNodeType] = useState<NodeType>('process');
  const [config, setConfig] = useState<NodeConfig>({});
  const [tab, setTab] = useState<Tab>('general');

  // Sync from store when node changes
  useEffect(() => {
    if (!node) return;
    const d = node.data as WorkflowNodeData;
    setLabel(d.label);
    setNodeType(d.nodeType);
    setConfig(d.config ? JSON.parse(JSON.stringify(d.config)) : {});
    setTab('general');
  }, [node]);

  const handleSave = useCallback(() => {
    if (!editingNodeId) return;
    updateNode(editingNodeId, { label, nodeType, config });
    setEditingNodeId(null);
  }, [editingNodeId, label, nodeType, config, updateNode, setEditingNodeId]);

  const handleDelete = useCallback(() => {
    if (!editingNodeId) return;
    if (confirm('Delete this node and all its connected edges?')) {
      deleteNode(editingNodeId);
    }
  }, [editingNodeId, deleteNode]);

  if (!node || !editingNodeId) return null;

  // ─── Config helpers ────────────────────────────────────────────────────────
  const conditions: DecisionCondition[] = config.conditions ?? [];

  const setCondition = (i: number, patch: Partial<DecisionCondition>) => {
    const next = conditions.map((c, idx) => (idx === i ? { ...c, ...patch } : c));
    setConfig((prev) => ({ ...prev, conditions: next }));
  };

  const addCondition = () =>
    setConfig((prev) => ({
      ...prev,
      conditions: [
        ...(prev.conditions ?? []),
        { variableName: 'variable', comparator: '==' as const, value: 'value', logicalOp: null },
      ],
    }));

  const removeCondition = (i: number) =>
    setConfig((prev) => ({ ...prev, conditions: (prev.conditions ?? []).filter((_, idx) => idx !== i) }));

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={() => setEditingNodeId(null)}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-[540px] max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`bg-gradient-to-r ${typeAccent[nodeType]} p-4 shrink-0`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-xs font-medium uppercase tracking-widest">Edit Node</p>
              <h2 className="text-white text-lg font-bold mt-0.5 truncate max-w-[380px]">{label || '(untitled)'}</h2>
            </div>
            <button
              onClick={() => setEditingNodeId(null)}
              className="text-white/70 hover:text-white text-2xl leading-none transition-colors"
            >
              ×
            </button>
          </div>
          {/* Tabs */}
          <div className="flex gap-1 mt-3">
            {(['general', 'config'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all capitalize ${
                  tab === t ? 'bg-white text-gray-800 shadow' : 'text-white/80 hover:bg-white/20'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {tab === 'general' && (
            <>
              {/* Label */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
                  Label
                </label>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="Node label..."
                />
              </div>

              {/* Node Type */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
                  Node Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {NODE_TYPES.map((t) => (
                    <button
                      key={t}
                      onClick={() => setNodeType(t)}
                      className={`py-2 px-3 rounded-lg text-xs font-medium border-2 transition-all text-left ${
                        nodeType === t
                          ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {typeLabel[t]}
                    </button>
                  ))}
                </div>
              </div>

              {/* ID (read-only) */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
                  Node ID
                </label>
                <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono text-gray-500">
                  {node.id}
                </div>
              </div>
            </>
          )}

          {tab === 'config' && (
            <>
              {/* ── Decision conditions ─────────────────────────────────────── */}
              {nodeType === 'decision' && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Conditions</label>
                    <button
                      onClick={addCondition}
                      className="text-xs bg-amber-100 text-amber-700 hover:bg-amber-200 px-3 py-1 rounded-full font-medium transition-colors"
                    >
                      + Add
                    </button>
                  </div>
                  <div className="space-y-3">
                    {conditions.map((cond, i) => (
                      <div key={i} className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-2">
                        {i > 0 && (
                          <select
                            value={cond.logicalOp ?? 'AND'}
                            onChange={(e) => setCondition(i, { logicalOp: e.target.value as 'AND' | 'OR' | null })}
                            className="text-xs border border-amber-300 rounded px-2 py-1 bg-white font-semibold text-amber-700"
                          >
                            {LOGIC_OPS.filter(Boolean).map((op) => (
                              <option key={op} value={op!}>
                                {op}
                              </option>
                            ))}
                          </select>
                        )}
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <p className="text-[10px] text-gray-400 mb-1">Variable</p>
                            <input
                              type="text"
                              value={cond.variableName}
                              onChange={(e) => setCondition(i, { variableName: e.target.value })}
                              className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs bg-white text-gray-700"
                            />
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-400 mb-1">Comparator</p>
                            <select
                              value={cond.comparator}
                              onChange={(e) =>
                                setCondition(i, {
                                  comparator: e.target.value as DecisionCondition['comparator'],
                                })
                              }
                              className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs bg-white font-semibold text-gray-700"
                            >
                              {COMPARATORS.map((c) => (
                                <option key={c} value={c} >
                                  {c}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-400 mb-1">Value</p>
                            <input
                              type="text"
                              value={String(cond.value)}
                              onChange={(e) => setCondition(i, { value: e.target.value })}
                              className="w-full border border-gray-500 rounded px-2 py-1.5 text-xs bg-white text-gray-700"
                            />
                          </div>
                        </div>
                        <button
                          onClick={() => removeCondition(i)}
                          className="text-[10px] text-red-500 hover:text-red-700 font-medium"
                        >
                          Remove condition
                        </button>
                      </div>
                    ))}
                    {conditions.length === 0 && (
                      <p className="text-xs text-gray-400 text-center py-4">No conditions yet. Click "+ Add" to add one.</p>
                    )}
                  </div>
                </div>
              )}

              {/* ── Calculation ─────────────────────────────────────────────── */}
              {nodeType === 'calculation' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
                      Result Variable
                    </label>
                    <input
                      type="text"
                      value={config.resultVariable ?? ''}
                      onChange={(e) => setConfig((prev) => ({ ...prev, resultVariable: e.target.value }))}
                      placeholder="e.g. riskScore"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
                      Operator
                    </label>
                    <select
                      value={config.expression?.operator ?? 'add'}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          expression: {
                            operator: e.target.value as typeof CALC_OPERATORS[number],
                            operands: prev.expression?.operands ?? [],
                          },
                        }))
                      }
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                    >
                      {CALC_OPERATORS.map((op) => (
                        <option key={op} value={op}>
                          {op}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
                      Operands (variable names or numbers, comma-separated)
                    </label>
                    <input
                      type="text"
                      value={(config.expression?.operands ?? [])
                        .map((o) => o.variable ?? String(o.value ?? ''))
                        .join(', ')}
                      onChange={(e) => {
                        const parts = e.target.value.split(',').map((s) => s.trim());
                        const operands = parts.map((p) => {
                          const n = Number(p);
                          return isNaN(n) || p === '' ? { variable: p } : { value: n };
                        });
                        setConfig((prev) => ({
                          ...prev,
                          expression: { operator: prev.expression?.operator ?? 'add', operands },
                        }));
                      }}
                      placeholder="age, 10"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                  </div>
                </div>
              )}

              {/* ── End node output ─────────────────────────────────────────── */}
              {nodeType === 'end' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
                      Output Variable
                    </label>
                    <input
                      type="text"
                      value={config.outputVariable ?? ''}
                      onChange={(e) => setConfig((prev) => ({ ...prev, outputVariable: e.target.value }))}
                      placeholder="e.g. recommendation"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
                      Output Label
                    </label>
                    <input
                      type="text"
                      value={config.outputLabel ?? ''}
                      onChange={(e) => setConfig((prev) => ({ ...prev, outputLabel: e.target.value }))}
                      placeholder="e.g. Immediate cardiology referral"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                    />
                  </div>
                </div>
              )}

              {/* ── Subprocess ──────────────────────────────────────────────── */}
              {nodeType === 'subprocess' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
                    Referenced Workflow ID
                  </label>
                  <input
                    type="text"
                    value={config.referencedWorkflowId ?? ''}
                    onChange={(e) => setConfig((prev) => ({ ...prev, referencedWorkflowId: e.target.value }))}
                    placeholder="e.g. wf-2"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  />
                </div>
              )}

              {/* ── Process / Start — no extra config ───────────────────────── */}
              {(nodeType === 'process' || nodeType === 'start') && (
                <div className="bg-gray-50 rounded-lg p-4 text-center text-sm text-gray-400">
                  No additional configuration for <strong className="text-gray-600">{nodeType}</strong> nodes.
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-5 py-4 flex items-center justify-between shrink-0 bg-gray-50">
          <button
            onClick={handleDelete}
            className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition-colors"
          >
            🗑 Delete Node
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => setEditingNodeId(null)}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
