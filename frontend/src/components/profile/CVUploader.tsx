'use client';

import React, { useCallback, useState } from 'react';
import { UploadCloud, FileText, CheckCircle2 } from 'lucide-react';
import { useAppStore } from '@/lib/store/useAppStore';
import { PulseLoader } from '../ui/PulseLoader';
import { uploadCV } from '@/lib/utils/api';
import { cn } from '@/lib/utils/cn';

interface CVUploaderProps {
  onUploadComplete: (sections: any[], skills: string[]) => void;
}

export function CVUploader({ onUploadComplete }: CVUploaderProps) {
  const { user, setUser, setCvUploaded, cvUploaded, addToast } = useAppStore();
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [fileMeta, setFileMeta] = useState<{ size: string; type: string } | null>(null);

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setPendingFile(null);
    
    try {
      const result = await uploadCV(file);
      setCvUploaded(true);
      const ext = file.name.split('.').pop() || 'pdf';
      setFileMeta({
        size: (file.size / 1024).toFixed(0) + ' KB',
        type: ext
      });
      if (user) {
        setUser({
          ...user,
          cvFileName: file.name,
          cvUploadedAt: new Date().toISOString()
        });
      }
      addToast({ message: 'CV uploaded successfully.', type: 'success' });
      onUploadComplete(result.sections, result.skills);
    } catch {
      addToast({ message: 'Failed to upload CV. Please try again.', type: 'error' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (cvUploaded) {
        setPendingFile(file);
      } else {
        await handleFileUpload(file);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (cvUploaded) {
        setPendingFile(file);
      } else {
        handleFileUpload(file);
      }
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div 
        className={cn(
          "border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center transition-all duration-200 min-h-[200px]",
          isDragging ? "border-hud-blue bg-hud-blue/5" : "border-panel-border bg-panel hover:border-hud-blue/50",
          (isUploading || cvUploaded) && "border-solid border-panel-border"
        )}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        {isUploading ? (
          <div className="flex flex-col items-center gap-4">
            <PulseLoader size={60} />
            <div className="text-sm font-mono text-hud-blue animate-pulse">Extracting skills...</div>
          </div>
        ) : cvUploaded ? (
          <div className="flex flex-col items-center gap-3 w-full">
            <div className="w-12 h-12 rounded-full bg-offer/10 text-offer flex items-center justify-center">
              <CheckCircle2 size={24} />
            </div>
            <div className="text-sm font-semibold text-primary">CV Indexed Successfully</div>
            
            <div className="w-full mt-4 p-4 bg-inset border border-panel-border rounded-md flex items-center gap-3">
              <FileText size={20} className="text-hud-blue shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium text-primary truncate">{user?.cvFileName || 'resume.pdf'}</span>
                <span className="text-[10px] text-muted">
                  Uploaded {user?.cvUploadedAt ? new Date(user.cvUploadedAt).toLocaleDateString() : 'Just now'}
                </span>
                {fileMeta && (
                  <p className="text-[11px] text-muted font-mono mt-0.5">
                    {fileMeta.size} · {fileMeta.type.toUpperCase()} · Uploaded {user?.cvUploadedAt ? new Date(user.cvUploadedAt).toLocaleDateString() : 'Just now'}
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="w-12 h-12 rounded-full bg-inset text-secondary flex items-center justify-center">
              <UploadCloud size={24} />
            </div>
            <div>
              <p className="text-sm font-semibold text-primary">Drag and drop your CV here</p>
              <p className="text-[10px] uppercase tracking-widest text-muted mt-1">Supports PDF, DOCX</p>
            </div>
            <label className="mt-2 cursor-pointer bg-panel border border-hud-blue text-hud-blue hover:bg-hud-blue/10 px-4 py-2 rounded-md text-sm font-semibold transition-colors">
              Browse Files
              <input 
                type="file" 
                className="hidden" 
                accept=".pdf,.docx" 
                onChange={handleInputChange}
              />
            </label>
          </div>
        )}
      </div>
      
      {pendingFile && (
        <div className="bg-panel border border-amber-500/30 rounded-md p-4 text-xs text-center space-y-2">
          <p className="text-amber-400 font-mono font-bold">Replace existing CV?</p>
          <p className="text-muted">This will re-index your profile. All previous job matches remain.</p>
          <div className="flex gap-3 justify-center mt-2">
            <button onClick={() => handleFileUpload(pendingFile)} className="text-xs font-semibold text-[var(--hud-blue)] hover:underline">Replace</button>
            <button onClick={() => setPendingFile(null)} className="text-xs text-muted hover:text-primary">Keep current</button>
          </div>
        </div>
      )}
    </div>
  );
}
