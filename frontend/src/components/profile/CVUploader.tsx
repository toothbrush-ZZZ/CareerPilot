'use client';

import React, { useState, useEffect } from 'react';
import { UploadCloud, FileText, CheckCircle2, Trash2, Edit3 } from 'lucide-react';
import { useAppStore } from '@/lib/store/useAppStore';
import { useDashboardStore } from '@/lib/store/useDashboardStore';
import { PulseLoader } from '../ui/PulseLoader';
import { uploadCV, deleteCV, buildCV, getCVStatus } from '@/lib/utils/api';

interface CVUploaderProps {
  onUploadComplete: (sections: any[], skills: string[]) => void;
}

export function CVUploader({ onUploadComplete }: CVUploaderProps) {
  const { user, setUser, setCvUploaded, cvUploaded, addToast } = useAppStore();
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [fileMeta, setFileMeta] = useState<{ size: string; type: string } | null>(null);
  const [mode, setMode] = useState<'upload' | 'build'>('upload');
  const [buildData, setBuildData] = useState({ summary: '', education: '' });
  const [experiences, setExperiences] = useState<{ role: string; company: string; duration: string }[]>([
    { role: '', company: '', duration: '' }
  ]);
  const [projects, setProjects] = useState<{ title: string; description: string }[]>([
    { title: '', description: '' }
  ]);
  const [skills, setSkills] = useState<string[]>(['']);

  useEffect(() => {
    getCVStatus().then((status) => {
      if (status.has_cv) setCvUploaded(true);
    }).catch(() => {});
  }, []);

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setPendingFile(null);
    try {
      const result = await uploadCV(file);
      setCvUploaded(true);
      const ext = file.name.split('.').pop() || 'pdf';
      setFileMeta({ size: (file.size / 1024).toFixed(0) + ' KB', type: ext });
      if (user) {
        setUser({ ...user, cvFileName: file.name, cvUploadedAt: new Date().toISOString() });
      }
      addToast({ message: 'CV uploaded successfully.', type: 'success' });
      useDashboardStore.getState().loadData(true);
      onUploadComplete(result.sections || [], result.skills || []);
    } catch {
      addToast({ message: 'Failed to upload CV. Please try again.', type: 'error' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteCV = async () => {
    if (!window.confirm("Are you sure you want to delete your CV? This will remove all extracted skills and indexed data.")) return;
    try {
      await deleteCV();
      setCvUploaded(false);
      if (user) {
        setUser({ ...user, cvFileName: undefined, cvUploadedAt: undefined });
      }
      setFileMeta(null);
      addToast({ message: 'CV deleted successfully.', type: 'success' });
      useDashboardStore.getState().loadData(true);
      onUploadComplete([], []);
    } catch {
      addToast({ message: 'Failed to delete CV.', type: 'error' });
    }
  };

  const handleBuildSubmit = async () => {
    const compiledExperience = experiences
      .filter(exp => exp.role.trim() || exp.company.trim())
      .map(exp => `${exp.role} at ${exp.company} (${exp.duration})`)
      .join('\n');

    const compiledProjects = projects
      .filter(p => p.title.trim())
      .map(p => `${p.title}: ${p.description}`)
      .join('\n');

    const compiledSkills = skills
      .filter(s => s.trim())
      .join(', ');

    if (!compiledExperience && !compiledSkills && !compiledProjects) {
      addToast({ message: 'Please provide some experience, projects, or skills.', type: 'error' });
      return;
    }
    setIsUploading(true);
    try {
      const result = await buildCV({ 
        ...buildData, 
        experience: compiledExperience,
        projects: compiledProjects,
        skills: compiledSkills
      });
      setCvUploaded(true);
      if (user) {
        setUser({ ...user, cvFileName: 'built_cv.txt', cvUploadedAt: new Date().toISOString() });
      }
      setFileMeta({ size: '1 KB', type: 'txt' });
      addToast({ message: 'CV built and indexed successfully.', type: 'success' });
      useDashboardStore.getState().loadData(true);
      onUploadComplete(result.sections || [], result.skills || []);
    } catch {
      addToast({ message: 'Failed to build CV. Please try again.', type: 'error' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (cvUploaded) setPendingFile(file);
      else await handleFileUpload(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (cvUploaded) setPendingFile(file);
      else handleFileUpload(file);
    }
  };

  const dropZoneStyle: React.CSSProperties = {
    borderWidth: '2px',
    borderStyle: isUploading || cvUploaded ? 'solid' : 'dashed',
    borderColor: (isUploading || cvUploaded) 
      ? 'var(--cp-border)' 
      : (isDragging ? 'var(--cp-accent)' : 'var(--cp-border)'),
    background: isDragging ? 'var(--cp-accent-dim)' : 'var(--cp-surface)',
    borderRadius: '10px',
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '200px',
    transition: 'all 0.2s',
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Mode Toggle (only if not uploaded) */}
      {!cvUploaded && !isUploading && (
        <div className="flex bg-[var(--cp-surface)] rounded-md border border-[var(--cp-border)] p-1 w-fit mx-auto">
          <button
            onClick={() => setMode('upload')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-sm transition-colors flex items-center gap-2 ${mode === 'upload' ? 'bg-[var(--cp-accent)] text-white' : 'text-[var(--cp-text-muted)] hover:text-[var(--cp-text-primary)]'}`}
          >
            <UploadCloud size={14} /> Upload File
          </button>
          <button
            onClick={() => setMode('build')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-sm transition-colors flex items-center gap-2 ${mode === 'build' ? 'bg-[var(--cp-accent)] text-white' : 'text-[var(--cp-text-muted)] hover:text-[var(--cp-text-primary)]'}`}
          >
            <Edit3 size={14} /> Build CV
          </button>
        </div>
      )}

      {mode === 'build' && !cvUploaded && !isUploading ? (
        <div style={dropZoneStyle} className="!items-stretch !justify-start !p-4 gap-3 overflow-y-auto max-h-[500px] custom-scrollbar">
          <p className="text-sm font-semibold text-center mb-2" style={{ color: 'var(--cp-text-primary)' }}>Build Your CV</p>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-[var(--cp-text-secondary)]">Professional Summary</label>
            <textarea 
              value={buildData.summary}
              onChange={e => setBuildData(prev => ({...prev, summary: e.target.value}))}
              placeholder="A brief summary of your professional background"
              className="bg-[var(--cp-bg)] border border-[var(--cp-border)] rounded-md p-2 text-sm outline-none focus:border-[var(--cp-accent)] resize-none h-16"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[11px] text-[var(--cp-text-secondary)]">Work Experience</label>
            <div className="flex flex-col gap-2">
              {experiences.map((exp, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-2 rounded-md bg-[var(--cp-bg)] border border-[var(--cp-border)] relative group">
                  <input
                    placeholder="Role (e.g. Software Engineer)"
                    value={exp.role}
                    onChange={(e) => {
                      const newExp = [...experiences];
                      newExp[idx].role = e.target.value;
                      setExperiences(newExp);
                    }}
                    className="bg-transparent text-sm outline-none flex-1 w-full min-w-0"
                  />
                  <div className="hidden sm:block w-px h-4 bg-[var(--cp-border)]" />
                  <input
                    placeholder="Company (e.g. Google)"
                    value={exp.company}
                    onChange={(e) => {
                      const newExp = [...experiences];
                      newExp[idx].company = e.target.value;
                      setExperiences(newExp);
                    }}
                    className="bg-transparent text-sm outline-none flex-1 w-full min-w-0"
                  />
                  <div className="hidden sm:block w-px h-4 bg-[var(--cp-border)]" />
                  <input
                    placeholder="Duration (e.g. 2020-2023)"
                    value={exp.duration}
                    onChange={(e) => {
                      const newExp = [...experiences];
                      newExp[idx].duration = e.target.value;
                      setExperiences(newExp);
                    }}
                    className="bg-transparent text-sm outline-none w-full sm:w-28 min-w-0 pr-6 sm:pr-0"
                  />
                  {experiences.length > 1 && (
                    <button
                      onClick={() => {
                        const newExp = experiences.filter((_, i) => i !== idx);
                        setExperiences(newExp);
                      }}
                      className="absolute right-2 top-2 sm:static sm:top-auto sm:right-auto text-[var(--cp-text-muted)] hover:text-[var(--cp-danger)] opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                      title="Remove"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => setExperiences([...experiences, { role: '', company: '', duration: '' }])}
                className="self-start text-[11px] font-semibold flex items-center gap-1 transition-colors hover:opacity-80"
                style={{ color: 'var(--cp-accent)' }}
              >
                + Add Experience
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[11px] text-[var(--cp-text-secondary)]">Projects</label>
            <div className="flex flex-col gap-2">
              {projects.map((proj, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-2 rounded-md bg-[var(--cp-bg)] border border-[var(--cp-border)] relative group">
                  <input
                    placeholder="Project Title"
                    value={proj.title}
                    onChange={(e) => {
                      const newProj = [...projects];
                      newProj[idx].title = e.target.value;
                      setProjects(newProj);
                    }}
                    className="bg-transparent text-sm outline-none flex-1 w-full sm:w-1/3 min-w-0"
                  />
                  <div className="hidden sm:block w-px h-4 bg-[var(--cp-border)]" />
                  <input
                    placeholder="Short Description"
                    value={proj.description}
                    onChange={(e) => {
                      const newProj = [...projects];
                      newProj[idx].description = e.target.value;
                      setProjects(newProj);
                    }}
                    className="bg-transparent text-sm outline-none flex-1 w-full sm:w-2/3 min-w-0 pr-6 sm:pr-0"
                  />
                  {projects.length > 1 && (
                    <button
                      onClick={() => {
                        const newProj = projects.filter((_, i) => i !== idx);
                        setProjects(newProj);
                      }}
                      className="absolute right-2 top-2 sm:static sm:top-auto sm:right-auto text-[var(--cp-text-muted)] hover:text-[var(--cp-danger)] opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                      title="Remove"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => setProjects([...projects, { title: '', description: '' }])}
                className="self-start text-[11px] font-semibold flex items-center gap-1 transition-colors hover:opacity-80"
                style={{ color: 'var(--cp-accent)' }}
              >
                + Add Project
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[11px] text-[var(--cp-text-secondary)]">Key Skills</label>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, idx) => (
                <div key={idx} className="flex items-center gap-1 p-1 pl-2 rounded-md bg-[var(--cp-bg)] border border-[var(--cp-border)] group w-24 sm:w-32">
                  <input
                    placeholder="Skill"
                    value={skill}
                    onChange={(e) => {
                      const newSkills = [...skills];
                      newSkills[idx] = e.target.value;
                      setSkills(newSkills);
                    }}
                    className="bg-transparent text-xs outline-none w-full min-w-0"
                  />
                  {skills.length > 1 && (
                    <button
                      onClick={() => {
                        const newSkills = skills.filter((_, i) => i !== idx);
                        setSkills(newSkills);
                      }}
                      className="text-[var(--cp-text-muted)] hover:text-[var(--cp-danger)] opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity pr-1"
                      title="Remove"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => setSkills([...skills, ''])}
                className="text-[11px] font-semibold flex items-center gap-1 transition-colors hover:opacity-80 px-2 py-1 rounded-md"
                style={{ color: 'var(--cp-accent)', border: '1px dashed var(--cp-accent)' }}
              >
                + Add
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-[var(--cp-text-secondary)]">Education</label>
            <input 
              value={buildData.education}
              onChange={e => setBuildData(prev => ({...prev, education: e.target.value}))}
              placeholder="e.g. BS Computer Science, MIT"
              className="bg-[var(--cp-bg)] border border-[var(--cp-border)] rounded-md p-2 text-sm outline-none focus:border-[var(--cp-accent)]"
            />
          </div>
          <button
            onClick={handleBuildSubmit}
            className="mt-2 bg-[var(--cp-accent)] text-white px-4 py-2 rounded-md text-xs font-semibold"
          >
            Generate & Index CV
          </button>
        </div>
      ) : (
        <div
          style={dropZoneStyle}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-4">
              <PulseLoader size={60} />
              <div className="text-sm animate-pulse" style={{ color: 'var(--cp-accent)' }}>Extracting skills...</div>
            </div>
          ) : cvUploaded ? (
            <div className="flex flex-col items-center gap-3 w-full">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: 'var(--cp-accent-dim)', color: 'var(--cp-accent)' }}
              >
                <CheckCircle2 size={24} strokeWidth={1.5} />
              </div>
              <div className="text-sm font-semibold" style={{ color: 'var(--cp-text-primary)' }}>CV indexed successfully</div>

              <div
                className="w-full mt-3 p-4 rounded-[8px] flex items-center justify-between gap-3 group"
                style={{ background: 'var(--cp-card)', border: '1px solid var(--cp-border)' }}
              >
                <div className="flex items-center gap-3">
                  <FileText size={20} strokeWidth={1.5} className="shrink-0" style={{ color: 'var(--cp-accent)' }} />
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium truncate" style={{ color: 'var(--cp-text-primary)' }}>
                      {user?.cvFileName || 'resume.pdf'}
                    </span>
                    <span className="text-[10px]" style={{ color: 'var(--cp-text-muted)' }}>
                      {fileMeta ? `${fileMeta.size} · ${fileMeta.type.toUpperCase()} · ` : ''}
                      Uploaded {user?.cvUploadedAt ? new Date(user.cvUploadedAt).toLocaleDateString() : 'Just now'}
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={handleDeleteCV}
                  className="p-2 rounded-md text-[var(--cp-danger)] opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/10"
                  title="Delete CV"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 text-center">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: 'var(--cp-card)', color: 'var(--cp-text-secondary)' }}
              >
                <UploadCloud size={24} strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--cp-text-primary)' }}>Drag and drop your CV here</p>
                <p className="text-[10px] tracking-widest mt-1" style={{ color: 'var(--cp-text-muted)' }}>Supports PDF, DOCX</p>
              </div>
              <label
                className="mt-2 cursor-pointer px-4 py-2 rounded-[8px] text-sm font-semibold transition-colors"
                style={{
                  background: 'var(--cp-card)',
                  border: '1px solid var(--cp-accent)',
                  color: 'var(--cp-accent)',
                }}
              >
                Browse files
                <input type="file" className="hidden" accept=".pdf,.docx" onChange={handleInputChange} />
              </label>
            </div>
          )}
        </div>
      )}

      {pendingFile && (
        <div
          className="rounded-[8px] p-4 text-xs text-center space-y-2"
          style={{ background: 'var(--cp-surface)', border: `1px solid var(--cp-gold)` }}
        >
          <p className="font-semibold" style={{ color: 'var(--cp-gold)' }}>Replace existing CV?</p>
          <p style={{ color: 'var(--cp-text-muted)' }}>This will re-index your profile. All previous job matches remain.</p>
          <div className="flex gap-3 justify-center mt-2">
            <button
              onClick={() => handleFileUpload(pendingFile)}
              className="text-xs font-semibold hover:underline"
              style={{ color: 'var(--cp-accent)' }}
            >
              Replace
            </button>
            <button
              onClick={() => setPendingFile(null)}
              className="text-xs"
              style={{ color: 'var(--cp-text-muted)' }}
            >
              Keep current
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
