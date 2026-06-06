import { create } from 'zustand';
import { Message } from '../types';
import { sendChatMessage } from '../utils/api';
import { useAppStore } from './useAppStore';

interface AssistantState {
  messages: Message[];
  isTyping: boolean;
  addMessage: (msg: Message) => void;
  updateMessage: (id: string, content: string) => void;
  setIsTyping: (v: boolean) => void;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
}

export const useAssistantStore = create<AssistantState>((set, get) => ({
  messages: [
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hello! I'm your CareerPilot AI. Ask me for resume feedback, interview prep, or job matching.",
      timestamp: new Date().toISOString()
    }
  ],
  isTyping: false,
  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
  updateMessage: (id, content) => set((state) => ({
    messages: state.messages.map(m => m.id === id ? { ...m, content } : m)
  })),
  setIsTyping: (v) => set({ isTyping: v }),
  sendMessage: async (content: string) => {
    const { messages, addMessage, updateMessage, setIsTyping } = get();
    
    // Add user message
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date().toISOString()
    };
    addMessage(userMsg);
    
    setIsTyping(true);
    
    try {
      const fullContent = await sendChatMessage([...messages, userMsg], content);
      
      const assistantMsgId = (Date.now() + 1).toString();
      addMessage({
        id: assistantMsgId,
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
        isStreaming: true
      });

      // Simulate streaming locally for UX
      const words = fullContent.split(' ');
      let currentText = '';
      
      for (const word of words) {
        currentText += word + ' ';
        updateMessage(assistantMsgId, currentText);
        // Small delay to simulate typing
        await new Promise(resolve => setTimeout(resolve, 20));
      }
      
      // Finalize message
      set((state) => ({
        messages: state.messages.map(m => m.id === assistantMsgId ? { ...m, isStreaming: false } : m)
      }));
      
    } catch (error) {
      console.error("Failed to send message", error);
      useAppStore.getState().addToast({ message: 'Failed to connect to AI assistant.', type: 'error' });
      setIsTyping(false);
    } finally {
      setIsTyping(false);
    }
  },
  clearMessages: () => set({ messages: [] })
}));
