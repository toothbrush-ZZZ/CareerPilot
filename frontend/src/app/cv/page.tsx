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
  const [saving, setSaving] = useState(false);
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

  const fetchStatus = async () => {
    try {
      const res = await careerApi.getCVStatus();
      setStatus(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

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

  const handleBuild = async () => {
    setSaving(true);
    try {
      await careerApi.buildCV(buildData);
      await fetchStatus();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
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
              <p className="text-green-300/50 text-sm">Your profile is fully optimized for personalized matching</p>
            </div>
          </div>
          <div className="flex gap-2">
            {status.sections?.map((s: string) => (
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
              We support PDF and DOCX. Our system analyzes your experience to find the best-fitting opportunities.
            </p>
            
            <input 
              type="file" 
              id="cv-upload" 
              className="hidden" 
              accept=".pdf,.docx"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFile(e.target.files?.[0] || null)}
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
                  {uploading ? <Loader2 className="animate-spin" size={20} /> : <><CheckCircle2 size={20} /> Finalize Upload</>}
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
            <div className="glass rounded-3xl p-8 space-y-8">
              <div>
                <h3 className="text-xl font-bold mb-8 text-gradient">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputGroup label="Full Name" value={buildData.personal.name} onChange={(v: string) => setBuildData({...buildData, personal: {...buildData.personal, name: v}})} />
                  <InputGroup label="Email" value={buildData.personal.email} onChange={(v: string) => setBuildData({...buildData, personal: {...buildData.personal, email: v}})} />
                  <InputGroup label="Phone" value={buildData.personal.phone} onChange={(v: string) => setBuildData({...buildData, personal: {...buildData.personal, phone: v}})} />
                  <InputGroup label="Location" value={buildData.personal.location} onChange={(v: string) => setBuildData({...buildData, personal: {...buildData.personal, location: v}})} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-6">
                  <label className="text-xs font-bold text-white/30 uppercase tracking-widest px-1">Professional Experience</label>
                  <button 
                    onClick={() => setBuildData({...buildData, experience: [...buildData.experience, { role: '', company: '', start_date: '', end_date: '', description: '' }]})}
                    className="p-1.5 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white transition-all"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <div className="space-y-6">
                  {buildData.experience.map((exp, i) => (
                    <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/5 space-y-4 relative group">
                      <button 
                        onClick={() => setBuildData({...buildData, experience: buildData.experience.filter((_, idx) => idx !== i)})}
                        className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-red-500/10 text-white/10 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputGroup label="Role" value={exp.role} onChange={(v: string) => {
                          const newList = [...buildData.experience];
                          newList[i].role = v;
                          setBuildData({...buildData, experience: newList});
                        }} />
                        <InputGroup label="Company" value={exp.company} onChange={(v: string) => {
                          const newList = [...buildData.experience];
                          newList[i].company = v;
                          setBuildData({...buildData, experience: newList});
                        }} />
                        <InputGroup label="Start Date" value={exp.start_date} onChange={(v: string) => {
                          const newList = [...buildData.experience];
                          newList[i].start_date = v;
                          setBuildData({...buildData, experience: newList});
                        }} />
                        <InputGroup label="End Date" value={exp.end_date} onChange={(v: string) => {
                          const newList = [...buildData.experience];
                          newList[i].end_date = v;
                          setBuildData({...buildData, experience: newList});
                        }} />
                      </div>
                      <textarea
                        value={exp.description}
                        onChange={(e) => {
                          const newList = [...buildData.experience];
                          newList[i].description = e.target.value;
                          setBuildData({...buildData, experience: newList});
                        }}
                        className="w-full min-h-[80px] bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                        placeholder="Key responsibilities and achievements"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-6">
                  <label className="text-xs font-bold text-white/30 uppercase tracking-widest px-1">Education</label>
                  <button 
                    onClick={() => setBuildData({...buildData, education: [...buildData.education, { degree: '', field: '', institution: '', year: '' }]})}
                    className="p-1.5 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white transition-all"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <div className="space-y-6">
                  {buildData.education.map((edu, i) => (
                    <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/5 space-y-4 relative group">
                      <button 
                        onClick={() => setBuildData({...buildData, education: buildData.education.filter((_, idx) => idx !== i)})}
                        className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-red-500/10 text-white/10 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputGroup label="Degree" value={edu.degree} onChange={(v: string) => {
                          const newList = [...buildData.education];
                          newList[i].degree = v;
                          setBuildData({...buildData, education: newList});
                        }} />
                        <InputGroup label="Field of Study" value={edu.field} onChange={(v: string) => {
                          const newList = [...buildData.education];
                          newList[i].field = v;
                          setBuildData({...buildData, education: newList});
                        }} />
                        <InputGroup label="Institution" value={edu.institution} onChange={(v: string) => {
                          const newList = [...buildData.education];
                          newList[i].institution = v;
                          setBuildData({...buildData, education: newList});
                        }} />
                        <InputGroup label="Year" value={edu.year} onChange={(v: string) => {
                          const newList = [...buildData.education];
                          newList[i].year = v;
                          setBuildData({...buildData, education: newList});
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-6">
                  <label className="text-xs font-bold text-white/30 uppercase tracking-widest px-1">Projects</label>
                  <button 
                    onClick={() => setBuildData({...buildData, projects: [...buildData.projects, { name: '', description: '', url: '' }]})}
                    className="p-1.5 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white transition-all"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <div className="space-y-6">
                  {buildData.projects.map((proj, i) => (
                    <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/5 space-y-4 relative group">
                      <button 
                        onClick={() => setBuildData({...buildData, projects: buildData.projects.filter((_, idx) => idx !== i)})}
                        className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-red-500/10 text-white/10 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputGroup label="Project Name" value={proj.name} onChange={(v: string) => {
                          const newList = [...buildData.projects];
                          newList[i].name = v;
                          setBuildData({...buildData, projects: newList});
                        }} />
                        <InputGroup label="URL / Link" value={proj.url} onChange={(v: string) => {
                          const newList = [...buildData.projects];
                          newList[i].url = v;
                          setBuildData({...buildData, projects: newList});
                        }} />
                      </div>
                      <textarea
                        value={proj.description}
                        onChange={(e) => {
                          const newList = [...buildData.projects];
                          newList[i].description = e.target.value;
                          setBuildData({...buildData, projects: newList});
                        }}
                        className="w-full min-h-[80px] bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                        placeholder="Describe the project, technologies used, and your role"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-white/30 uppercase tracking-widest px-1">Professional Summary</label>
                <textarea
                  value={buildData.summary}
                  onChange={(e) => setBuildData({...buildData, summary: e.target.value})}
                  className="w-full min-h-[120px] bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all font-medium mt-2"
                  placeholder="Summarize your experience, strengths and career goals"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-white/30 uppercase tracking-widest px-1">Technical Skills</label>
                <p className="text-[10px] text-white/20 mb-2 px-1">Separate skills with commas (e.g., Python, React, AWS)</p>
                <input 
                  type="text"
                  value={buildData.skills.join(', ')}
                  onChange={(e) => setBuildData({...buildData, skills: e.target.value.split(',').map(s => s.trim())})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all font-medium"
                  placeholder="Python, Javascript, Docker..."
                />
              </div>
            </div>
            
            <div className="flex justify-end pt-4">
              <button
                onClick={handleBuild}
                disabled={saving}
                className="px-10 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:bg-white/10 disabled:text-white/40 text-white font-bold transition-all flex items-center gap-2 shadow-xl shadow-blue-500/20"
              >
                {saving ? <Loader2 className="animate-spin" size={20} /> : <><CheckCircle2 size={20} /> Generate & Save</>}
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
