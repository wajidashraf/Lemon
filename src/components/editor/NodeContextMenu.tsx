'use client';

import { useEffect, useRef } from 'react';
import { useAppStore } from '@/lib/store';

export default function NodeContextMenu() {
  const { contextMenu, setContextMenu, setEditingNodeId, duplicateNode, deleteNode, nodes } = useAppStore();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setContextMenu(null);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [setContextMenu]);

  if (!contextMenu) return null;

  const node = nodes.find((n) => n.id === contextMenu.nodeId);
  if (!node) return null;

  const label = (node.data as { label: string }).label;

  const menuItems = [
    {
      icon: '✏️',
      label: 'Edit Node',
      onClick: () => { setEditingNodeId(contextMenu.nodeId); setContextMenu(null); },
      className: 'text-blue-700 hover:bg-blue-50',
    },
    {
      icon: '📋',
      label: 'Duplicate',
      onClick: () => duplicateNode(contextMenu.nodeId),
      className: 'text-gray-700 hover:bg-gray-50',
    },
    { divider: true },
    {
      icon: '🗑️',
      label: 'Delete Node',
      onClick: () => { if (confirm(`Delete "${label}"?`)) deleteNode(contextMenu.nodeId); },
      className: 'text-red-600 hover:bg-red-50',
    },
  ] as const;

  return (
    <>
      {/* backdrop */}
      <div className="fixed inset-0 z-40" onMouseDown={() => setContextMenu(null)} />

      <div
        ref={ref}
        className="fixed z-50 bg-white border border-gray-200 rounded-xl shadow-2xl py-1.5 min-w-[180px]"
        style={{ left: contextMenu.x, top: contextMenu.y }}
      >
        {/* Title */}
        <div className="px-3 py-1.5 border-b border-gray-100 mb-1">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Node</p>
          <p className="text-xs font-semibold text-gray-700 truncate max-w-[160px]">{label}</p>
        </div>

        {menuItems.map((item, i) => {
          if ('divider' in item) {
            return <div key={i} className="my-1 border-t border-gray-100" />;
          }
          return (
            <button
              key={i}
              onClick={item.onClick}
              className={`w-full text-left flex items-center gap-2.5 px-3 py-2 text-xs font-medium transition-colors ${item.className}`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}
