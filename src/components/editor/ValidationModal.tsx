'use client';

import { useAppStore } from '@/lib/store';
import type { ValidationError } from '@/types';

const severityStyle: Record<ValidationError['severity'], string> = {
  error:   'bg-red-50 border-red-200 text-red-700',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-700',
};
const severityIcon: Record<ValidationError['severity'], string> = {
  error: '❌', warning: '⚠️',
};

export default function ValidationModal() {
  const { showValidation, setShowValidation, validationErrors, nodes, setSelectedNodeId, setEditingNodeId } = useAppStore();

  if (!showValidation) return null;

  const isValid = validationErrors.length === 1 && validationErrors[0].code === 'OK';
  const errorCount   = validationErrors.filter((e) => e.severity === 'error'   && e.code !== 'OK').length;
  const warningCount = validationErrors.filter((e) => e.severity === 'warning' && e.code !== 'OK').length;

  const CHECKS = [
    'Single start node',
    'At least one end node',
    'All nodes connected',
    'Decision nodes have ≥ 2 branches',
    'Variable references resolved',
    'Subprocess references valid',
    'Output definitions consistent',
  ];

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={() => setShowValidation(false)}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-[500px] max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-5 ${isValid ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-red-500 to-rose-600'}`}>
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">
                {isValid ? '✅ Validation Passed' : '❌ Validation Failed'}
              </h2>
              {!isValid && (
                <p className="text-white/80 text-xs mt-1">
                  {errorCount > 0 && `${errorCount} error${errorCount !== 1 ? 's' : ''}`}
                  {errorCount > 0 && warningCount > 0 && ' · '}
                  {warningCount > 0 && `${warningCount} warning${warningCount !== 1 ? 's' : ''}`}
                </p>
              )}
            </div>
            <button
              onClick={() => setShowValidation(false)}
              className="text-white/70 hover:text-white text-2xl leading-none transition-colors"
            >
              ×
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {isValid ? (
            <div className="space-y-2">
              {CHECKS.map((check) => (
                <div key={check} className="flex items-center gap-3 text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2">
                  <span className="text-green-500 text-base shrink-0">✓</span>
                  <span>{check}</span>
                </div>
              ))}
              <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 mt-2">
                <p className="text-sm text-green-700 font-medium">
                  The workflow is ready for preview execution or export.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {validationErrors.map((err, i) => {
                const linkedNode = err.nodeId ? nodes.find((n) => n.id === err.nodeId) : null;
                return (
                  <div
                    key={i}
                    className={`flex items-start gap-3 text-sm p-3 rounded-lg border ${severityStyle[err.severity]}`}
                  >
                    <span className="text-base shrink-0">{severityIcon[err.severity]}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-[10px] bg-black/10 px-1.5 py-0.5 rounded font-semibold">
                          {err.code}
                        </span>
                        <span className="text-xs">{err.message}</span>
                      </div>
                      {linkedNode && (
                        <button
                          onClick={() => {
                            setShowValidation(false);
                            setSelectedNodeId(err.nodeId!);
                            setEditingNodeId(err.nodeId!);
                          }}
                          className="mt-1.5 text-[10px] underline underline-offset-2 opacity-70 hover:opacity-100 font-medium"
                        >
                          → Jump to node: {(linkedNode.data as { label: string }).label}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-gray-50">
          <p className="text-[11px] text-gray-400">
            {nodes.length} node{nodes.length !== 1 ? 's' : ''} checked
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setShowValidation(false)}
              className="px-4 py-2 text-sm bg-white text-gray-700 rounded-lg hover:bg-gray-100 border border-gray-200 transition-colors"
            >
              Close
            </button>
            {!isValid && (
              <button
                onClick={() => setShowValidation(false)}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Fix Issues
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
