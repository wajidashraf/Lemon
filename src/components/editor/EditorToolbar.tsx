'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import type { NodeType } from '@/types';

const NODE_DEFS: { type: NodeType; icon: string; label: string; color: string }[] = [
  { type: 'start',       icon: '▶', label: 'Start',       color: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-300' },
  { type: 'process',     icon: '⚙', label: 'Process',     color: 'bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-300' },
  { type: 'decision',    icon: '◇', label: 'Decision',    color: 'bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-300' },
  { type: 'calculation', icon: '∑', label: 'Calculation', color: 'bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-300' },
  { type: 'subprocess',  icon: '↗', label: 'Subprocess',  color: 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200 border-cyan-300' },
  { type: 'end',         icon: '⏹', label: 'End',         color: 'bg-red-100 text-red-700 hover:bg-red-200 border-red-300' },
];

export function EditorToolbar() {
  const {
    nodes, edges,
    workflowName, setWorkflowName,
    workflowLoaded,
    addNode,
    undo, redo,
    history, historyIndex,
    clearWorkflow,
    setShowPreview, setShowExport, setShowValidation, setValidationErrors,
  } = useAppStore();

  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(workflowName);
  const [showAddMenu, setShowAddMenu] = useState(false);

  /* ── validation ─────────────────────────────────────────────────────────── */
  const handleValidate = () => {
    if (nodes.length === 0) {
      setValidationErrors([{ code: 'EMPTY', message: 'No workflow to validate', severity: 'error' }]);
      setShowValidation(true);
      return;
    }

    const errors: { code: string; message: string; nodeId?: string; severity: 'error' | 'warning' }[] = [];

    const startNodes  = nodes.filter((n) => n.type === 'start');
    const endNodes    = nodes.filter((n) => n.type === 'end');
    const decisionNodes = nodes.filter((n) => n.type === 'decision');

    if (startNodes.length !== 1)
      errors.push({ code: 'START', message: `Expected 1 start node, found ${startNodes.length}`, severity: 'error' });
    if (endNodes.length === 0)
      errors.push({ code: 'END', message: 'No end node found', severity: 'error' });

    // Orphan nodes (no edges at all)
    const connectedIds = new Set(edges.flatMap((e) => [e.source, e.target]));
    nodes.forEach((n) => {
      if (!connectedIds.has(n.id) && nodes.length > 1)
        errors.push({ code: 'ORPHAN', message: `Node "${(n.data as { label: string }).label}" has no connections`, nodeId: n.id, severity: 'warning' });
    });

    // Decision nodes should have ≥ 2 outgoing edges
    decisionNodes.forEach((n) => {
      const outgoing = edges.filter((e) => e.source === n.id);
      if (outgoing.length < 2)
        errors.push({ code: 'BRANCH', message: `Decision node "${(n.data as { label: string }).label}" needs at least 2 branches`, nodeId: n.id, severity: 'error' });
    });

    if (errors.length === 0) {
      setValidationErrors([{ code: 'OK', message: 'All checks passed — workflow is valid!', severity: 'warning' }]);
    } else {
      setValidationErrors(errors);
    }
    setShowValidation(true);
  };

  /* ── name editing ───────────────────────────────────────────────────────── */
  const commitName = () => {
    setWorkflowName(nameValue.trim() || 'Untitled Workflow');
    setEditingName(false);
  };

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const btnBase = 'px-3 py-1.5 text-xs font-medium rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed border';

  return (
    <div className="h-14 bg-white border-b border-gray-200 px-3 flex items-center gap-2 shrink-0 shadow-sm">

      {/* ── Left: action buttons ─────────────────────────────────────────── */}
      <button
        onClick={handleValidate}
        disabled={!workflowLoaded}
        className={`${btnBase} bg-green-50 text-green-700 hover:bg-green-100 border-green-200`}
        title="Validate workflow"
      >
        ✓ Validate
      </button>
      <button
        onClick={() => setShowPreview(true)}
        disabled={!workflowLoaded}
        className={`${btnBase} bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200`}
        title="Preview execution"
      >
        ▶ Preview
      </button>
      <button
        onClick={() => setShowExport(true)}
        disabled={!workflowLoaded}
        className={`${btnBase} bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200`}
        title="Export workflow"
      >
        ↓ Export
      </button>

      <div className="w-px h-6 bg-gray-200 mx-1" />

      {/* ── Undo / Redo ─────────────────────────────────────────────────── */}
      <button
        onClick={undo}
        disabled={!canUndo}
        className={`${btnBase} bg-gray-50 text-gray-600 hover:bg-gray-100 border-gray-200`}
        title="Undo (Ctrl+Z)"
      >
        ↩ Undo
      </button>
      <button
        onClick={redo}
        disabled={!canRedo}
        className={`${btnBase} bg-gray-50 text-gray-600 hover:bg-gray-100 border-gray-200`}
        title="Redo (Ctrl+Y)"
      >
        ↪ Redo
      </button>

      <div className="w-px h-6 bg-gray-200 mx-1" />

      {/* ── Workflow name (editable) ─────────────────────────────────────── */}
      {editingName ? (
        <input
          autoFocus
          value={nameValue}
          onChange={(e) => setNameValue(e.target.value)}
          onBlur={commitName}
          onKeyDown={(e) => { if (e.key === 'Enter') commitName(); if (e.key === 'Escape') { setNameValue(workflowName); setEditingName(false); } }}
          className="text-xs border border-blue-400 rounded px-2 py-1 w-44 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700"
        />
      ) : (
        <button
          onClick={() => { setNameValue(workflowName); setEditingName(true); }}
          className="text-xs text-gray-500 hover:text-gray-800 hover:bg-gray-100 px-2 py-1 rounded border border-transparent hover:border-gray-200 transition-all max-w-[160px] truncate"
          title="Click to rename workflow"
        >
          ✏ {workflowName}
        </button>
      )}

      {/* ── Spacer ──────────────────────────────────────────────────────── */}
      <div className="flex-1" />

      {/* ── Add Node palette ────────────────────────────────────────────── */}
      <div className="relative">
        <button
          onClick={() => setShowAddMenu((v) => !v)}
          className={`${btnBase} bg-indigo-600 text-white hover:bg-indigo-700 border-indigo-700 font-semibold flex items-center gap-1.5`}
          title="Add a node to the canvas"
        >
          <span className="text-base leading-none">+</span> Add Node
        </button>

        {showAddMenu && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-10" onClick={() => setShowAddMenu(false)} />
            <div className="absolute right-0 top-full mt-2 z-20 bg-white border border-gray-200 rounded-xl shadow-2xl p-3 w-52">
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mb-2 px-1">Node Type</p>
              <div className="space-y-1">
                {NODE_DEFS.map(({ type, icon, label, color }) => (
                  <button
                    key={type}
                    onClick={() => { addNode(type); setShowAddMenu(false); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${color}`}
                  >
                    <span className="text-base">{icon}</span>
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="w-px h-6 bg-gray-200 mx-1" />

      {/* ── Clear ────────────────────────────────────────────────────────── */}
      <button
        onClick={() => { if (confirm('Clear the entire workflow?')) clearWorkflow(); }}
        disabled={nodes.length === 0}
        className={`${btnBase} bg-red-50 text-red-600 hover:bg-red-100 border-red-200`}
        title="Clear workflow"
      >
        🗑 Clear
      </button>

      {/* ── Stats ────────────────────────────────────────────────────────── */}
      <span className="text-[10px] text-gray-400 pl-2 whitespace-nowrap hidden xl:block">
        {nodes.length} nodes · {edges.length} edges
      </span>
    </div>
  );
}
