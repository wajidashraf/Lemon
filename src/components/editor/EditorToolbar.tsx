'use client';

import { useAppStore } from '@/lib/store';

export function EditorToolbar() {
  const { nodes, setShowPreview, setShowExport, setShowValidation, setValidationErrors, workflowLoaded } = useAppStore();

  const handleValidate = () => {
    if (nodes.length === 0) {
      setValidationErrors([{ code: 'EMPTY', message: 'No workflow to validate', severity: 'error' }]);
      setShowValidation(true);
      return;
    }
    // Simulate validation
    const startNodes = nodes.filter((n) => n.type === 'start');
    const endNodes = nodes.filter((n) => n.type === 'end');
    const errors = [];
    if (startNodes.length !== 1) errors.push({ code: 'START', message: `Expected 1 start node, found ${startNodes.length}`, severity: 'error' as const });
    if (endNodes.length === 0) errors.push({ code: 'END', message: 'No end node found', severity: 'error' as const });

    if (errors.length === 0) {
      setValidationErrors([
        { code: 'OK', message: 'All checks passed — workflow is valid!', severity: 'warning' as const },
      ]);
    } else {
      setValidationErrors(errors);
    }
    setShowValidation(true);
  };

  const btnBase = 'px-3 py-1.5 text-xs font-medium rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed';

  return (
    <div className="h-12 bg-white border-b border-gray-200 px-4 flex items-center gap-2">
      <button onClick={handleValidate} disabled={!workflowLoaded} className={`${btnBase} bg-green-50 text-green-700 hover:bg-green-100 border border-green-200`}>
        ✓ Validate
      </button>
      <button onClick={() => setShowPreview(true)} disabled={!workflowLoaded} className={`${btnBase} bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200`}>
        ▶ Preview
      </button>
      <button onClick={() => setShowExport(true)} disabled={!workflowLoaded} className={`${btnBase} bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200`}>
        ↓ Export
      </button>
      <button disabled={!workflowLoaded} className={`${btnBase} bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200`}>
        💾 Save
      </button>
      <div className="flex-1" />
      <div className="flex gap-1">
        {['start', 'process', 'decision', 'calculation', 'subprocess', 'end'].map((type) => {
          const colors: Record<string, string> = {
            start: 'bg-emerald-100 text-emerald-700',
            process: 'bg-blue-100 text-blue-700',
            decision: 'bg-amber-100 text-amber-700',
            calculation: 'bg-purple-100 text-purple-700',
            subprocess: 'bg-cyan-100 text-cyan-700',
            end: 'bg-red-100 text-red-700',
          };
          const icons: Record<string, string> = {
            start: '▶', process: '⚙', decision: '◇', calculation: '∑', subprocess: '↗', end: '⏹',
          };
          return (
            <span key={type} className={`px-2 py-1 text-[10px] rounded ${colors[type]} font-medium`} title={type}>
              {icons[type]}
            </span>
          );
        })}
      </div>
    </div>
  );
}
