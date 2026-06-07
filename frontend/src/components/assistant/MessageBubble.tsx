import React from 'react';
import { Bot, User as UserIcon } from 'lucide-react';
import { Message } from '@/lib/types';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`flex max-w-[85%] sm:max-w-[75%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
      >
        
        <div
          className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-1 mx-2.5"
          style={{
            background: isUser ? 'var(--cp-accent-glow)' : 'var(--cp-surface)',
            border: `1px solid ${isUser ? 'var(--cp-accent)' : 'var(--cp-border)'}`,
            color: 'var(--cp-accent)',
          }}
        >
          {isUser ? <UserIcon size={16} strokeWidth={1.5} /> : <Bot size={16} strokeWidth={1.5} />}
        </div>

        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          
          {!isUser && (
            <div className="flex items-center gap-1.5 mb-1.5">
              <span
                className="text-[9px] tracking-widest font-bold px-1.5 py-0.5 rounded"
                style={{
                  color: 'var(--cp-accent)',
                  background: 'var(--cp-accent-glow)',
                  border: '1px solid var(--cp-border-accent)',
                }}
              >
                AI ASSISTANT
              </span>
            </div>
          )}

          
          <div
            className="px-3.5 py-2.5 text-sm leading-relaxed"
            style={
              isUser
                ? {
                    background: 'var(--cp-accent)',
                    color: 'var(--cp-bg)',
                    borderRadius: '16px 4px 16px 16px',
                  }
                : {
                    background: 'var(--cp-card)',
                    color: 'var(--cp-text-primary)',
                    border: '1px solid var(--cp-border)',
                    borderRadius: '4px 16px 16px 16px',
                  }
            }
          >
            {message.content}
            {message.isStreaming && (
              <span
                className="inline-block w-1 h-3 ml-1 animate-pulse rounded-sm"
                style={{ background: isUser ? 'var(--cp-bg)' : 'var(--cp-accent)' }}
              />
            )}
          </div>

          
          <div className="mt-1">
            <span className="text-[10px]" style={{ color: 'var(--cp-text-muted)' }}>
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
