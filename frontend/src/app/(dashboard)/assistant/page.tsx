'use client';

import React, { useState, useEffect, useRef } from 'react';
import { assistantService } from '@/services/assistant';
import { cvService } from '@/services/cv';
import { ChatMessage } from '@/types';
import {
  MessageSquareCode,
  Send,
  Trash2,
  Cpu,
  User,
  Sparkles,
  FileWarning,
  Briefcase,
  X,
} from 'lucide-react';

const QUICK_PROMPTS = [
  'What technical skills are highlighted on my CV?',
  'Review my resume experience and list potential improvements.',
  'Analyze my career goals and suggest a step-by-step roadmap.',
  'Formulate 3 interview questions based on my experience.'
];

export default function AssistantChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [hasCV, setHasCV] = useState<boolean>(false);
  const [cvStatusLoading, setCvStatusLoading] = useState<boolean>(true);
  const [isPending, setIsPending] = useState<boolean>(false);
  const [isClearing, setIsClearing] = useState<boolean>(false);
  const [jobContext, setJobContext] = useState<{
    job_title?: string;
    job_description?: string;
  } | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load unique session ID and message history
  useEffect(() => {
    let savedSession = localStorage.getItem('cp_chat_session');
    if (!savedSession) {
      savedSession = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('cp_chat_session', savedSession);
    }
    setSessionId(savedSession);

    const savedHistory = localStorage.getItem(`cp_chat_history:${savedSession}`);
    if (savedHistory) {
      try {
        setMessages(JSON.parse(savedHistory));
      } catch {
        // Ignore parsing errors
      }
    }

    // Check CV Status
    cvService.getCVStatus()
      .then((status) => {
        setHasCV(status?.has_cv || false);
      })
      .catch((err) => {
        console.error('Error fetching CV status', err);
      })
      .finally(() => {
        setCvStatusLoading(false);
      });

    // Check for pending cover letter message from job cards
    const pending = sessionStorage.getItem("pending_assistant_message");
    if (pending) {
      try {
        const { message, job_title, job_description } = JSON.parse(pending);
        setInput(message);
        setJobContext({ job_title, job_description });
        sessionStorage.removeItem("pending_assistant_message");
      } catch (e) {
        console.error('Error parsing pending message', e);
      }
    }
  }, []);

  // Save history on updates
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

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isPending || !sessionId) return;

    const userMessageContent = input;
    setInput('');
    setIsPending(true);

    // Optimistically update UI
    const updatedMessages = [...messages, { role: 'user' as const, content: userMessageContent }];
    setMessages(updatedMessages);

    try {
      const response = await assistantService.chat(
        userMessageContent,
        sessionId,
        jobContext?.job_title,
        jobContext?.job_description
      );

      // Maintain job context to ensure follow-up questions remain grounded in the JD

      const finalMessages = [...updatedMessages, { role: 'assistant' as const, content: response.reply }];
      updateMessageHistory(finalMessages);
    } catch (err) {
      console.error('Error sending message', err);
      const finalMessages = [...updatedMessages, { role: 'assistant' as const, content: 'Something went wrong. Please try again.' }];
      updateMessageHistory(finalMessages);
    } finally {
      setIsPending(false);
    }
  };

  const handleQuickPromptClick = async (prompt: string) => {
    if (isPending || !sessionId) return;
    setInput('');
    setIsPending(true);

    const updatedMessages = [...messages, { role: 'user' as const, content: prompt }];
    setMessages(updatedMessages);

    try {
      const response = await assistantService.chat(prompt, sessionId);
      const finalMessages = [...updatedMessages, { role: 'assistant' as const, content: response.reply }];
      updateMessageHistory(finalMessages);
    } catch (err) {
      console.error('Error sending quick prompt', err);
      const finalMessages = [...updatedMessages, { role: 'assistant' as const, content: 'Something went wrong. Please try again.' }];
      updateMessageHistory(finalMessages);
    } finally {
      setIsPending(false);
    }
  };

  const handleClearSession = async () => {
    if (!confirm('Are you sure you want to clear this chat history?')) return;
    setIsClearing(true);
    try {
      await assistantService.clearSession(sessionId);
      setMessages([]);
      if (sessionId) {
        localStorage.removeItem(`cp_chat_history:${sessionId}`);
      }
    } catch (err) {
      console.error('Error clearing session', err);
    } finally {
      setIsClearing(false);
    }
  };

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
            CareerPilot Assistant
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5 font-medium">
            Draft cover letters, verify your readiness, and create learning roadmaps.
          </p>
        </div>

        {messages.length > 0 && (
          <button
            onClick={handleClearSession}
            disabled={isClearing}
            className="flex items-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-50 border border-rose-500/10 dark:hover:bg-rose-500/10 transition-all cursor-pointer"
          >
            <Trash2 className="h-4 w-4" /> Clear Chat
          </button>
        )}
      </div>

      <div className="flex-1 flex flex-col min-h-0 space-y-4">
        {/* Renders warning if no CV exists */}
        {!hasCV && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-semibold flex items-center gap-3 shrink-0">
            <FileWarning className="h-5 w-5 shrink-0" />
            <div className="flex-1">
              <p className="font-bold">Resume required</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                Please upload your resume in the{' '}
                <a href="/cv" className="text-sky-500 dark:text-sky-400 hover:underline">CV Manager</a> to use the assistant.
              </p>
            </div>
          </div>
        )}

        {/* Main chat window container */}
        <div className="flex-1 bg-white border border-slate-200/80 rounded-3xl dark:bg-[#0d1527] dark:border-slate-800/80 shadow-sm overflow-hidden flex flex-col relative min-h-0">
          
          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {messages.map((msg, index) => {
              const isUser = msg.role === 'user';
              
              return (
                <div
                  key={index}
                  className={`flex gap-4 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
                >
                  {/* Avatar */}
                  <div className={`h-9 w-9 shrink-0 rounded-xl flex items-center justify-center text-white ${
                    isUser ? 'bg-gradient-to-tr from-sky-450 to-sky-600' : 'bg-gradient-to-tr from-indigo-500 to-purple-600 shadow-md shadow-indigo-500/20'
                  }`}>
                    {isUser ? <User className="h-4 w-4" /> : <Cpu className="h-4 w-4" />}
                  </div>

                  {/* Bubble content */}
                  <div className={`p-4 rounded-2xl text-xs font-semibold leading-relaxed ${
                    isUser
                      ? 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-100 rounded-tr-none'
                      : 'bg-indigo-50/50 border border-indigo-100/50 text-slate-750 dark:bg-indigo-950/10 dark:border-indigo-950 dark:text-slate-300 rounded-tl-none'
                  }`}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              );
            })}

            {/* Loading loader bubble */}
            {isPending && (
              <div className="flex gap-4 max-w-[85%]">
                <div className="h-9 w-9 shrink-0 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white">
                  <Cpu className="h-4 w-4 animate-spin" />
                </div>
                <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100/50 text-slate-500 dark:bg-indigo-950/10 dark:border-indigo-950 dark:text-slate-450 rounded-tl-none inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:-0.3s]" />
                  <span className="h-2 w-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:-0.15s]" />
                  <span className="h-2 w-2 rounded-full bg-indigo-400 animate-bounce" />
                </div>
              </div>
            )}

            {/* Scroll anchor */}
            <div ref={messagesEndRef} />

            {/* Empty Chat State Suggestions */}
            {messages.length === 0 && !isPending && (
              <div className="h-full flex flex-col items-center justify-center py-8 text-center max-w-xl mx-auto space-y-8">
                
                <div>
                  <div className="h-12 w-12 flex items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500 mx-auto mb-3">
                    <MessageSquareCode className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-base text-slate-800 dark:text-slate-100">
                    AI Mentorship Chat
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm">
                    Ask a question or select a suggestion below to get started.
                  </p>
                </div>

                {hasCV && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full text-left font-bold">
                    {QUICK_PROMPTS.map((prompt, i) => (
                      <button
                        key={i}
                        onClick={() => handleQuickPromptClick(prompt)}
                        className="p-3.5 rounded-xl border border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900/60 text-[11px] text-slate-600 dark:text-slate-400 leading-normal flex items-start gap-2.5 group transition-all cursor-pointer"
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
          <div className="p-4 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/40 shrink-0 space-y-3">

            {/* Job context banner — visible when a job is being discussed */}
            {jobContext?.job_title && (
              <div className="flex items-center gap-2 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50 dark:bg-indigo-950/40 px-3 py-2 text-xs">
                <Briefcase className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                <span className="text-indigo-600 dark:text-indigo-400 font-semibold">Discussing:</span>
                <span className="font-bold text-indigo-800 dark:text-indigo-200 truncate flex-1">{jobContext.job_title}</span>
                <button
                  onClick={() => setJobContext(null)}
                  className="ml-auto text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-200 transition-colors cursor-pointer shrink-0"
                  title="Clear job context"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            <form onSubmit={handleSend} className="flex gap-3">
              <input
                type="text"
                disabled={isPending || !hasCV}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={hasCV ? "Message CareerPilot..." : "Please upload a resume first"}
                className="flex-1 bg-white border border-slate-200 dark:bg-[#0b0f19] dark:border-slate-800 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors text-slate-800 dark:text-slate-100 font-semibold placeholder-slate-400 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isPending || !input.trim() || !hasCV}
                className="px-4 bg-gradient-to-tr from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white rounded-2xl shadow-sm disabled:opacity-50 flex items-center justify-center transition-all active:scale-95 cursor-pointer"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>

        </div>
      </div>

    </div>
  );
}
