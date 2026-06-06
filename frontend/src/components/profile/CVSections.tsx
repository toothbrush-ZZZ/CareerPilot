'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, FileText } from 'lucide-react';
import { CVSection } from '@/lib/types';

interface CVSectionsProps {
  sections: CVSection[];
}

export function CVSections({ sections }: CVSectionsProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(
    sections.reduce((acc, sec) => ({ ...acc, [sec.title]: true }), {})
  );

  const toggleSection = (title: string) => {
    setOpenSections(prev => ({ ...prev, [title]: !prev[title] }));
  };

  if (!sections || sections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted border border-dashed border-panel-border rounded-lg">
        <FileText size={32} className="mb-2 opacity-50" />
        <p className="text-sm">No CV data extracted yet.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {sections.map(section => {
        const isOpen = openSections[section.title];
        
        return (
          <div key={section.title} className="border border-panel-border rounded-lg overflow-hidden bg-panel">
            <button
              onClick={() => toggleSection(section.title)}
              className="w-full flex items-center justify-between p-4 bg-panel hover:bg-panel-hover transition-colors"
            >
              <h3 className="text-sm font-semibold text-primary uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-hud-blue" />
                {section.title}
              </h3>
              <div className="text-muted">
                {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </div>
            </button>
            
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden border-t border-panel-border bg-inset"
                >
                  <div className="p-4">
                    <p className="text-sm text-secondary whitespace-pre-wrap font-mono leading-relaxed">
                      {section.content}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
