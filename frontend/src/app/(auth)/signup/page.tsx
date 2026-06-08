'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store/useAppStore';
import { authService } from '@/lib/utils/api';
import { Compass, Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const { login, isAuthenticated, hasHydrated } = useAppStore();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (hasHydrated && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [hasHydrated, isAuthenticated, router]);

  // Show nothing while hydrating to prevent flash
  if (!hasHydrated) return null;

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) return;

    setIsLoading(true);
    setError('');

    try {
      const authData = await authService.signup(email, password, fullName);
      const profile = await authService.getProfile();

      login(authData.access_token, profile);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to register account. User may already exist.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main 
      className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden"
      style={{ background: 'var(--cp-bg)', color: 'var(--cp-text-primary)' }}
    >
      
      <div 
        className="w-full max-w-md p-8 rounded-3xl border relative z-10"
        style={{ background: 'var(--cp-card)', borderColor: 'var(--cp-border)' }}
      >
        
        <div className="flex flex-col items-center mb-8">
          <div 
            className="flex h-12 w-12 items-center justify-center rounded-2xl mb-3"
            style={{ background: 'var(--cp-text-primary)', color: 'var(--cp-bg)' }}
          >
            <Compass className="h-6 w-6" />
          </div>
          <h1 className="font-display font-bold text-2xl">Create Account</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--cp-text-secondary)' }}>Get started with CareerPilot today</p>
        </div>

        
        {error && (
          <div 
            className="p-3.5 rounded-xl text-xs font-semibold mb-4"
            style={{ background: 'var(--cp-surface)', color: 'var(--cp-danger)', border: '1px solid var(--cp-danger)' }}
          >
            {error}
          </div>
        )}

        
        <form onSubmit={handleSignupSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-medium tracking-[-0.01em] mb-1.5" style={{ color: 'var(--cp-text-secondary)' }}>
              Full Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center" style={{ color: 'var(--cp-text-muted)' }}>
                <User className="h-4 w-4" />
              </span>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="Devin Pilot"
                className="w-full rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none transition-colors"
                style={{ background: 'var(--cp-bg)', border: '1px solid var(--cp-border)', color: 'var(--cp-text-primary)' }}
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium tracking-[-0.01em] mb-1.5" style={{ color: 'var(--cp-text-secondary)' }}>
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center" style={{ color: 'var(--cp-text-muted)' }}>
                <Mail className="h-4 w-4" />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none transition-colors"
                style={{ background: 'var(--cp-bg)', border: '1px solid var(--cp-border)', color: 'var(--cp-text-primary)' }}
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium tracking-[-0.01em] mb-1.5" style={{ color: 'var(--cp-text-secondary)' }}>
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center" style={{ color: 'var(--cp-text-muted)' }}>
                <Lock className="h-4 w-4" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full rounded-xl py-2.5 pl-10 pr-10 text-sm focus:outline-none transition-colors"
                style={{ background: 'var(--cp-bg)', border: '1px solid var(--cp-border)', color: 'var(--cp-text-primary)' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                style={{ color: 'var(--cp-text-muted)' }}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !fullName || !email || !password}
            className="w-full mt-6 py-2.5 px-4 flex items-center justify-center gap-2 rounded-xl text-sm font-bold active:scale-[0.98] transition-all disabled:opacity-50"
            style={{ background: 'var(--cp-text-primary)', color: 'var(--cp-bg)' }}
          >
            {isLoading ? 'Creating Account...' : 'Sign Up'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <p className="text-center text-xs mt-6 font-semibold" style={{ color: 'var(--cp-text-muted)' }}>
          Already have an account?{' '}
          <Link href="/login" className="hover:underline" style={{ color: 'var(--cp-text-primary)' }}>
            Sign In
          </Link>
        </p>
      </div>
    </main>
  );
}
