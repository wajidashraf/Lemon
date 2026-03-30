'use client';

import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { demoConversation, defaultResponses } from '@/lib/mock-data';
import type { ChatMessage } from '@/types';

export default function ChatPanel() {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, addMessage, isChatLoading, setChatLoading, loadSampleWorkflow } = useAppStore();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isChatLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };
    addMessage(userMsg);
    const userInput = input.toLowerCase();
    setInput('');
    setChatLoading(true);

    // Check for demo triggers
    const matched = demoConversation.find((d) => userInput.includes(d.trigger));

    if (matched) {
      for (const resp of matched.responses) {
        await new Promise((r) => setTimeout(r, resp.delay));
        addMessage({
          id: `bot-${Date.now()}`,
          role: 'assistant',
          content: resp.content,
          timestamp: new Date(),
          toolCalls: resp.toolCalls,
        });
      }
      // If it's the create workflow trigger, load the sample
      if (matched.trigger.includes('chest pain')) {
        await new Promise((r) => setTimeout(r, 500));
        loadSampleWorkflow();
      }
    } else {
      await new Promise((r) => setTimeout(r, 800 + Math.random() * 1200));
      const randomResp = defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
      addMessage({
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: randomResp,
        timestamp: new Date(),
      });
    }

    setChatLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="h-12 border-b border-gray-200 px-4 flex items-center gap-2 shrink-0">
        <span className="text-lg">🤖</span>
        <span className="text-sm font-semibold text-gray-700">AI Orchestrator</span>
        <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Online</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
              msg.role === 'user'
                ? 'bg-blue-600 text-white rounded-br-none'
                : 'bg-gray-100 text-gray-800 rounded-bl-none'
            }`}>
              <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{
                __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>').replace(/\n/g, '<br/>')
              }} />
              {msg.toolCalls && msg.toolCalls.length > 0 && (
                <div className="mt-2 border-t border-gray-200 pt-2">
                  <div className="text-[10px] text-gray-500 mb-1">Tool calls:</div>
                  {msg.toolCalls.map((tc, i) => (
                    <div key={i} className="text-[10px] font-mono bg-gray-200 rounded px-1.5 py-0.5 mb-0.5 text-gray-600">
                      {tc}
                    </div>
                  ))}
                </div>
              )}
              <div className={`text-[10px] mt-1 ${msg.role === 'user' ? 'text-blue-200' : 'text-gray-400'}`}>
                {String(msg.timestamp.getHours()).padStart(2, '0')}:{String(msg.timestamp.getMinutes()).padStart(2, '0')}
              </div>
            </div>
          </div>
        ))}
        {isChatLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-3 rounded-bl-none">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-3 shrink-0">
        <div className="flex gap-2">
          <button className="p-2 text-gray-400 hover:text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50" title="Upload diagram">
            📎
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Describe a workflow..."
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-500"
            disabled={isChatLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isChatLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
        <div className="text-[10px] text-gray-400 mt-2 text-center">
          Try: &quot;Create a workflow for triaging chest pain&quot;
        </div>
      </div>
    </div>
  );
}
