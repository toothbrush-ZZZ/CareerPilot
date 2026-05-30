'use client';

import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cvService } from '@/services/cv';
import {
  FileText,
  UploadCloud,
  CheckCircle,
  FileWarning,
  Trash2,
  ListRestart,
  Sparkles,
  Plus,
  X,
  FileCheck,
  RefreshCw
} from 'lucide-react';

export default function CVManager() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Local state controls
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [manualFormOpen, setManualFormOpen] = useState(false);

  // Manual CV Form states
  const [cvName, setCvName] = useState('');
  const [cvSummary, setCvSummary] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [uploadError, setUploadError] = useState('');

  // Query CV status
  const { data: cvStatus, isLoading, refetch } = useQuery({
    queryKey: ['cv-status'],
    queryFn: cvService.getCVStatus,
  });

  // Mutations
  const uploadMutation = useMutation({
    mutationFn: cvService.uploadCV,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cv-status'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setSelectedFile(null);
      setUploadError('');
    },
    onError: (err: any) => {
      setUploadError(err.message || 'File upload failed. Ensure PDF is under 5MB.');
    },
  });

  const buildMutation = useMutation({
    mutationFn: cvService.buildCV,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cv-status'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setManualFormOpen(false);
      setCvName('');
      setCvSummary('');
      setSkills([]);
      setUploadError('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: cvService.deleteCV,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cv-status'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setUploadError('');
    },
  });

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      validateAndSetFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file: File) => {
    setUploadError('');
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'pdf' && ext !== 'docx' && ext !== 'txt') {
      setUploadError('Only PDF, DOCX, or TXT formats are supported.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File exceeds the 5MB size limit.');
      return;
    }
    setSelectedFile(file);
  };

  const handleUploadSubmit = () => {
    if (selectedFile) {
      uploadMutation.mutate(selectedFile);
    }
  };

  const handleManualAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (skillInput && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cvName || !cvSummary || skills.length === 0) return;

    buildMutation.mutate({
      name: cvName,
      summary: cvSummary,
      skills,
    });
  };

  const handleDeleteCV = () => {
    if (confirm('Are you sure you want to delete your resume chunks? This will clear LLM search context.')) {
      deleteMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
      </div>
    );
  }

  const hasCV = cvStatus?.has_cv;

  return (
    <div className="space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl md:text-3xl text-slate-800 dark:text-slate-100">
            Resume & CV Manager
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5 font-medium">
            AI indexes your resume to calculate fit scores and respond contextually.
          </p>
        </div>
      </div>

      {/* Error alert */}
      {uploadError && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold flex items-center gap-2">
          <FileWarning className="h-4.5 w-4.5 text-rose-400 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Grid splits into Parser status cards vs file uploaders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* CV STATUS MONITOR PANEL */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-6 bg-white border border-slate-200/80 rounded-2xl dark:bg-[#0d1527] dark:border-slate-800/80">
            <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-100 uppercase tracking-wider mb-6 pb-2 border-b border-slate-100 dark:border-slate-800/40">
              Indexing Status
            </h3>

            {hasCV ? (
              <div className="space-y-6">
                
                {/* Active index card */}
                <div className="flex items-center gap-3.5 p-4 rounded-xl bg-emerald-50 border border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-800/40">
                  <CheckCircle className="h-8 w-8 text-emerald-500 shrink-0" />
                  <div>
                    <h4 className="font-bold text-sm text-emerald-800 dark:text-emerald-400">CV Loaded</h4>
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-500 font-semibold mt-0.5">
                      Successfully indexed in Vector DB
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <div className="flex justify-between">
                    <span>Parsed Segments:</span>
                    <span className="text-slate-800 dark:text-slate-200">{cvStatus.chunk_count} chunks</span>
                  </div>
                  <div className="flex justify-between">
                    <span>File Context:</span>
                    <span className="text-sky-600 dark:text-sky-400 flex items-center gap-1">
                      <FileCheck className="h-3.5 w-3.5" /> Active Resume
                    </span>
                  </div>
                </div>

                {cvStatus.sections && cvStatus.sections.length > 0 && (
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Parsed Sections</p>
                    <div className="flex flex-wrap gap-1.5">
                      {cvStatus.sections.map((sec, i) => (
                        <span
                          key={i}
                          className="py-1 px-2.5 rounded-lg bg-slate-100 text-[10px] text-slate-600 dark:bg-slate-800 dark:text-slate-300 font-semibold"
                        >
                          {sec}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={handleDeleteCV}
                  disabled={deleteMutation.isPending}
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-50 border border-rose-500/10 dark:hover:bg-rose-500/10 transition-all"
                >
                  <Trash2 className="h-4 w-4" /> Reset / Delete Resume
                </button>

              </div>
            ) : (
              <div className="text-center py-8">
                <FileWarning className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                <h4 className="font-bold text-sm text-slate-700 dark:text-slate-400">No Resume Found</h4>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 leading-relaxed px-4">
                  Please upload a PDF file or build a quick online resume to unlock AI features.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* UPLOADER / CREATOR SECTION */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* DRAG AND DROP UPLOADER BOX */}
          <div className="p-6 bg-white border border-slate-200/80 rounded-2xl dark:bg-[#0d1527] dark:border-slate-800/80">
            <h3 className="font-semibold text-base text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
              <UploadCloud className="h-5 w-5 text-sky-500" /> Upload Document
            </h3>

            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-colors ${
                dragActive
                  ? 'border-sky-500 bg-sky-50/20 dark:border-sky-400 dark:bg-sky-950/10'
                  : 'border-slate-200 hover:border-slate-350 hover:bg-slate-50/50 dark:border-slate-800 dark:hover:border-slate-700 dark:hover:bg-slate-900/40'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.docx,.txt"
                onChange={handleFileChange}
              />
              
              <UploadCloud className="h-10 w-10 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Drag & Drop file here, or <span className="text-sky-500 dark:text-sky-400 hover:underline">browse</span>
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 font-medium">
                Supports PDF, DOCX, or TXT formats (Max 5MB)
              </p>
            </div>

            {/* Selected File Review */}
            {selectedFile && (
              <div className="mt-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 shrink-0 flex items-center justify-center rounded-lg bg-sky-500/10 text-sky-500">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold truncate text-slate-800 dark:text-slate-200">{selectedFile.name}</h4>
                    <p className="text-xs text-slate-400 font-semibold mt-0.5">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-250 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                  <button
                    onClick={handleUploadSubmit}
                    disabled={uploadMutation.isPending}
                    className="py-2 px-4 flex items-center gap-1.5 bg-gradient-to-tr from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-500/15 disabled:opacity-50"
                  >
                    {uploadMutation.isPending ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Uploading Chunks...
                      </>
                    ) : (
                      'Submit Resume'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* FALLBACK MANUAL JSON BUILDER FORM */}
          <div className="p-6 bg-white border border-slate-200/80 rounded-2xl dark:bg-[#0d1527] dark:border-slate-800/80">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-base text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <ListRestart className="h-5 w-5 text-indigo-500" /> Profile Fallback Creator
              </h3>
              <button
                type="button"
                onClick={() => setManualFormOpen(!manualFormOpen)}
                className="text-xs font-bold text-sky-500 dark:text-sky-400 hover:underline"
              >
                {manualFormOpen ? 'Hide Creator' : 'Build Manually'}
              </button>
            </div>

            {manualFormOpen && (
              <form onSubmit={handleManualSubmit} className="space-y-4 animate-fade-in">
                
                <div className="p-3.5 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 mb-4 flex items-start gap-2.5">
                  <Sparkles className="h-4.5 w-4.5 text-indigo-400 shrink-0 mt-0.5 animate-pulse" />
                  <p className="text-xs text-indigo-400 dark:text-indigo-400 font-semibold leading-relaxed">
                    No PDF file nearby? Fill in this mock CV structural profile which calculates match algorithms instantly!
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={cvName}
                    onChange={(e) => setCvName(e.target.value)}
                    placeholder="Devin Pilot"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-sky-500 transition-colors text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    CV Summary & Professional Highlights *
                  </label>
                  <textarea
                    required
                    value={cvSummary}
                    onChange={(e) => setCvSummary(e.target.value)}
                    rows={4}
                    placeholder="Senior AI Engineer with 5+ years of experience constructing FastAPI backends and LangChain multi-agent systems..."
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-sky-500 transition-colors text-slate-800 dark:text-slate-100"
                  />
                </div>

                {/* Skill List Tag inputs */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Core Technical Skills *
                  </label>
                  
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      placeholder="FastAPI, Python, Next.js"
                      className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-sky-500 transition-colors text-slate-800 dark:text-slate-100"
                    />
                    <button
                      type="button"
                      onClick={handleManualAddSkill}
                      className="px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300"
                    >
                      <Plus className="h-4.5 w-4.5" />
                    </button>
                  </div>

                  {skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 p-3.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200/50 dark:border-slate-800/60 mt-3">
                      {skills.map((skill, index) => (
                        <span
                          key={index}
                          className="py-1 pl-2.5 pr-1.5 rounded-lg bg-white border border-slate-200 text-[10px] text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 font-bold inline-flex items-center gap-1"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(skill)}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800/40">
                  <button
                    type="submit"
                    disabled={buildMutation.isPending || !cvName || !cvSummary || skills.length === 0}
                    className="py-2.5 px-6 rounded-xl text-xs font-bold text-white bg-gradient-to-tr from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 shadow-md shadow-sky-500/10 active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    {buildMutation.isPending ? 'Generating CV Profile...' : 'Save Manual Resume'}
                  </button>
                </div>

              </form>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}
