'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ChatWindow } from '@/components/assistant/ChatWindow';
import { useAssistantStore } from '@/lib/store/useAssistantStore';
import { useSearchParams, useRouter } from 'next/navigation';

function AssistantContent() {
  const { sendMessage } = useAssistantStore();
  const searchParams = useSearchParams();
  const jobTitle = searchParams.get('job') || '';
  const jobCompany = searchParams.get('company') || '';
  const action = searchParams.get('action');

  const actionHandled = React.useRef(false);

  const router = useRouter();

  React.useEffect(() => {
    const draftMsg = `Please draft a cover letter for the ${jobTitle} position${jobCompany ? ` at ${jobCompany}` : ''}.`;
    const askMsg = `I am interested in the ${jobTitle} position${jobCompany ? ` at ${jobCompany}` : ''}. Given my resume, how well do I fit this role and what are my skill gaps?`;

    if (action === 'cover_letter' && jobTitle && !actionHandled.current) {
      actionHandled.current = true;
      const lastUserMsg = useAssistantStore.getState().messages.filter(m => m.role === 'user').pop();
      if (lastUserMsg?.content !== draftMsg) {
        sendMessage(draftMsg, jobTitle, jobCompany);
      }
      router.replace(`/assistant?job=${encodeURIComponent(jobTitle)}&company=${encodeURIComponent(jobCompany)}`);
    } else if (action === 'ask' && jobTitle && !actionHandled.current) {
      actionHandled.current = true;
      const lastUserMsg = useAssistantStore.getState().messages.filter(m => m.role === 'user').pop();
      if (lastUserMsg?.content !== askMsg) {
        sendMessage(askMsg, jobTitle, jobCompany);
      }
      router.replace(`/assistant?job=${encodeURIComponent(jobTitle)}&company=${encodeURIComponent(jobCompany)}`);
    }
  }, [action, jobTitle, jobCompany, sendMessage, router]);


  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="flex h-full"
    >
      
      <div className="flex-1 min-w-0">
        <ChatWindow jobTitle={jobTitle} jobCompany={jobCompany} />
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
