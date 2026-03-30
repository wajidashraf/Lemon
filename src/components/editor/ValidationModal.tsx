'use client';

import { useAppStore } from '@/lib/store';

export default function ValidationModal() {
  const { showValidation, setShowValidation, validationErrors } = useAppStore();

  if (!showValidation) return null;

  const hasErrors = validationErrors.some((e) => e.severity === 'error' && e.code !== 'OK');
  const isValid = validationErrors.length === 1 && validationErrors[0].code === 'OK';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowValidation(false)}>
      <div className="bg-white rounded-xl shadow-2xl w-[450px]" onClick={(e) => e.stopPropagation()}>
        <div className={`p-4 rounded-t-xl ${isValid ? 'bg-green-50' : 'bg-red-50'}`}>
          <div className="flex items-center justify-between">
            <h2 className={`text-lg font-bold ${isValid ? 'text-green-800' : 'text-red-800'}`}>
              {isValid ? '✅ Validation Passed' : '❌ Validation Failed'}
            </h2>
            <button onClick={() => setShowValidation(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
          </div>
        </div>

        <div className="p-4 space-y-2">
          {isValid ? (
            <div className="space-y-2">
              {['Single start node', 'All nodes reachable', 'Valid edge references', 'Complete decision branches', 'Variable references resolved', 'Subprocess references valid', 'Output definitions consistent'].map((check) => (
                <div key={check} className="flex items-center gap-2 text-sm text-green-700">
                  <span className="text-green-500">✓</span> {check}
                </div>
              ))}
              <p className="text-sm text-green-600 mt-3 pt-3 border-t border-green-100">
                The workflow is ready for preview execution or export.
              </p>
            </div>
          ) : (
            validationErrors.map((err, i) => (
              <div key={i} className={`flex items-start gap-2 text-sm p-2 rounded ${
                err.severity === 'error' ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-700'
              }`}>
                <span>{err.severity === 'error' ? '❌' : '⚠️'}</span>
                <div>
                  <span className="font-mono text-xs text-gray-400">[{err.code}]</span> {err.message}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-gray-200 flex justify-end">
          <button onClick={() => setShowValidation(false)} className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
