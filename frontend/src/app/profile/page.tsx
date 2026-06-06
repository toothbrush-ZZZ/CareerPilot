'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CVUploader } from '@/components/profile/CVUploader';
import { SkillsGrid } from '@/components/profile/SkillsGrid';
import { CVSections } from '@/components/profile/CVSections';
import { useAppStore } from '@/lib/store/useAppStore';

export default function ProfilePage() {
  const { cvUploaded } = useAppStore();
  
  // We'd usually get these from a store/backend, holding local state for demo
  const [sections, setSections] = useState<any[]>([]);
  const [skills, setSkills] = useState<string[]>([]);

  const handleUploadComplete = (newSections: any[], newSkills: string[]) => {
    setSections(newSections);
    setSkills(newSkills);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="p-6 max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 h-full overflow-y-auto"
    >
      {/* Left Column: Upload & Meta */}
      <div className="w-full lg:w-[40%] flex flex-col gap-6 flex-shrink-0">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-primary mb-4">CV Upload</h2>
          <CVUploader onUploadComplete={handleUploadComplete} />
        </div>

        {cvUploaded && skills.length > 0 && (
          <div className="pt-4 border-t border-panel-border">
            <SkillsGrid skills={skills} />
          </div>
        )}
      </div>

      {/* Right Column: Parsed Content */}
      <div className="w-full lg:w-[60%] flex flex-col gap-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">Parsed Content</h2>
        <CVSections sections={sections} />
      </div>
    </motion.div>
  );
}
