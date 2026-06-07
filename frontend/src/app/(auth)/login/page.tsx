'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store/useAppStore';
import { authService } from '@/lib/utils/api';
import { Compass, Mail, Lock, ArrowRight, Eye, EyeOff, LogIn } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAppStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    setError('');

    try {
      const authData = await authService.login(email, password);
      const profile = await authService.getProfile();

      login(authData.access_token, profile);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoAccess = async () => {
    setIsLoading(true);
    setError('');

    try {
      const demoEmail = 'demo@careerpilot.ai';
      const demoPassword = 'demopassword';

      const authData = await authService.login(demoEmail, demoPassword);
      const profile = await authService.getProfile();

      login(authData.access_token, profile);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Demo backend is currently offline. Please run docker services.');
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
          <h1 className="font-display font-bold text-2xl">Welcome Back</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--cp-text-secondary)' }}>Navigate your career with intelligent tools</p>
        </div>

        
        <div 
          className="mb-6 p-4 rounded-2xl border text-center"
          style={{ background: 'var(--cp-surface)', borderColor: 'var(--cp-border-accent)' }}
        >
          <p className="text-[11px] font-medium tracking-[-0.01em] mb-2" style={{ color: 'var(--cp-text-primary)' }}>💡 Express preview</p>
          <p className="text-xs mb-3" style={{ color: 'var(--cp-text-secondary)' }}>
            Explore the dashboard immediately with the fully seeded demo data account.
          </p>
          <button
            type="button"
            onClick={handleDemoAccess}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-bold active:scale-[0.98] transition-all disabled:opacity-50"
            style={{ background: 'var(--cp-text-primary)', color: 'var(--cp-bg)' }}
          >
            <LogIn className="h-3.5 w-3.5" /> Launch Demo Account
          </button>
        </div>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t" style={{ borderColor: 'var(--cp-border)' }}></div>
          <span className="flex-shrink mx-4 text-[11px] font-medium tracking-[-0.01em]" style={{ color: 'var(--cp-text-muted)' }}>Or sign in</span>
          <div className="flex-grow border-t" style={{ borderColor: 'var(--cp-border)' }}></div>
        </div>

        
        {error && (
          <div 
            className="mt-4 p-3.5 rounded-xl text-xs font-semibold"
            style={{ background: 'var(--cp-surface)', color: 'var(--cp-danger)', border: '1px solid var(--cp-danger)' }}
          >
            {error}
          </div>
        )}

        
        <form onSubmit={handleLoginSubmit} className="mt-4 space-y-4">
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
            disabled={isLoading || !email || !password}
            className="w-full mt-6 py-2.5 px-4 flex items-center justify-center gap-2 rounded-xl text-sm font-bold active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: 'var(--cp-accent-dim)', color: 'var(--cp-text-primary)', border: '1px solid var(--cp-border-accent)' }}
          >
            {isLoading ? 'Processing Authentications...' : 'Sign In'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <p className="text-center text-xs mt-6 font-semibold" style={{ color: 'var(--cp-text-muted)' }}>
          Don't have an account?{' '}
          <Link href="/signup" className="hover:underline" style={{ color: 'var(--cp-text-primary)' }}>
            Register Account
          </Link>
        </p>
      </div>
    </main>
  );
}
