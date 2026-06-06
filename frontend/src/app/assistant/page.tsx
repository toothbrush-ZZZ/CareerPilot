'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ChatWindow } from '@/components/assistant/ChatWindow';
import { QuickPrompts } from '@/components/assistant/QuickPrompts';
import { useAssistantStore } from '@/lib/store/useAssistantStore';
import { FileText, Target } from 'lucide-react';

export default function AssistantPage() {
  const { sendMessage } = useAssistantStore();
  const handlePromptSelect = (prompt: string) => { sendMessage(prompt); };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="flex h-full"
    >
      {/* Context Panel */}
      <div
        className="w-72 flex-shrink-0 p-5 hidden lg:flex flex-col gap-6 overflow-y-auto"
        style={{ borderRight: '1px solid var(--border)', background: 'var(--bg-panel)' }}
      >
        <div>
          <h2
            className="text-[10px] font-bold uppercase tracking-widest mb-4 flex items-center gap-2"
            style={{ color: 'var(--text-muted)' }}
          >
            <Target size={12} style={{ color: 'var(--hud-blue)' }} />
            Active Context
          </h2>
          <div className="flex flex-col gap-3">
            {/* Target role card */}
            <div
              className="p-3 rounded-xl flex flex-col gap-1"
              style={{
                background: 'linear-gradient(135deg, rgba(37,99,235,0.08), rgba(124,58,237,0.06))',
                border: '1px solid rgba(37,99,235,0.2)',
              }}
            >
              <div
                className="text-[9px] uppercase font-bold tracking-widest"
                style={{ color: 'var(--hud-blue)' }}
              >
                Target Role
              </div>
              <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                Data Scientist
              </div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Pathao (Hybrid)
              </div>
            </div>

            {/* Resume card */}
            <div
              className="p-3 rounded-xl flex items-center gap-3"
              style={{ background: 'var(--bg-inset)', border: '1px solid var(--border)' }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(37,99,235,0.1)' }}
              >
                <FileText size={15} style={{ color: 'var(--hud-blue)' }} />
              </div>
              <div className="flex flex-col">
                <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Resume.pdf
                </div>
                <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  Uploaded 2 days ago
                </div>
              </div>
            </div>
          </div>
        </div>

        <QuickPrompts onSelect={handlePromptSelect} />
      </div>

      {/* Chat Window */}
      <div className="flex-1 min-w-0">
        <ChatWindow />
      </div>
    </motion.div>
  );
}
