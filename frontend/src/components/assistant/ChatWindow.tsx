'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';
import { useAssistantStore } from '@/lib/store/useAssistantStore';
import { useAppStore } from '@/lib/store/useAppStore';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';

export function ChatWindow() {
  const { messages, isTyping, sendMessage } = useAssistantStore();
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

  const handleSend = () => {
    if (!input.trim() || isTyping) return;
    sendMessage(input);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey || !e.shiftKey)) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--bg-base)' }}>
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
        {messages.map(msg => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {isTyping && !messages.find(m => m.isStreaming) && <TypingIndicator />}
        <div ref={endOfMessagesRef} />
      </div>
      
      <div className="p-6 pt-0 shrink-0">
        <div className="relative max-w-4xl mx-auto">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything… (Ctrl+Enter to send)"
            className="w-full rounded-xl pl-4 pr-12 py-3.5 text-sm outline-none resize-none h-[80px] transition-all"
            style={{
              background: 'var(--bg-panel)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = 'var(--hud-blue)'; }}
            onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
            disabled={isTyping}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="absolute right-4 bottom-7 w-8 h-8 rounded-md bg-hud-blue text-white flex items-center justify-center hover:bg-hud-blue-dim transition-colors disabled:opacity-50"
          >
            <Send size={16} />
          </button>
          <p className="text-[10px] text-muted text-right mt-1">
            {cvUploaded ? '● CV context active' : '○ No CV — responses use generic profile'}
          </p>
        </div>
      </div>
    </div>
  );
}
