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
        {/* Avatar */}
        <div
          className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-1 mx-2.5"
          style={{
            background: isUser ? 'var(--hud-blue-glow)' : 'var(--bg-inset)',
            border: `1px solid ${isUser ? 'var(--hud-blue)' : 'var(--border)'}`,
            color: 'var(--hud-blue)',
          }}
        >
          {isUser ? <UserIcon size={13} /> : <Bot size={13} />}
        </div>

        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          {/* Badge (AI only) */}
          {!isUser && (
            <div className="flex items-center gap-1.5 mb-1.5">
              <span
                className="text-[9px] uppercase tracking-widest font-bold px-1.5 py-0.5 rounded"
                style={{
                  color: 'var(--hud-blue)',
                  background: 'var(--hud-blue-glow)',
                  border: '1px solid rgba(59,130,246,0.2)',
                }}
              >
                HUD
              </span>
            </div>
          )}

          {/* Bubble */}
          <div
            className="px-3.5 py-2.5 text-sm leading-relaxed"
            style={
              isUser
                ? {
                    background: 'var(--hud-blue)',
                    color: '#ffffff',
                    borderRadius: '16px 4px 16px 16px',
                  }
                : {
                    background: 'var(--bg-panel)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border)',
                    borderRadius: '4px 16px 16px 16px',
                  }
            }
          >
            {message.content}
            {message.isStreaming && (
              <span
                className="inline-block w-1 h-3 ml-1 animate-pulse rounded-sm"
                style={{ background: isUser ? 'rgba(255,255,255,0.7)' : 'var(--hud-blue)' }}
              />
            )}
          </div>

          {/* Timestamp */}
          <div className="mt-1">
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
