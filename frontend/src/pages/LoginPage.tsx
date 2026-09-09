import React, { useState } from 'react';
import { Logo } from '../components/Logo';
import { PageType, User } from '../types';
import { api } from '../services/api';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, Terminal } from 'lucide-react';

interface LoginPageProps {
  onNavigate: (page: PageType) => void;
  onLoginSuccess: (user: User) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate, onLoginSuccess }) => {
  const [email, setEmail] = useState('alex.rivera@university.edu');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!email || !password) {
      setErrorMessage('Please enter both student email and password.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.login(email, password);
      onLoginSuccess(res.user);
      onNavigate('dashboard');
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoSignIn = async () => {
    setIsLoading(true);
    try {
      const res = await api.login('alex.rivera@university.edu', 'password123');
      onLoginSuccess(res.user);
      onNavigate('dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f8f9ff] flex flex-col justify-center items-center p-4 sm:p-6">
      {/* Container */}
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="flex items-center gap-2.5 mb-3">
            <Logo size={42} />
            <span className="font-bold text-2xl text-[#0b1c30] tracking-tight">Companion</span>
            <span className="px-2 py-0.5 bg-[#e2dfff] text-[#0f0069] rounded-full text-[11px] font-bold tracking-wide">
              BETA
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0b1c30] tracking-tight">
            Welcome back
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Log in to your student study workspace
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_rgba(15,23,42,0.04)] p-6 sm:p-8">
          {errorMessage && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 flex-shrink-0"></span>
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">
                Student Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@university.edu"
                  required
                  className="w-full h-11 pl-10 pr-4 bg-white border border-slate-200 rounded-xl text-sm text-[#0b1c30] placeholder:text-slate-400 focus:outline-none focus:border-[#3525cd] focus:ring-3 focus:ring-[#3525cd]/10 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">
                  Password
                </label>
                <button
                  type="button"
                  className="text-xs font-semibold text-[#3525cd] hover:underline"
                  onClick={() => alert('Password reset is managed via FastAPI backend.')}
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full h-11 pl-10 pr-11 bg-white border border-slate-200 rounded-xl text-sm text-[#0b1c30] placeholder:text-slate-400 focus:outline-none focus:border-[#3525cd] focus:ring-3 focus:ring-[#3525cd]/10 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 rounded border-slate-300 text-[#3525cd] focus:ring-[#3525cd]"
                />
                <span className="text-xs text-slate-600">Remember session token</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-[#3525cd] hover:bg-[#4f46e5] text-white rounded-xl text-sm font-semibold shadow-sm transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-70 cursor-pointer"
            >
              {isLoading ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Demo Login Shortcut */}
          <div className="mt-5 pt-5 border-t border-slate-100">
            <button
              type="button"
              onClick={handleDemoSignIn}
              className="w-full py-2.5 px-3 rounded-xl bg-[#eff4ff] hover:bg-[#dce9ff] text-[#3525cd] text-xs font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#8455ef]" />
              <span>Continue with Demo Student (Alex Rivera)</span>
            </button>
          </div>

          <div className="mt-5 text-center">
            <p className="text-xs text-slate-500">
              Don't have an account?{' '}
              <button
                onClick={() => onNavigate('register')}
                className="font-bold text-[#3525cd] hover:underline"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>

        {/* Backend Spec Tag */}
        <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-slate-400 font-mono">
          <Terminal className="w-3.5 h-3.5" />
          <span>FastAPI: POST /auth/login → Bearer JWT</span>
        </div>
      </div>
    </div>
  );
};
