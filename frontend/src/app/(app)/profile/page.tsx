'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ProfileForm } from '@/components/profile/ProfileForm';

export default function ProfilePage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="p-6 max-w-3xl mx-auto flex flex-col gap-8 h-full overflow-y-auto custom-scrollbar"
    >
      <h1 className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--cp-text-primary)' }}>
        Account Settings
      </h1>
      <ProfileForm />
    </motion.div>
  );
}
