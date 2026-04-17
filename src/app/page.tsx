'use client';

import { ReactFlowProvider } from '@xyflow/react';
import ChatPanel from '@/components/chat/ChatPanel';
import WorkflowEditor from '@/components/editor/WorkflowEditor';
import PreviewModal from '@/components/preview/PreviewModal';
import ExportModal from '@/components/export/ExportModal';
import ValidationModal from '@/components/editor/ValidationModal';

export default function WorkspacePage() {
  return (
    <ReactFlowProvider>
      <div className="flex h-[calc(100vh-48px)]">
        {/* Chat Panel — 35% */}
        <div className="w-[35%] min-w-[320px] border-r border-gray-200">
          <ChatPanel />
        </div>

        {/* Visual Editor — 65% (includes NodeEditModal, ContextMenu, PropertiesPanel internally) */}
        <div className="flex-1 min-w-0">
          <WorkflowEditor />
        </div>
      </div>

      {/* Global modals */}
      <PreviewModal />
      <ExportModal />
      <ValidationModal />
    </ReactFlowProvider>
  );
}
