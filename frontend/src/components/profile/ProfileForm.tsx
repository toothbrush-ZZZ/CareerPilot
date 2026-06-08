'use client';

import React, { useState, useEffect } from 'react';
import { User as UserIcon } from 'lucide-react';
import { authService } from '@/lib/utils/api';
import { useAppStore } from '@/lib/store/useAppStore';

export function ProfileForm() {
  const [formData, setFormData] = useState({
    full_name: '',
    location_city: '',
    location_country: '',
    desired_role: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const [passData, setPassData] = useState({ current_password: '', new_password: '' });
  const [passLoading, setPassLoading] = useState(false);
  const [passMessage, setPassMessage] = useState('');
  const [isPassSuccess, setIsPassSuccess] = useState(false);

  useEffect(() => {
    authService.getProfile().then((data) => {
      setFormData({
        full_name: data.full_name || '',
        location_city: data.location_city || '',
        location_country: data.location_country || '',
        desired_role: data.desired_role || ''
      });
    }).catch(console.error);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await authService.updateProfile(formData);
      const currentUser = useAppStore.getState().user;
      if (currentUser) {
        useAppStore.getState().setUser({ ...currentUser, name: formData.full_name });
      }
      setMessage('Profile updated');
      setIsSuccess(true);
    } catch (err) {
      setMessage('Failed to update profile. Please try again.');
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const handlePassChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePassSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassLoading(true);
    setPassMessage('');
    try {
      await authService.changePassword(passData.current_password, passData.new_password);
      setPassMessage('Password updated successfully');
      setIsPassSuccess(true);
      setPassData({ current_password: '', new_password: '' });
    } catch (err: any) {
      setPassMessage(err.message || 'Failed to update password.');
      setIsPassSuccess(false);
    } finally {
      setPassLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const password = window.prompt("WARNING: This action cannot be undone.\\nPlease enter your password to confirm account deletion:");
    if (!password) return;
    
    try {
      await authService.deleteAccount(password);
      useAppStore.getState().logout();
      alert("Account deleted. You will be redirected.");
      window.location.href = "/";
    } catch (err: any) {
      alert("Failed to delete account: " + (err.message || 'Incorrect password'));
    }
  };

  const inputStyle: React.CSSProperties = {
    background: 'var(--cp-bg)',
    border: '1px solid var(--cp-border)',
    borderRadius: '8px',
    padding: '8px 12px',
    fontSize: '14px',
    color: 'var(--cp-text-primary)',
    outline: 'none',
    width: '100%',
    transition: 'border-color 0.15s',
  };

  return (
    <div className="flex flex-col gap-4 mb-6">
      <h2
        className="text-[11px] font-medium tracking-[-0.01em] mb-2 flex items-center gap-2"
        style={{ color: 'var(--cp-text-primary)' }}
      >
        <UserIcon size={20} strokeWidth={1.5} style={{ color: 'var(--cp-accent)' }} />
        Basic information
      </h2>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4"
        style={{
          background: 'var(--cp-surface)',
          border: '1px solid var(--cp-border)',
          borderRadius: '10px',
          padding: '20px',
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: 'Full name', name: 'full_name', value: formData.full_name },
            { label: 'Desired role', name: 'desired_role', value: formData.desired_role },
            { label: 'City', name: 'location_city', value: formData.location_city },
            { label: 'Country', name: 'location_country', value: formData.location_country },
          ].map(field => (
            <div key={field.name} className="flex flex-col gap-1.5">
              <label
                className="text-[11px] font-medium tracking-[-0.01em]"
                style={{ color: 'var(--cp-text-secondary)' }}
              >
                {field.label}
              </label>
              <input
                name={field.name}
                value={field.value}
                onChange={handleChange}
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = 'var(--cp-accent)')}
                onBlur={e => (e.target.style.borderColor = 'var(--cp-border)')}
              />
            </div>
          ))}
        </div>

        <div
          className="flex items-center justify-between mt-2 pt-4"
          style={{ borderTop: '1px solid var(--cp-border)' }}
        >
          <span
            className="text-xs"
            style={{ color: isSuccess ? 'var(--cp-accent)' : 'var(--cp-danger)', opacity: message ? 1 : 0 }}
          >
            {message || '​'}
          </span>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-[8px] text-[11px] font-semibold tracking-[-0.01em] disabled:opacity-50 transition-all"
            style={{
              background: 'var(--cp-accent)',
              color: 'var(--cp-bg)',
            }}
          >
            {loading ? 'Saving...' : 'Save profile'}
          </button>
        </div>
      </form>

      <h2
        className="text-[11px] font-medium tracking-[-0.01em] mb-2 mt-6 flex items-center gap-2"
        style={{ color: 'var(--cp-text-primary)' }}
      >
        <UserIcon size={20} strokeWidth={1.5} style={{ color: 'var(--cp-accent)' }} />
        Security settings
      </h2>
      <form
        onSubmit={handlePassSubmit}
        className="flex flex-col gap-4 mb-6"
        style={{
          background: 'var(--cp-surface)',
          border: '1px solid var(--cp-border)',
          borderRadius: '10px',
          padding: '20px',
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              className="text-[11px] font-medium tracking-[-0.01em]"
              style={{ color: 'var(--cp-text-secondary)' }}
            >
              Current Password
            </label>
            <input
              type="password"
              name="current_password"
              value={passData.current_password}
              onChange={handlePassChange}
              required
              style={inputStyle}
              onFocus={e => (e.target.style.borderColor = 'var(--cp-accent)')}
              onBlur={e => (e.target.style.borderColor = 'var(--cp-border)')}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label
              className="text-[11px] font-medium tracking-[-0.01em]"
              style={{ color: 'var(--cp-text-secondary)' }}
            >
              New Password
            </label>
            <input
              type="password"
              name="new_password"
              value={passData.new_password}
              onChange={handlePassChange}
              required
              style={inputStyle}
              onFocus={e => (e.target.style.borderColor = 'var(--cp-accent)')}
              onBlur={e => (e.target.style.borderColor = 'var(--cp-border)')}
            />
          </div>
        </div>

        <div
          className="flex items-center justify-between mt-2 pt-4"
          style={{ borderTop: '1px solid var(--cp-border)' }}
        >
          <span
            className="text-xs"
            style={{ color: isPassSuccess ? 'var(--cp-accent)' : 'var(--cp-danger)', opacity: passMessage ? 1 : 0 }}
          >
            {passMessage || '​'}
          </span>
          <button
            type="submit"
            disabled={passLoading}
            className="px-4 py-2 rounded-[8px] text-[11px] font-semibold tracking-[-0.01em] disabled:opacity-50 transition-all"
            style={{
              background: 'var(--cp-surface)',
              border: '1px solid var(--cp-accent)',
              color: 'var(--cp-accent)',
            }}
          >
            {passLoading ? 'Saving...' : 'Change password'}
          </button>
        </div>
      </form>

      <h2
        className="text-[11px] font-medium tracking-[-0.01em] mb-2 mt-6 flex items-center gap-2"
        style={{ color: 'var(--cp-danger)' }}
      >
        Danger Zone
      </h2>
      <div
        className="flex flex-col gap-4"
        style={{
          background: 'var(--cp-surface)',
          border: '1px solid var(--cp-danger)',
          borderRadius: '10px',
          padding: '20px',
        }}
      >
        <p className="text-sm" style={{ color: 'var(--cp-text-secondary)' }}>
          Once you delete your account, there is no going back. Please be certain.
        </p>
        <button
          onClick={handleDeleteAccount}
          className="px-4 py-2 rounded-[8px] text-[11px] font-semibold w-max transition-all hover:opacity-80"
          style={{
            background: 'var(--cp-danger)',
            color: '#ffffff',
          }}
        >
          Delete Account
        </button>
      </div>
    </div>
  );
}
