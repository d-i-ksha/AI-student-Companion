import React from 'react';
import { Menu, Search, UploadCloud, Bell } from 'lucide-react';
import { UserAvatar } from './UserAvatar';
import { Logo } from './Logo';
import { User } from '../types';

interface HeaderProps {
  onOpenMobile: () => void;
  onUploadClick: () => void;
  user: User | null;
  subtitle?: string;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobile,
  onUploadClick,
  user,
  subtitle = 'Overview & Quick Study Actions',
  searchQuery,
  onSearchChange,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 md:left-64 h-16 bg-[#f8f9ff]/90 backdrop-blur-xl border-b border-slate-200/80 shadow-[0_1px_8px_rgba(0,0,0,0.03)] z-40 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobile}
          className="md:hidden p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
          type="button"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 md:hidden">
          <Logo size={28} />
        </div>

        <div className="flex flex-col min-w-0">
          <span className="text-[11px] font-semibold text-slate-500 tracking-wider uppercase">
            Academic Hub
          </span>
          <span className="text-[13px] font-semibold text-[#0b1c30] truncate hidden sm:inline-block">
            {subtitle}
          </span>
        </div>
      </div>

      {/* Center: Search input */}
      <div className="hidden md:flex flex-1 max-w-md mx-2">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search notes, concepts, summaries (Cmd + K)..."
            className="w-full h-9 pl-9 pr-4 bg-white border border-slate-200 rounded-lg text-[13px] text-[#0b1c30] placeholder:text-slate-400 focus:outline-none focus:border-[#3525cd] focus:ring-2 focus:ring-[#3525cd]/10 shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-all"
          />
        </div>
      </div>

      {/* Right: Upload Button & Status */}
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        <button
          type="button"
          onClick={onUploadClick}
          className="flex items-center gap-1.5 h-9 px-3.5 bg-[#3525cd] hover:bg-[#4f46e5] text-white rounded-lg text-xs font-semibold shadow-sm transition-all active:scale-95"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload</span>
        </button>

        {/* AI Ready Indicator */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-600 bg-white px-2.5 py-1 rounded-full border border-slate-200/80 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-semibold text-slate-700 text-[11px]">AI Ready</span>
        </div>

        {/* Notification Bell */}
        <div className="relative p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#8455ef]"></span>
        </div>

        <div className="h-5 w-px bg-slate-200 hidden sm:block"></div>

        {/* User profile button */}
        <div className="flex items-center">
          <UserAvatar name={user?.fullName || 'Alex Rivera'} size="sm" />
        </div>
      </div>
    </header>
  );
};
