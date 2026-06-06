import React from 'react';
import { Toast as ToastType } from '@/lib/store/useAppStore';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface ToastProps {
  toast: ToastType;
}

export function Toast({ toast }: ToastProps) {
  return (
    <div className={cn(
      "bg-[var(--bg-panel)] border border-[var(--border)] rounded-md px-4 py-2.5 text-sm shadow-md flex items-center gap-3",
      toast.type === 'error' && "border-l-2 border-l-[var(--status-rejected)]",
      toast.type === 'success' && "border-l-2 border-l-[var(--status-offer)]",
      toast.type === 'info' && "border-l-2 border-l-[var(--hud-blue)]"
    )}>
      {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-[var(--status-rejected)]" />}
      {toast.type === 'success' && <CheckCircle className="w-4 h-4 text-[var(--status-offer)]" />}
      {toast.type === 'info' && <Info className="w-4 h-4 text-[var(--hud-blue)]" />}
      <span className="text-primary font-medium">{toast.message}</span>
    </div>
  );
}
