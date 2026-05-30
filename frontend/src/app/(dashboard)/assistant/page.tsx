'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { assistantService } from '@/services/assistant';
import { cvService } from '@/services/cv';
import { ChatMessage } from '@/types';
import {
  MessageSquareCode,
  Send,
  Trash2,
  Cpu,
  User,
  Compass,
  ArrowRight,
  Sparkles,
  HelpCircle,
  FileWarning,
  RefreshCw
} from 'lucide-react';

const QUICK_PROMPTS = [
  'What technical skills are highlighted on my CV?',
  'Review my resume experience and list potential improvements.',
  'Analyze my career goals and suggest a step-by-step roadmap.',
  'Formulate 3 interview questions based on my Senior AI Engineer experience.'
];

export default function AssistantChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check if CV is uploaded, because the assistant requires CV context
  const { data: cvStatus, isLoading: cvStatusLoading } = useQuery({
    queryKey: ['cv-status'],
    queryFn: cvService.getCVStatus,
  });

  // Setup/load unique session ID on client side mount
  useEffect(() => {
    let savedSession = localStorage.getItem('cp_chat_session');
    if (!savedSession) {
      savedSession = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('cp_chat_session', savedSession);
    }
    setSessionId(savedSession);

    // Load message history from localStorage if any, for smooth UX
    const savedHistory = localStorage.getItem(`cp_chat_history:${savedSession}`);
    if (savedHistory) {
      try {
        setMessages(JSON.parse(savedHistory));
      } catch {
        // ignore
      }
    }
  }, []);

  // Save history to localStorage on updates
  const updateMessageHistory = (newMsgs: ChatMessage[]) => {
    setMessages(newMsgs);
    if (sessionId) {
      localStorage.setItem(`cp_chat_history:${sessionId}`, JSON.stringify(newMsgs));
    }
  };

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mutations
  const chatMutation = useMutation({
    mutationFn: ({ msg, sessId }: { msg: string; sessId: string }) =>
      assistantService.chat(msg, sessId),
    onSuccess: (data) => {
      // Append assistant response to history
      const nextMsgs: ChatMessage[] = [
        ...messages,
        { role: 'user', content: input },
        { role: 'assistant', content: data.response }
      ];
      updateMessageHistory(nextMsgs);
      setInput('');
    },
  });

  const clearMutation = useMutation({
    mutationFn: () => assistantService.clearSession(sessionId),
    onSuccess: () => {
      setMessages([]);
      if (sessionId) {
        localStorage.removeItem(`cp_chat_history:${sessionId}`);
      }
    },
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input || chatMutation.isPending || !sessionId) return;
    
    // Optimistic user message render
    const optimMsgs = [...messages, { role: 'user' as const, content: input }];
    setMessages(optimMsgs);
    chatMutation.mutate({ msg: input, sessId: sessionId });
  };

  const handleQuickPromptClick = (prompt: string) => {
    if (chatMutation.isPending || !sessionId) return;
    setInput(prompt);
    const optimMsgs = [...messages, { role: 'user' as const, content: prompt }];
    setMessages(optimMsgs);
    chatMutation.mutate({ msg: prompt, sessId: sessionId });
  };

  const handleClearSession = () => {
    if (confirm('Wipe chat session logs from assistant history?')) {
      clearMutation.mutate();
    }
  };

  const hasCV = cvStatus?.has_cv;

  if (cvStatusLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        <div className="h-[500px] bg-slate-200 dark:bg-slate-800 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-8rem)]">
      
      {/* Action Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="font-display font-bold text-2xl md:text-3xl text-slate-800 dark:text-slate-100">
            Conversational AI Mentor
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5 font-medium">
            Engage with our career copilot for deep resume suggestions and advice.
          </p>
        </div>

        {messages.length > 0 && (
          <button
            onClick={handleClearSession}
            disabled={clearMutation.isPending}
            className="flex items-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-50 border border-rose-500/10 dark:hover:bg-rose-500/10 transition-all"
          >
            <Trash2 className="h-4 w-4" /> Clear Chat
          </button>
        )}
      </div>

      {/* Renders warning if no CV exists */}
      {!hasCV && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold flex items-center gap-3 shrink-0">
          <FileWarning className="h-5 w-5 text-amber-400 shrink-0" />
          <div className="flex-1">
            <p className="font-bold">Resume upload required</p>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              The AI Assistant utilizes details indexed from your resume context to reply. Please go to the{' '}
              <a href="/cv" className="text-sky-400 hover:underline">CV Manager</a> to upload one.
            </p>
          </div>
        </div>
      )}

      {/* Main chat window container */}
      <div className="flex-1 bg-white border border-slate-200/80 rounded-3xl dark:bg-[#0d1527] dark:border-slate-800/80 shadow-sm overflow-hidden flex flex-col relative">
        
        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            
            return (
              <div
                key={index}
                className={`flex gap-4 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : ''} animate-fade-in`}
              >
                {/* Avatar */}
                <div className={`h-9 w-9 shrink-0 rounded-xl flex items-center justify-center text-white ${
                  isUser ? 'bg-gradient-to-tr from-sky-400 to-sky-500' : 'bg-gradient-to-tr from-indigo-500 to-purple-600 shadow-md shadow-indigo-500/20'
                }`}>
                  {isUser ? <User className="h-4 w-4" /> : <Cpu className="h-4 w-4 animate-pulse" />}
                </div>

                {/* Bubble content */}
                <div className={`p-4 rounded-2xl text-xs font-semibold leading-relaxed ${
                  isUser
                    ? 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-100 rounded-tr-none'
                    : 'bg-indigo-50/50 border border-indigo-100/50 text-slate-700 dark:bg-indigo-950/10 dark:border-indigo-950 dark:text-slate-300 rounded-tl-none'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            );
          })}

          {/* Loading loader bubble */}
          {chatMutation.isPending && (
            <div className="flex gap-4 max-w-[85%] animate-fade-in">
              <div className="h-9 w-9 shrink-0 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white">
                <Cpu className="h-4 w-4 animate-spin" />
              </div>
              <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100/50 text-slate-500 dark:bg-indigo-950/10 dark:border-indigo-950 dark:text-slate-400 rounded-tl-none inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:-0.3s]" />
                <span className="h-2 w-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:-0.15s]" />
                <span className="h-2 w-2 rounded-full bg-indigo-400 animate-bounce" />
              </div>
            </div>
          )}

          {/* Scroll anchor */}
          <div ref={messagesEndRef} />

          {/* Empty Chat State Suggestions */}
          {messages.length === 0 && !chatMutation.isPending && (
            <div className="h-full flex flex-col items-center justify-center py-8 text-center max-w-xl mx-auto space-y-8">
              
              <div>
                <div className="h-12 w-12 flex items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500 mx-auto mb-3">
                  <MessageSquareCode className="h-6 w-6 animate-pulse" />
                </div>
                <h3 className="font-semibold text-base text-slate-800 dark:text-slate-100">
                  AI Mentorship Chat
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm">
                  Prompt the copilot directly or choose an optimized preview helper command.
                </p>
              </div>

              {hasCV && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full text-left font-bold">
                  {QUICK_PROMPTS.map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => handleQuickPromptClick(prompt)}
                      className="p-3.5 rounded-xl border border-slate-100 hover:bg-slate-50 dark:border-slate-850 dark:hover:bg-slate-900/60 text-[11px] text-slate-600 dark:text-slate-400 leading-normal flex items-start gap-2.5 group transition-all"
                    >
                      <Sparkles className="h-4 w-4 text-sky-400 shrink-0 mt-0.5 group-hover:scale-105" />
                      <span className="group-hover:text-slate-800 dark:group-hover:text-slate-200">{prompt}</span>
                    </button>
                  ))}
                </div>
              )}

            </div>
          )}

        </div>

        {/* Chat input form panel */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/40 shrink-0">
          <form onSubmit={handleSend} className="flex gap-3">
            <input
              type="text"
              disabled={chatMutation.isPending || !hasCV}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={hasCV ? "Send a prompt message..." : "Upload a CV first to write message..."}
              className="flex-1 bg-white border border-slate-200 dark:bg-[#0b0f19] dark:border-slate-800 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors text-slate-800 dark:text-slate-100 font-semibold placeholder-slate-400 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={chatMutation.isPending || !input || !hasCV}
              className="px-4 bg-gradient-to-tr from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white rounded-2xl shadow-sm disabled:opacity-50 flex items-center justify-center transition-all active:scale-95"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
