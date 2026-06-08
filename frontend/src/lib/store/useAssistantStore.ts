import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Message } from '../types';
import { sendChatMessage } from '../utils/api';
import { useAppStore } from './useAppStore';

interface AssistantState {
  messages: Message[];
  isTyping: boolean;
  sessionId: string;
  addMessage: (msg: Message) => void;
  updateMessage: (id: string, content: string) => void;
  setIsTyping: (v: boolean) => void;
  sendMessage: (content: string, jobTitle?: string, jobCompany?: string) => Promise<void>;
  clearMessages: () => void;
  clearSession: () => Promise<void>;
  reset: () => void;
}

export const useAssistantStore = create<AssistantState>()(
  persist(
    (set, get) => ({
      messages: [
        {
          id: 'welcome',
          role: 'assistant',
          content: "Ready to take the next step in your career? Ask me for resume feedback, interview practice, application advice, or job search guidance.",
          timestamp: new Date().toISOString()
        }
      ],
      isTyping: false,
      sessionId: Date.now().toString(),
      addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
      updateMessage: (id, content) => set((state) => ({
        messages: state.messages.map(m => m.id === id ? { ...m, content } : m)
      })),
      setIsTyping: (v) => set({ isTyping: v }),
      sendMessage: async (content: string, jobTitle?: string, jobCompany?: string) => {
        const { messages, addMessage, updateMessage, setIsTyping, sessionId } = get();
        
        const userMsg: Message = {
          id: Date.now().toString(),
          role: 'user',
          content,
          timestamp: new Date().toISOString()
        };
        addMessage(userMsg);
        
        setIsTyping(true);
        
        try {
          const fullContent = await sendChatMessage([...messages, userMsg], content, sessionId, jobTitle, jobCompany);
          
          const assistantMsgId = (Date.now() + 1).toString();
          addMessage({
            id: assistantMsgId,
            role: 'assistant',
            content: '',
            timestamp: new Date().toISOString(),
            isStreaming: true
          });

          const words = fullContent.split(' ');
          let currentText = '';
          
          for (const word of words) {
            currentText += word + ' ';
            updateMessage(assistantMsgId, currentText);
            await new Promise(resolve => setTimeout(resolve, 20));
          }
          
          set((state) => ({
            messages: state.messages.map(m => m.id === assistantMsgId ? { ...m, isStreaming: false } : m)
          }));
          
        } catch (error) {
          console.warn("Failed to send message (backend might be offline).");
          useAppStore.getState().addToast({ message: 'Failed to connect to AI assistant.', type: 'error' });
          setIsTyping(false);
        } finally {
          setIsTyping(false);
        }
      },
      clearMessages: () => set({ messages: [] }),
      clearSession: async () => {
        try {
          const { clearChatSession } = await import('../utils/api');
          await clearChatSession(get().sessionId);
          set({
            sessionId: Date.now().toString(),
            messages: [
              {
                id: 'welcome',
                role: 'assistant',
                content: "Hello! I've cleared my memory. How can I help you?",
                timestamp: new Date().toISOString()
              }
            ]
          });
        } catch (error) {
          console.warn("Failed to clear session.");
        }
      },
      reset: () => set({
        messages: [
          {
            id: 'welcome',
            role: 'assistant',
            content: "Ready to take the next step in your career? Ask me for resume feedback, interview practice, application advice, or job search guidance.",
            timestamp: new Date().toISOString()
          }
        ],
        sessionId: Date.now().toString(),
        isTyping: false
      })
    }),
    {
      name: 'careerpilot-assistant-storage',
      partialize: (state) => ({ messages: state.messages, sessionId: state.sessionId })
    }
  )
);
