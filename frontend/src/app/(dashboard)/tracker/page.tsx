'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { trackerService } from '@/services/tracker';
import { Application } from '@/types';
import {
  Plus,
  Briefcase,
  MapPin,
  Link2,
  Trash2,
  Edit,
  ClipboardList,
  Compass,
  ArrowRightLeft,
  X,
  FileText
} from 'lucide-react';

const COLUMNS: { id: Application['status']; name: string; colorClass: string; bgClass: string; textClass: string }[] = [
  { id: 'applied', name: 'Applied', colorClass: 'border-blue-500', bgClass: 'bg-blue-50 dark:bg-blue-950/20', textClass: 'text-blue-500' },
  { id: 'interviewing', name: 'Interviewing', colorClass: 'border-purple-500', bgClass: 'bg-purple-50 dark:bg-purple-950/20', textClass: 'text-purple-500' },
  { id: 'offer', name: 'Offer Received', colorClass: 'border-emerald-500', bgClass: 'bg-emerald-50 dark:bg-emerald-950/20', textClass: 'text-emerald-500' },
  { id: 'rejected', name: 'Archived / Rejected', colorClass: 'border-rose-500', bgClass: 'bg-rose-50 dark:bg-rose-950/20', textClass: 'text-rose-500' },
];

export default function KanbanTracker() {
  const queryClient = useQueryClient();
  
  // Track open/close dialog modals
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  // Form states
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [jobUrl, setJobUrl] = useState('');
  const [status, setStatus] = useState<Application['status']>('applied');
  const [notes, setNotes] = useState('');

  // Fetch applications list
  const { data: apps = [], isLoading, refetch } = useQuery({
    queryKey: ['applications'],
    queryFn: trackerService.getApplications,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: trackerService.createApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      closeFormModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Application> }) =>
      trackerService.updateApplication(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      closeFormModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: trackerService.deleteApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      closeFormModal();
    },
  });

  // Open modal for adding new application
  const handleAddNewClick = () => {
    setSelectedApp(null);
    setJobTitle('');
    setCompany('');
    setLocation('');
    setJobUrl('');
    setStatus('applied');
    setNotes('');
    setModalOpen(true);
  };

  // Open modal for editing existing application
  const handleCardClick = (app: Application) => {
    setSelectedApp(app);
    setJobTitle(app.job_title);
    setCompany(app.company);
    setLocation(app.location);
    setJobUrl(app.job_url);
    setStatus(app.status);
    setNotes(app.notes);
    setModalOpen(true);
  };

  const closeFormModal = () => {
    setModalOpen(false);
    setSelectedApp(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle || !company) return;

    const payload = {
      job_title: jobTitle,
      company,
      location: location || 'Remote',
      job_url: jobUrl || '',
      status,
      notes: notes || '',
    };

    if (selectedApp) {
      updateMutation.mutate({ id: selectedApp.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = () => {
    if (selectedApp) {
      if (confirm('Delete this tracked job application?')) {
        deleteMutation.mutate(selectedApp.id);
      }
    }
  };

  // Quick move status inside cards
  const handleStatusShift = (app: Application, targetStatus: Application['status']) => {
    updateMutation.mutate({ id: app.id, data: { status: targetStatus } });
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[500px]">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl md:text-3xl text-slate-800 dark:text-slate-100">
            Application Pipeline
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5 font-medium">
            Drag-like updates and quick logs of active career targets.
          </p>
        </div>

        <button
          onClick={handleAddNewClick}
          className="self-start sm:self-auto flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-tr from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 shadow-md shadow-sky-500/20 active:scale-[0.98] transition-all"
        >
          <Plus className="h-4 w-4" /> Add Application
        </button>
      </div>

      {/* Kanban Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
        {COLUMNS.map((col) => {
          const colApps = apps.filter((app) => app.status === col.id);
          
          return (
            <div
              key={col.id}
              className={`rounded-2xl border border-slate-200/60 dark:border-slate-800/80 p-4 min-h-[500px] flex flex-col ${col.bgClass}`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4 border-b border-slate-200/40 pb-2 dark:border-slate-800/40">
                <span className={`text-xs font-bold uppercase tracking-wider ${col.textClass}`}>
                  {col.name}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200/60 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                  {colApps.length}
                </span>
              </div>

              {/* Column Content */}
              <div className="flex-1 space-y-4 overflow-y-auto">
                {colApps.map((app) => (
                  <div
                    key={app.id}
                    className="p-4 bg-white border border-slate-200/80 rounded-xl shadow-sm dark:bg-[#0b0f19] dark:border-slate-800/80 hover:border-sky-500/30 dark:hover:border-sky-500/30 transition-all cursor-pointer group"
                    onClick={() => handleCardClick(app)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold text-sm truncate text-slate-800 dark:text-slate-100 group-hover:text-sky-500 dark:group-hover:text-sky-400">
                        {app.job_title}
                      </h4>
                    </div>
                    
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold truncate flex items-center gap-1.5 mt-1">
                      <Briefcase className="h-3 w-3 shrink-0 text-slate-400" /> {app.company}
                    </p>

                    <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold truncate flex items-center gap-1.5 mt-1">
                      <MapPin className="h-3 w-3 shrink-0 text-slate-400" /> {app.location}
                    </p>

                    {app.notes && (
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium line-clamp-2 mt-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-850">
                        {app.notes}
                      </p>
                    )}

                    {/* Card Actions Bottom */}
                    <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/40 mt-3 pt-2">
                      {app.job_url ? (
                        <a
                          href={app.job_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-[10px] text-sky-500 hover:underline inline-flex items-center gap-1 font-semibold"
                        >
                          <Link2 className="h-3 w-3" /> Job Link
                        </a>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">No Link</span>
                      )}

                      {/* Dropdown status transfer shortcut */}
                      <select
                        value={app.status}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleStatusShift(app, e.target.value as Application['status']);
                        }}
                        className="text-[9px] font-bold py-0.5 px-1.5 rounded bg-slate-100 dark:bg-slate-800 border-none outline-none text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-750"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <option value="applied">Applied</option>
                        <option value="interviewing">Interviewing</option>
                        <option value="offer">Offer</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>

                  </div>
                ))}

                {colApps.length === 0 && (
                  <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-600 italic">
                    Empty column
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* Dynamic Overlay Form Modal (Dual Mode Add/Edit) */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white border border-slate-200 dark:bg-[#0b0f19] dark:border-slate-800 rounded-3xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Title Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200/60 dark:border-slate-800/60">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-sky-500" />
                <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100">
                  {selectedApp ? 'Edit Tracked Job' : 'Add Tracked Job'}
                </h3>
              </div>
              <button
                onClick={closeFormModal}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="Senior AI Engineer"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-sky-500 transition-colors text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Company *
                  </label>
                  <input
                    type="text"
                    required
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Acme Corp"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-sky-500 transition-colors text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="San Francisco, CA or Remote"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-sky-500 transition-colors text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Job Posting URL
                  </label>
                  <input
                    type="url"
                    value={jobUrl}
                    onChange={(e) => setJobUrl(e.target.value)}
                    placeholder="https://company.com/job/123"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-sky-500 transition-colors text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Pipeline Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as Application['status'])}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-sky-500 transition-colors text-slate-800 dark:text-slate-100"
                >
                  <option value="applied">Applied</option>
                  <option value="interviewing">Interviewing</option>
                  <option value="offer">Offer Received</option>
                  <option value="rejected">Archived / Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Private Logs & Interview Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  placeholder="Recruiter call scheduled. Notes about benefits, questions to ask..."
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-sky-500 transition-colors text-slate-800 dark:text-slate-100"
                />
              </div>

              {/* Form buttons */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200/40 dark:border-slate-800/40">
                {selectedApp ? (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="flex items-center gap-1.5 px-4 py-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl text-xs font-bold transition-all border border-rose-500/10"
                  >
                    <Trash2 className="h-4 w-4" /> Delete Tracker
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={closeFormModal}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-xs font-bold rounded-xl text-slate-600 dark:text-slate-400 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-white bg-gradient-to-tr from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 shadow-sm text-xs font-bold rounded-xl transition-all"
                  >
                    {selectedApp ? 'Save Changes' : 'Create Entry'}
                  </button>
                </div>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
