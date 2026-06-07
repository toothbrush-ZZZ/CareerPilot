'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { KanbanBoard } from '@/components/tracker/KanbanBoard';
import { JobStatusChart } from '@/components/tracker/JobStatusChart';
import { useTrackerStore } from '@/lib/store/useTrackerStore';

export default function TrackerPage() {
  const { loadData } = useTrackerStore();

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="flex flex-col h-full p-6 gap-6 overflow-y-auto custom-scrollbar"
    >
      <div className="flex-1 min-h-[500px]">
        <KanbanBoard />
      </div>

      <div className="shrink-0 w-full mt-2">
        <JobStatusChart />
      </div>
    </motion.div>
  );
}
