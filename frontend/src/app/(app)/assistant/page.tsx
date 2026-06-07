'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ChatWindow } from '@/components/assistant/ChatWindow';
import { QuickPrompts } from '@/components/assistant/QuickPrompts';
import { useAssistantStore } from '@/lib/store/useAssistantStore';
import { FileText, Target, Trash2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

function AssistantContent() {
  const { sendMessage, clearSession } = useAssistantStore();
  const searchParams = useSearchParams();
  const jobTitle = searchParams.get('job') || '';
  const jobCompany = searchParams.get('company') || '';
  const action = searchParams.get('action');

  const actionHandled = React.useRef(false);

  React.useEffect(() => {
    if (action === 'cover_letter' && jobTitle && !actionHandled.current) {
      actionHandled.current = true;
      sendMessage(`Please draft a cover letter for the ${jobTitle} position${jobCompany ? ` at ${jobCompany}` : ''}.`, jobTitle, jobCompany);
    }
  }, [action, jobTitle, jobCompany, sendMessage]);

  const handlePromptSelect = (prompt: string) => { 
    sendMessage(prompt, jobTitle, jobCompany); 
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="flex h-full"
    >
      
      <div
        className="w-72 flex-shrink-0 p-5 hidden lg:flex flex-col gap-6 overflow-y-auto"
        style={{ borderRight: '1px solid var(--cp-border)', background: 'var(--cp-card)' }}
      >
        <div>
          <h2
            className="text-[11px] font-medium tracking-[-0.01em] mb-4 flex items-center gap-2"
            style={{ color: 'var(--cp-text-muted)' }}
          >
            <Target size={20} strokeWidth={1.5} style={{ color: 'var(--cp-accent)' }} />
            Active context
          </h2>
          <div className="flex flex-col gap-3">
            {jobTitle && (
              <div
                className="p-3 rounded-xl flex flex-col gap-1 relative group"
                style={{
                  background: 'var(--cp-surface)',
                  border: '1px solid var(--cp-border-accent)',
                }}
              >
                <div
                  className="text-[11px] font-medium tracking-[-0.01em]"
                  style={{ color: 'var(--cp-accent)' }}
                >
                  Target role
                </div>
                <div className="text-sm font-semibold truncate pr-6" style={{ color: 'var(--cp-text-primary)' }} title={jobTitle}>
                  {jobTitle}
                </div>
                {jobCompany && (
                  <div className="text-xs truncate" style={{ color: 'var(--cp-text-muted)' }} title={jobCompany}>
                    {jobCompany}
                  </div>
                )}
              </div>
            )}

            
            <div
              className="p-3 rounded-xl flex items-center gap-3"
              style={{ background: 'var(--cp-surface)', border: '1px solid var(--cp-border)' }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: 'var(--cp-accent-dim)' }}
              >
                <FileText size={20} strokeWidth={1.5} style={{ color: 'var(--cp-accent)' }} />
              </div>
              <div className="flex flex-col">
                <div className="text-sm font-semibold" style={{ color: 'var(--cp-text-primary)' }}>
                  Resume.pdf
                </div>
                <div className="text-[10px]" style={{ color: 'var(--cp-text-muted)' }}>
                  Uploaded 2 days ago
                </div>
              </div>
            </div>
          </div>
        </div>

        <QuickPrompts onSelect={handlePromptSelect} />

        <div className="mt-auto pt-4 border-t" style={{ borderColor: 'var(--cp-border)' }}>
          <button
            onClick={clearSession}
            className="flex items-center justify-center gap-2 w-full p-2 rounded-lg text-xs font-semibold hover:bg-red-500/10 transition-colors"
            style={{ color: 'var(--cp-danger)' }}
          >
            <Trash2 size={16} strokeWidth={1.5} />
            Clear Chat
          </button>
        </div>
      </div>

      
      <div className="flex-1 min-w-0">
        <ChatWindow />
      </div>
    </motion.div>
  );
}

export default function AssistantPage() {
  return (
    <React.Suspense fallback={<div className="flex-1 flex items-center justify-center h-full">Loading...</div>}>
      <AssistantContent />
    </React.Suspense>
  );
}
