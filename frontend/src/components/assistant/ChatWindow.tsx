'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Send, Trash2 } from 'lucide-react';
import { useAssistantStore } from '@/lib/store/useAssistantStore';
import { useAppStore } from '@/lib/store/useAppStore';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { QuickPrompts } from './QuickPrompts';

interface ChatWindowProps {
  jobTitle?: string;
  jobCompany?: string;
}

export function ChatWindow({ jobTitle, jobCompany }: ChatWindowProps) {
  const { messages, isTyping, sendMessage, clearSession } = useAssistantStore();
  const { cvUploaded } = useAppStore();
  const [input, setInput] = useState('');
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = (text?: string) => {
    const finalInput = typeof text === 'string' ? text : input;
    if (!finalInput.trim() || isTyping) return;
    sendMessage(finalInput, jobTitle, jobCompany);
    if (typeof text !== 'string') setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey || !e.shiftKey)) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full relative" style={{ background: 'var(--cp-bg)' }}>
      <button 
        onClick={() => clearSession()}
        className="absolute top-4 right-4 z-10 p-2 rounded-md hover:bg-red-500/10 text-red-500 opacity-40 hover:opacity-100 transition-all"
        title="Delete Chat Session"
      >
        <Trash2 size={16} />
      </button>
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 pt-12">
        {messages.map(msg => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {isTyping && !messages.find(m => m.isStreaming) && <TypingIndicator />}
        <div ref={endOfMessagesRef} />
      </div>
      
      <div className="p-6 pt-0 shrink-0">
        <div className="relative w-full flex flex-col gap-3">
          <QuickPrompts onSelect={(prompt) => handleSend(prompt)} />
          
          <div 
            className="flex flex-col rounded-xl overflow-hidden transition-all focus-within:ring-1"
            style={{
              background: 'var(--cp-card)',
              border: '1px solid var(--cp-border)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              borderColor: 'var(--cp-border)'
            }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything… (Ctrl+Enter to send)"
              className="w-full pl-4 pr-4 pt-3 text-sm outline-none resize-none h-[48px] bg-transparent custom-scrollbar"
              style={{ color: 'var(--cp-text-primary)' }}
              disabled={isTyping}
            />
            <div className="flex items-center justify-between px-3 pb-2 pt-1">
              <p className="text-[10px] pl-1" style={{ color: 'var(--cp-text-muted)' }}>
                {cvUploaded ? '● CV context active' : '○ No CV — generic profile'}
              </p>
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isTyping}
                className="w-8 h-8 rounded-md flex items-center justify-center transition-colors disabled:opacity-50"
                style={{
                  background: input.trim() && !isTyping ? 'var(--cp-accent)' : 'var(--cp-surface)',
                  color: input.trim() && !isTyping ? 'var(--cp-bg)' : 'var(--cp-text-muted)'
                }}
              >
                <Send size={16} strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
