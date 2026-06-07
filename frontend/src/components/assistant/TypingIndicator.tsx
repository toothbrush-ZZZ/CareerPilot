import React from 'react';
import { Bot } from 'lucide-react';
import { motion } from 'framer-motion';

export function TypingIndicator() {
  const dotVariants = {
    initial: { scale: 0.6 },
    animate: { scale: [0.6, 1, 0.6] }
  };

  const transition = {
    duration: 0.8,
    repeat: Infinity,
    ease: "easeInOut" as const
  };

  return (
    <div className="flex w-full justify-start">
      <div className="flex flex-row max-w-[85%] sm:max-w-[75%]">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-panel border border-panel-border text-hud-blue flex items-center justify-center mt-1 mx-3">
          <Bot size={16} />
        </div>
        
        <div className="flex flex-col items-start">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-medium tracking-[-0.01em] text-hud-blue border border-hud-blue/30 px-1.5 py-0.5 rounded bg-hud-blue/10">
              Thinking
            </span>
          </div>
          
          <div className="p-4 bg-panel border border-panel-border rounded-r-xl rounded-bl-xl flex items-center gap-1.5">
            <motion.span 
              className="w-1.5 h-1.5 rounded-full bg-hud-blue"
              variants={dotVariants}
              initial="initial"
              animate="animate"
              transition={{ ...transition, delay: 0 }}
            />
            <motion.span 
              className="w-1.5 h-1.5 rounded-full bg-hud-blue"
              variants={dotVariants}
              initial="initial"
              animate="animate"
              transition={{ ...transition, delay: 0.2 }}
            />
            <motion.span 
              className="w-1.5 h-1.5 rounded-full bg-hud-blue"
              variants={dotVariants}
              initial="initial"
              animate="animate"
              transition={{ ...transition, delay: 0.4 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
