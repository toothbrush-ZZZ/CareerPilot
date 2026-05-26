'use client';

import React, { useState, useEffect } from 'react';
import { careerApi } from '@/lib/api';
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  Loader2, 
  Plus, 
  Trash2,
  ChevronRight,
  ChevronDown,
  Download,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function CVPage() {
  const [activeMode, setActiveMode] = useState<'upload' | 'build'>('upload');
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);
  const [buildData, setBuildData] = useState({
    personal: { name: '', email: '', phone: '', location: '' },
    summary: '',
    experience: [{ role: '', company: '', start_date: '', end_date: '', description: '' }],
    education: [{ degree: '', field: '', institution: '', year: '' }],
    skills: [''],
    projects: [{ name: '', description: '', url: '' }]
  });

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await careerApi.getCVStatus();
      setStatus(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      await careerApi.uploadCV(file);
      await fetchStatus();
      setFile(null);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gradient">CV Management</h1>
        <p className="text-white/50 mt-1">Your career data is the brain of CareerPilot. Keep it updated for best results.</p>
      </div>

      {/* CV Status Card */}
      {status?.has_cv && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 rounded-3xl bg-green-500/10 border border-green-500/20 flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-green-500/20 text-green-400">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <p className="text-green-200 font-bold">Successfully Parsed</p>
              <p className="text-green-300/50 text-sm">Vectorized into {status.chunk_count} semantic chunks</p>
            </div>
          </div>
          <div className="flex gap-2">
            {status.sections.map((s: string) => (
              <span key={s} className="text-[10px] uppercase font-bold px-2 py-1 rounded bg-green-500/10 text-green-400/70 border border-green-500/10">
                {s}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Mode Selector */}
      <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 w-fit">
        <button 
          onClick={() => setActiveMode('upload')}
          className={cn(
            "px-8 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
            activeMode === 'upload' ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-white/50 hover:text-white"
          )}
        >
          <Upload size={18} />
          Upload CV
        </button>
        <button 
          onClick={() => setActiveMode('build')}
          className={cn(
            "px-8 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
            activeMode === 'build' ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-white/50 hover:text-white"
          )}
        >
          <Plus size={18} />
          In-App Builder
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeMode === 'upload' ? (
          <motion.div 
            key="upload"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="glass rounded-[2.5rem] p-12 flex flex-col items-center border-dashed border-2 border-white/5 hover:border-blue-500/30 transition-all transition-colors"
          >
            <div className="w-20 h-20 rounded-3xl bg-blue-600/10 flex items-center justify-center text-blue-400 mb-6">
              <FileText size={40} />
            </div>
            <h3 className="text-xl font-bold mb-2">Upload your existing CV</h3>
            <p className="text-white/40 text-center max-w-sm mb-8">
              We support PDF and DOCX. Our AI will chunk and vectorize it for precise RAG retrieval.
            </p>
            
            <input 
              type="file" 
              id="cv-upload" 
              className="hidden" 
              accept=".pdf,.docx"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            
            {file ? (
              <div className="flex flex-col items-center gap-4">
                <div className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
                  <FileText className="text-blue-400" size={18} />
                  <span className="text-sm font-medium">{file.name}</span>
                  <button onClick={() => setFile(null)} className="text-white/20 hover:text-red-400">
                    <Trash2 size={16} />
                  </button>
                </div>
                <button 
                  onClick={handleUpload}
                  disabled={uploading}
                  className="px-10 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:bg-white/10 text-white font-bold transition-all flex items-center gap-2 shadow-xl shadow-blue-500/20"
                >
                  {uploading ? <Loader2 className="animate-spin" size={20} /> : <><CheckCircle2 size={20} /> Process CV</>}
                </button>
              </div>
            ) : (
              <label 
                htmlFor="cv-upload" 
                className="px-10 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/[0.08] text-white font-bold cursor-pointer transition-all active:scale-95"
              >
                Select File
              </label>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="build"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="glass rounded-3xl p-8">
              <h3 className="text-xl font-bold mb-8">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup label="Full Name" value={buildData.personal.name} onChange={(v) => setBuildData({...buildData, personal: {...buildData.personal, name: v}})} />
                <InputGroup label="Email" value={buildData.personal.email} onChange={(v) => setBuildData({...buildData, personal: {...buildData.personal, email: v}})} />
                <InputGroup label="Phone" value={buildData.personal.phone} onChange={(v) => setBuildData({...buildData, personal: {...buildData.personal, phone: v}})} />
                <InputGroup label="Location" value={buildData.personal.location} onChange={(v) => setBuildData({...buildData, personal: {...buildData.personal, location: v}})} />
              </div>
            </div>
            
            <div className="flex justify-end pt-4">
              <button className="px-10 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all flex items-center gap-2 shadow-xl shadow-blue-500/20">
                Generate & Save
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function InputGroup({ label, value, onChange, type = "text" }: any) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-white/30 uppercase tracking-widest px-1">{label}</label>
      <input 
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all font-medium"
        placeholder={`Enter your ${label.toLowerCase()}`}
      />
    </div>
  );
}
