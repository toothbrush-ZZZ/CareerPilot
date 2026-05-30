'use client';

import React, { useState, useEffect } from 'react';
import { careerApi } from '@/lib/api';
import { User, MapPin, Shield, Camera, Loader2, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Profile } from '@/lib/types';

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await careerApi.getProfile();
        setProfile(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    setSaveMessage('');
    try {
      await careerApi.updateProfile(profile);
      setSaveMessage('Profile saved successfully.');
    } catch (err) {
      console.error(err);
      setSaveMessage('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <Loader2 className="animate-spin text-blue-500" size={40} />
      <p className="text-white/40 animate-pulse font-medium">Loading your profile...</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gradient">Your Profile</h1>
        <p className="text-white/50 mt-1">Manage your personal information and preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="glass rounded-[2rem] p-8 flex flex-col items-center text-center h-fit">
          <div className="relative group mb-6">
            <div className="w-32 h-32 rounded-[2rem] bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-4xl font-bold border-4 border-white/5">
              {profile?.full_name?.charAt(0) || 'U'}
            </div>
            <button className="absolute bottom-0 right-0 p-2 rounded-xl bg-[#111113] border border-white/10 text-white/50 hover:text-white transition-all">
              <Camera size={18} />
            </button>
          </div>
          <h3 className="text-xl font-bold">{profile?.full_name || 'User Name'}</h3>
          <p className="text-white/40 text-sm mb-6">{profile?.email}</p>
          <div className="w-full pt-6 border-t border-white/5 space-y-3">
            <div className="flex items-center gap-3 text-sm text-white/60 justify-center">
              <MapPin size={16} className="text-blue-400" />
              <span>{profile?.location_city || 'Location not set'}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-white/60 justify-center">
              <Shield size={16} className="text-green-400" />
              <span>Active Member</span>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="glass rounded-[2rem] p-8 space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <User size={20} className="text-blue-400" />
              Public Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/30 uppercase tracking-widest px-1">Full Name</label>
                <input 
                  type="text" 
                  value={profile?.full_name || ''} 
                  onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/30 uppercase tracking-widest px-1">Email</label>
                <input 
                  type="email" 
                  disabled
                  value={profile?.email || ''} 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm opacity-50 cursor-not-allowed font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/30 uppercase tracking-widest px-1">City</label>
                <input 
                  type="text" 
                  value={profile?.location_city || ''} 
                  onChange={(e) => setProfile({...profile, location_city: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/30 uppercase tracking-widest px-1">Country Code (ISO)</label>
                <input 
                  type="text" 
                  value={profile?.location_country || ''} 
                  onChange={(e) => setProfile({...profile, location_country: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all font-medium"
                  placeholder="e.g. BD"
                />
              </div>
            </div>
          </div>

          {saveMessage && (
            <p className={cn(
              "text-sm text-center",
              saveMessage.includes('success') ? "text-green-400" : "text-red-400"
            )}>
              {saveMessage}
            </p>
          )}

          <div className="flex justify-end pt-4">
            <button 
              onClick={handleSave}
              disabled={saving}
              className="px-10 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:bg-white/10 text-white font-bold transition-all flex items-center gap-2 shadow-xl shadow-blue-500/20"
            >
              {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
