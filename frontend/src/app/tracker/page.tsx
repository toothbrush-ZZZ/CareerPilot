'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { KanbanBoard } from '@/components/tracker/KanbanBoard';
import { GoalPanel } from '@/components/tracker/GoalPanel';
import { CalendarToDo } from '@/components/tracker/CalendarToDo';
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
      className="flex flex-col h-full p-6 space-y-8"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 shrink-0 h-64">
        <div className="lg:col-span-2 h-full overflow-hidden">
          <GoalPanel />
        </div>
        <div className="h-full overflow-hidden">
          <CalendarToDo />
        </div>
      </div>

      <div className="flex-1 min-h-[400px]">
        <KanbanBoard />
      </div>
    </motion.div>
  );
}
