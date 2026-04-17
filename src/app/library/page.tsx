'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { libraryWorkflows } from '@/lib/mock-data';
import type { Workflow, WorkflowStatus } from '@/types';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';

const statusConfig: Record<WorkflowStatus, { label: string; color: string; icon: string }> = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-600', icon: '📝' },
  valid: { label: 'Valid', color: 'bg-green-100 text-green-700', icon: '✅' },
  published: { label: 'Published', color: 'bg-blue-100 text-blue-700', icon: '🌐' },
};

function WorkflowCard({ workflow }: { workflow: Workflow }) {
  const router = useRouter();
  const { setNodes, setEdges, setVariables: setWfVariables, setWorkflowName, loadSampleWorkflow } = useAppStore();
  const status = statusConfig[workflow.status];
  const updatedAgo = getTimeAgo(workflow.updatedAt);

  const handleOpen = () => {
    // For the POC, we load the sample workflow from mock data
    // In production, this would fetch from API based on workflow.id
    loadSampleWorkflow();
    router.push('/');
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-all hover:border-blue-300 group">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-base font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
          {workflow.name}
        </h3>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${status.color}`}>
          {status.icon} {status.label}
        </span>
      </div>

      <p className="text-sm text-gray-500 mb-4 line-clamp-2">{workflow.description}</p>

      <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
        <span>v{workflow.version}</span>
        <span>&middot;</span>
        <span>{workflow.nodeCount} nodes</span>
        <span>&middot;</span>
        <span>Updated {updatedAgo}</span>
      </div>

      <div className="flex gap-2">
        <button onClick={handleOpen} className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium">
          Open
        </button>
        <button className="px-3 py-1.5 text-xs bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200">
          Export
        </button>
        {workflow.status === 'valid' && (
          <button className="px-3 py-1.5 text-xs bg-green-50 text-green-700 rounded-md hover:bg-green-100 border border-green-200">
            Publish
          </button>
        )}
        <button className="px-3 py-1.5 text-xs text-red-500 hover:bg-red-50 rounded-md ml-auto">
          Delete
        </button>
      </div>
    </div>
  );
}

function getTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'today';
  if (days === 1) return '1 day ago';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
}

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState<'my' | 'shared'>('my');
  const [search, setSearch] = useState('');

  const myWorkflows = libraryWorkflows.filter((w) => !search || w.name.toLowerCase().includes(search.toLowerCase()));
  const sharedWorkflows = libraryWorkflows.filter((w) => w.status === 'published');

  const workflows = activeTab === 'my' ? myWorkflows : sharedWorkflows;

  return (
    <div className="h-[calc(100vh-48px)] bg-gray-50 overflow-y-auto">
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Workflow Library</h1>
          <p className="text-sm text-gray-500 mt-1">Browse, manage, and share your workflows</p>
        </div>

        <div className="flex gap-1 mb-4 bg-gray-200 rounded-lg p-1 w-fit">
          <button
            onClick={() => setActiveTab('my')}
            className={`px-4 py-2 text-sm rounded-md font-medium transition-colors ${
              activeTab === 'my' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            My Workflows ({libraryWorkflows.length})
          </button>
          <button
            onClick={() => setActiveTab('shared')}
            className={`px-4 py-2 text-sm rounded-md font-medium transition-colors ${
              activeTab === 'shared' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Shared Library ({sharedWorkflows.length})
          </button>
        </div>

        <div className="mb-6">
          <input
            type="text"
            placeholder="🔍 Search workflows..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workflows.map((wf) => (
            <WorkflowCard key={wf.id} workflow={wf} />
          ))}
        </div>

        {workflows.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-3">📂</div>
            <p>No workflows found</p>
          </div>
        )}
      </div>
    </div>
  );
}
