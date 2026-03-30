'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';

export default function PreviewModal() {
  const { showPreview, setShowPreview, variables, nodes } = useAppStore();
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [executed, setExecuted] = useState(false);
  const [executing, setExecuting] = useState(false);

  if (!showPreview) return null;

  const inputVars = variables.filter((v) => !v.isDerived);

  const handleRun = async () => {
    setExecuting(true);
    await new Promise((r) => setTimeout(r, 1500));
    setExecuting(false);
    setExecuted(true);
  };

  const handleClose = () => {
    setShowPreview(false);
    setExecuted(false);
    setInputs({});
  };

  const age = parseInt(inputs['age'] || '72');
  const hasChestPain = inputs['hasChestPain'] !== 'false';
  const riskScore = age + 10;
  const recommendation = riskScore > 75 ? 'Immediate cardiology referral' : hasChestPain ? 'Admit for observation' : 'Discharge with follow-up';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={handleClose}>
      <div className="bg-white rounded-xl shadow-2xl w-[600px] max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">Preview Execution</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>

        <div className="p-4 space-y-4">
          {/* Input Form */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Input Variables</h3>
            <div className="space-y-3">
              {inputVars.map((v) => (
                <div key={v.id} className="flex items-center gap-3">
                  <label className="text-sm text-gray-600 w-32 shrink-0">{v.name}</label>
                  {v.type === 'boolean' ? (
                    <select
                      className="flex-1 border rounded px-2 py-1.5 text-sm"
                      value={inputs[v.name] || v.defaultValue || 'true'}
                      onChange={(e) => setInputs({ ...inputs, [v.name]: e.target.value })}
                    >
                      <option value="true">true</option>
                      <option value="false">false</option>
                    </select>
                  ) : v.type === 'enum' ? (
                    <select
                      className="flex-1 border rounded px-2 py-1.5 text-sm"
                      value={inputs[v.name] || v.defaultValue || ''}
                      onChange={(e) => setInputs({ ...inputs, [v.name]: e.target.value })}
                    >
                      {v.enumOptions?.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  ) : (
                    <input
                      type={v.type === 'number' ? 'number' : 'text'}
                      className="flex-1 border rounded px-2 py-1.5 text-sm"
                      value={inputs[v.name] || v.defaultValue || ''}
                      onChange={(e) => setInputs({ ...inputs, [v.name]: e.target.value })}
                      placeholder={`Enter ${v.name}`}
                    />
                  )}
                  <span className="text-[10px] bg-gray-200 text-gray-500 px-2 py-0.5 rounded">{v.type}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={handleRun}
                disabled={executing}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {executing ? '⏳ Executing...' : '▶ Run'}
              </button>
              <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200">
                ⏭ Step
              </button>
              <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200">
                ⏹ Stop
              </button>
            </div>
          </div>

          {/* Results */}
          {executed && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-green-800 mb-3">✅ Execution completed in 7 steps</h3>

              <div className="space-y-3">
                <div>
                  <label className="text-xs text-green-600 font-medium">Output</label>
                  <div className="text-sm font-bold text-green-900 bg-green-100 rounded px-3 py-2 mt-1">
                    &ldquo;{recommendation}&rdquo;
                  </div>
                </div>

                <div>
                  <label className="text-xs text-green-600 font-medium">Execution Path</label>
                  <div className="text-xs text-green-800 bg-green-100 rounded px-3 py-2 mt-1 font-mono">
                    START → Age Check ({age >= 65 ? 'TRUE → Calc Risk' : 'FALSE → Chest Pain Check'}) → {riskScore > 75 ? 'Risk > 75 (TRUE) → Cardiology Referral → END' : 'Assessment → END'}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-green-600 font-medium">Final Variables</label>
                  <div className="mt-1 bg-green-100 rounded px-3 py-2 space-y-1">
                    <div className="text-xs font-mono text-green-800">age = {age}</div>
                    <div className="text-xs font-mono text-green-800">hasChestPain = {String(hasChestPain)}</div>
                    <div className="text-xs font-mono text-green-800">bloodPressure = {inputs['bloodPressure'] || '130'}</div>
                    <div className="text-xs font-mono text-green-800">painDuration = {inputs['painDuration'] || '15'}</div>
                    <div className="text-xs font-mono text-purple-700">riskScore = {riskScore} <span className="text-gray-500">(derived)</span></div>
                    <div className="text-xs font-mono text-purple-700">recommendation = &ldquo;{recommendation}&rdquo; <span className="text-gray-500">(derived)</span></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
