'use client';

import React, { useState, useEffect, useRef } from 'react';
import { careerApi } from '@/lib/api';
import { 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Trash2, 
  Sparkles,
  Command,
  BookOpen,
  Map,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const SUGGESTIONS = [
  { text: "Am I ready for a Senior Dev role?", icon: CheckCircle2, color: "text-green-400" },
  { text: "Find my skill gaps for DevOps", icon: BookOpen, color: "text-blue-400" },
  { text: "Build me a 3-month AI roadmap", icon: Map, color: "text-purple-400" },
];

export default function AssistantPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => Math.random().toString(36).substring(7));
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async (text: string) => {
    const messageText = text || input;
    if (!messageText.trim() || loading) return;

    const userMessage = { role: 'user', content: messageText };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await careerApi.chat(messageText, sessionId);
      setMessages(res.data.history);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm having trouble connecting right now. Please try again in a moment." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 px-2">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-600/10 text-blue-400 border border-blue-500/20">
            <Bot size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">AI Career Assistant</h1>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-xs text-white/40 uppercase tracking-widest font-bold">Insights personalized to your experience</span>
            </div>
          </div>
        </div>
        <button 
          onClick={() => setMessages([])}
          className="p-2 rounded-lg hover:bg-white/5 text-white/30 hover:text-red-400 transition-all"
          title="Clear Conversation"
        >
          <Trash2 size={20} />
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 glass rounded-[2.5rem] p-4 flex flex-col min-h-0 relative overflow-hidden backdrop-blur-3xl shadow-2xl">
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto space-y-6 p-4 custom-scrollbar scroll-smooth"
        >
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <motion.div 
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 4 }}
                className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center mb-8 shadow-2xl shadow-blue-500/40"
              >
                <Sparkles size={40} className="text-white" />
              </motion.div>
              <h2 className="text-3xl font-bold mb-3 tracking-tight">How can I help you today?</h2>
              <p className="text-white/40 max-w-sm mb-10 leading-relaxed">
                I'm your career co-pilot. I can analyze your readiness, find skill gaps, or build personalized learning roadmaps based on your experience.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl px-4">
                {SUGGESTIONS.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(s.text)}
                    className="flex flex-col items-start gap-3 p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-blue-500/30 hover:bg-white/[0.07] transition-all text-left group"
                  >
                    <s.icon size={20} className={cn(s.color, "opacity-70 group-hover:opacity-100 transition-opacity")} />
                    <span className="text-sm font-medium text-white/70 group-hover:text-white transition-colors">{s.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <AnimatePresence>
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex gap-4",
                  m.role === 'user' ? "flex-row-reverse" : ""
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border",
                  m.role === 'user' 
                    ? "bg-white/5 border-white/10" 
                    : "bg-blue-600/10 border-blue-500/20 text-blue-400"
                )}>
                  {m.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                </div>
                <div className={cn(
                  "max-w-[80%] rounded-3xl px-6 py-4 text-sm leading-relaxed",
                  m.role === 'user'
                    ? "bg-blue-600 text-white rounded-tr-none"
                    : "bg-white/5 text-white/90 border border-white/5 rounded-tl-none prose prose-invert"
                )}>
                  <div className="whitespace-pre-wrap">{m.content}</div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                <Loader2 className="animate-spin" size={18} />
              </div>
              <div className="bg-white/5 border border-white/5 rounded-3xl rounded-tl-none px-6 py-4 flex gap-1">
                <span className="w-1.5 h-1.5 bg-white/30 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-white/30 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 bg-white/30 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-[#111113]/50 border-t border-white/5 backdrop-blur-xl">
          <form 
            onSubmit={(e: React.FormEvent) => { e.preventDefault(); handleSend(input); }}
            className="flex gap-3 max-w-4xl mx-auto items-center"
          >
            <div className="flex-1 relative group">
              <Command className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-blue-400 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Ask your career co-pilot anything..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                value={input}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
              />
            </div>
            <button 
              type="submit"
              disabled={!input.trim() || loading}
              className="w-12 h-12 flex items-center justify-center rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:bg-white/10 transition-all text-white group"
            >
              <Send size={20} className={cn("transition-transform", input.trim() && "group-hover:translate-x-0.5 group-hover:-translate-y-0.5")} />
            </button>
          </form>
          <div className="mt-3 text-center">
            <p className="text-[10px] text-white/20 uppercase tracking-widest font-medium">Shift + Enter for multiline • Personalized Mode Active</p>
          </div>
        </div>
      </div>
    </div>
  );
}
