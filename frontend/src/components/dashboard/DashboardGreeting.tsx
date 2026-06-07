import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  firstName: string;
  streak: number;
}

export function DashboardGreeting({ firstName }: Props) {
  const name = firstName && firstName.toLowerCase() !== 'there' ? firstName : '';
  
  return (
    <div className="flex items-center justify-between">
      <h1 className="greeting__text">
        Welcome{name ? `, ${name}` : ''} <span className="inline-block origin-bottom-right hover:animate-wave">👋</span>
      </h1>
    </div>
  );
}
