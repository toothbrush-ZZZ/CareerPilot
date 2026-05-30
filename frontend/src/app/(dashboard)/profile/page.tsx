'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services/auth';
import { useAuthStore } from '@/store/useAuthStore';
import {
  UserCog,
  Save,
  MapPin,
  User,
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  Sparkles
} from 'lucide-react';

export default function ProfileSettings() {
  const queryClient = useQueryClient();
  const { user, updateProfile } = useAuthStore();
  
  // Local form states
  const [fullName, setFullName] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Synchronize initial data once loaded
  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setCity(user.location_city || '');
      setCountry(user.location_country || '');
    }
  }, [user]);

  // Mutations
  const updateMutation = useMutation({
    mutationFn: authService.updateProfile,
    onSuccess: (data) => {
      // 1. Update Zustand store session dynamically
      updateProfile({
        full_name: fullName,
        location_city: city,
        location_country: country,
      });
      
      // 2. Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['cv-status'] });
      queryClient.invalidateQueries({ queryKey: ['user-location'] });
      
      setSuccessMsg('Profile updated successfully!');
      setErrorMsg('');
      setTimeout(() => setSuccessMsg(''), 4000);
    },
    onError: (err: any) => {
      setErrorMsg(err.message || 'Failed to update profile settings.');
      setSuccessMsg('');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName) return;

    updateMutation.mutate({
      full_name: fullName,
      location_city: city || '',
      location_country: country || '',
    });
  };

  return (
    <div className="space-y-8 max-w-2xl">
      
      {/* Page Header */}
      <div>
        <h1 className="font-display font-bold text-2xl md:text-3xl text-slate-800 dark:text-slate-100">
          Account Settings
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5 font-medium">
          Manage your personal details and location targets.
        </p>
      </div>

      {/* Alert banners */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          🎉 {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
          🚨 {errorMsg}
        </div>
      )}

      {/* Editor Form Card */}
      <div className="p-6 bg-white border border-slate-200/80 rounded-2xl dark:bg-[#0d1527] dark:border-slate-800/80 shadow-sm relative overflow-hidden">
        
        {/* Glow detail */}
        <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-sky-500/10 blur-xl" />

        <h3 className="font-semibold text-base text-slate-800 dark:text-slate-100 mb-6 pb-2 border-b border-slate-100 dark:border-slate-800/40 flex items-center gap-2">
          <UserCog className="h-5 w-5 text-sky-500" /> Edit Profile Specs
        </h3>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Readonly Account Tier Indicator */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-xl flex items-center justify-between font-bold text-xs">
            <span className="text-slate-500 dark:text-slate-400">Account Subscription Tier:</span>
            <span className="inline-flex items-center gap-1 text-sky-600 dark:text-sky-400 uppercase tracking-wide">
              <ShieldCheck className="h-4 w-4" /> AI Premium Member
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Full Name *
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <User className="h-4.5 w-4.5" />
              </span>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Devin Pilot"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 pl-10 text-sm focus:outline-none focus:border-sky-500 transition-colors text-slate-800 dark:text-slate-100 font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                City Location
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <MapPin className="h-4.5 w-4.5" />
                </span>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. San Francisco"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 pl-10 text-sm focus:outline-none focus:border-sky-500 transition-colors text-slate-800 dark:text-slate-100 font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Country Location
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <MapPin className="h-4.5 w-4.5" />
                </span>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="e.g. USA"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 pl-10 text-sm focus:outline-none focus:border-sky-500 transition-colors text-slate-800 dark:text-slate-100 font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Form Save Button */}
          <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800/40">
            <button
              type="submit"
              disabled={updateMutation.isPending || !fullName}
              className="py-2.5 px-6 rounded-xl text-xs font-bold text-white bg-gradient-to-tr from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 shadow-md shadow-sky-500/10 active:scale-[0.98] transition-all disabled:opacity-50 inline-flex items-center gap-2"
            >
              {updateMutation.isPending ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Saving Changes...
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" /> Save Profile Details
                </>
              )}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}
