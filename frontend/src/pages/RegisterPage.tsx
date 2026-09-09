import React, { useState } from 'react';
import { Logo } from '../components/Logo';
import { PageType, User } from '../types';
import { api } from '../services/api';
import { Mail, Lock, User as UserIcon, ArrowRight, Sparkles, Terminal, CheckCircle2 } from 'lucide-react';

interface RegisterPageProps {
  onNavigate: (page: PageType) => void;
  onRegisterSuccess: (user: User) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({
  onNavigate,
  onRegisterSuccess,
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!fullName || !email || !password) {
      setErrorMessage('All fields are required.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.register(fullName, email, password);
      if (res.user) {
        onRegisterSuccess(res.user);
      }

      onNavigate('login');
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f8f9ff] flex flex-col justify-center items-center p-4 sm:p-6">
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
            Create Student Account
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Synthesize lecture notes, generate quizzes, and study with AI
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
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  required
                  className="w-full h-11 pl-10 pr-4 bg-white border border-slate-200 rounded-xl text-sm text-[#0b1c30] placeholder:text-slate-400 focus:outline-none focus:border-[#3525cd] focus:ring-3 focus:ring-[#3525cd]/10 transition-all"
                />
              </div>
            </div>

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
                  placeholder="name@university.edu"
                  required
                  className="w-full h-11 pl-10 pr-4 bg-white border border-slate-200 rounded-xl text-sm text-[#0b1c30] placeholder:text-slate-400 focus:outline-none focus:border-[#3525cd] focus:ring-3 focus:ring-[#3525cd]/10 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  required
                  className="w-full h-11 pl-10 pr-4 bg-white border border-slate-200 rounded-xl text-sm text-[#0b1c30] placeholder:text-slate-400 focus:outline-none focus:border-[#3525cd] focus:ring-3 focus:ring-[#3525cd]/10 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  required
                  className="w-full h-11 pl-10 pr-4 bg-white border border-slate-200 rounded-xl text-sm text-[#0b1c30] placeholder:text-slate-400 focus:outline-none focus:border-[#3525cd] focus:ring-3 focus:ring-[#3525cd]/10 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-[#3525cd] hover:bg-[#4f46e5] text-white rounded-xl text-sm font-semibold shadow-sm transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-70 cursor-pointer mt-2"
            >
              {isLoading ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-5 text-center">
            <p className="text-xs text-slate-500">
              Already have an account?{' '}
              <button
                onClick={() => onNavigate('login')}
                className="font-bold text-[#3525cd] hover:underline"
              >
                Log in
              </button>
            </p>
          </div>
        </div>

        {/* Backend Spec Tag */}
        <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-slate-400 font-mono">
          <Terminal className="w-3.5 h-3.5" />
          <span>FastAPI: POST /auth/register → returns User + JWT</span>
        </div>
      </div>
    </div>
  );
};
