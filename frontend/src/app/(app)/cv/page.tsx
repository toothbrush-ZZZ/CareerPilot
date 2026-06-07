'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CVUploader } from '@/components/profile/CVUploader';

export default function CVPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="p-6 max-w-3xl mx-auto flex flex-col gap-8 h-full overflow-y-auto"
    >
      <h1 className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--cp-text-primary)' }}>
        Resume Management
      </h1>

      <div className="w-full flex flex-col gap-6">
        <div>
          <h2 className="text-xs font-semibold tracking-widest mb-4" style={{ color: 'var(--cp-accent)' }}>Upload an existing resume or create one from scratch.</h2>
          <CVUploader onUploadComplete={() => {}} />
        </div>
      </div>
    </motion.div>
  );
}
