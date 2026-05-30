'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { authService } from '@/services/auth';
import { Compass, Mail, Lock, ArrowRight, Eye, EyeOff, LogIn } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
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
      
      useAuthStore.setState({ token: authData.access_token });
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
      
      useAuthStore.setState({ token: authData.access_token });
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
    <main className="min-h-screen flex items-center justify-center bg-[#070a13] px-4 py-12 relative overflow-hidden">
      {/* Decorative Glowing Gradients */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-sky-500/10 blur-[100px] animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[350px] h-[350px] rounded-full bg-indigo-500/10 blur-[100px] animate-pulse-glow" />

      {/* Main card box */}
      <div className="w-full max-w-md glass-panel p-8 rounded-3xl border border-slate-800 shadow-2xl relative z-10">
        
        {/* Brand Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-lg shadow-sky-500/30 mb-3">
            <Compass className="h-6 w-6" />
          </div>
          <h1 className="font-display font-bold text-2xl text-white">Welcome Back</h1>
          <p className="text-slate-400 text-sm mt-1">Navigate your career with intelligent tools</p>
        </div>

        {/* Demo Highlight Banner */}
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-sky-500/10 to-indigo-500/10 border border-sky-500/20 text-center">
          <p className="text-xs font-semibold text-sky-400 mb-2 uppercase tracking-wide">💡 Express Hackathon Preview</p>
          <p className="text-slate-300 text-xs mb-3">
            Explore the dashboard immediately with the fully seeded demo data account.
          </p>
          <button
            type="button"
            onClick={handleDemoAccess}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-600 hover:to-indigo-600 shadow-md shadow-sky-500/25 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            <LogIn className="h-3.5 w-3.5" /> Launch Demo Account
          </button>
        </div>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-slate-800"></div>
          <span className="flex-shrink mx-4 text-xs font-semibold text-slate-500 uppercase">Or Sign In</span>
          <div className="flex-grow border-t border-slate-800"></div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mt-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLoginSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <Mail className="h-4 w-4" />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-2.5 pl-10 pr-10 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !email || !password}
            className="w-full mt-6 py-2.5 px-4 flex items-center justify-center gap-2 rounded-xl text-sm font-bold text-white bg-slate-800 hover:bg-slate-750 active:scale-[0.98] border border-slate-700 hover:border-slate-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Processing Authentications...' : 'Sign In'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-6 font-semibold">
          Don't have an account?{' '}
          <Link href="/signup" className="text-sky-400 hover:underline">
            Register Account
          </Link>
        </p>
      </div>
    </main>
  );
}
