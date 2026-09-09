import React, { useState } from 'react';
import { PageType, User } from '../types';
import { Logo } from './Logo';
import { UserAvatar } from './UserAvatar';
import { 
  LayoutDashboard, 
  Files, 
  Sparkles, 
  HelpCircle, 
  MessageSquareCode, 
  LogOut, 
  Sliders, 
  X,
  MoreVertical,
  Check
} from 'lucide-react';

interface SidebarProps {
  currentPage: PageType;
  onNavigate: (page: PageType) => void;
  user: User | null;
  onLogout: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  apiConnected: boolean;
  onToggleApiConfig?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  user,
  onLogout,
  mobileOpen,
  onCloseMobile,
  apiConnected,
  onToggleApiConfig,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems: { id: PageType; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-[18px] h-[18px]" /> },
    { id: 'my-documents', label: 'My Documents', icon: <Files className="w-[18px] h-[18px]" /> },
    { id: 'study-assistant', label: 'Study Assistant', icon: <Sparkles className="w-[18px] h-[18px]" /> },
    { id: 'quiz', label: 'Quiz', icon: <HelpCircle className="w-[18px] h-[18px]" /> },
    { id: 'ask-ai', label: 'Ask AI', icon: <MessageSquareCode className="w-[18px] h-[18px]" /> },
  ];

  const handleNavClick = (page: PageType) => {
    onNavigate(page);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 md:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-200/80 shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-50 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col">
          {/* Header & Logo */}
          <div className="h-16 px-4 flex items-center justify-between border-b border-slate-100">
            <button
              onClick={() => handleNavClick('dashboard')}
              className="flex items-center gap-2.5 text-left group"
            >
              <Logo size={32} />
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-[17px] text-[#0b1c30] tracking-tight group-hover:text-primary transition-colors">
                  Companion
                </span>
                <span className="px-1.5 py-0.5 bg-[#e2dfff] text-[#0f0069] rounded-full text-[10px] font-bold tracking-wide">
                  BETA
                </span>
              </div>
            </button>
            <button
              onClick={onCloseMobile}
              className="md:hidden flex items-center justify-center p-1 text-slate-400 hover:text-slate-600 rounded"
              type="button"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Section Heading */}
          <div className="px-4 pt-4 pb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Workspace
            </span>
          </div>

          {/* Navigation Items */}
          <nav className="flex flex-col gap-0.5 px-2">
            {navItems.map((item) => {
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg transition-all text-[14px] text-left font-medium ${
                    isActive
                      ? 'bg-[#eff4ff] text-[#3525cd] font-semibold relative before:content-[""] before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-[#3525cd] before:rounded-r'
                      : 'text-slate-600 hover:bg-[#eff4ff]/60 hover:text-[#0b1c30]'
                  }`}
                >
                  <span className={isActive ? 'text-[#3525cd]' : 'text-slate-500'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Footer Profile */}
        <div className="p-3 bg-white border-t border-slate-100 relative">
          {/* User Menu Dropdown */}
          {menuOpen && (
            <div className="absolute bottom-16 left-3 right-3 bg-white rounded-xl shadow-lg border border-slate-200/80 p-1.5 z-50 flex flex-col gap-1 animate-in fade-in slide-in-from-bottom-2">
              <div className="px-3 py-1.5 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-800">{user?.fullName || 'Alex Rivera'}</p>
                <p className="text-[11px] text-slate-500">{user?.email || 'alex.rivera@university.edu'}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className={`w-2 h-2 rounded-full ${apiConnected ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                  <span className="text-[10px] font-medium text-slate-500">
                    FastAPI: {apiConnected ? 'Connected' : 'Standalone Mode'}
                  </span>
                </div>
              </div>

              {onToggleApiConfig && (
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onToggleApiConfig();
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-lg text-left w-full transition-colors"
                >
                  <Sliders className="w-3.5 h-3.5 text-slate-400" />
                  <span>FastAPI Endpoint Config</span>
                </button>
              )}

              <button
                onClick={() => {
                  setMenuOpen(false);
                  onLogout();
                }}
                className="flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded-lg text-left w-full transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          )}

          <div className="flex items-center justify-between p-2 rounded-xl bg-[#eff4ff]">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <UserAvatar name={user?.fullName || 'Alex Rivera'} size="md" />
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-[#0b1c30] truncate">
                  {user?.fullName || 'Alex Rivera'}
                </span>
                <span className="text-[11px] text-slate-500 truncate">
                  {user?.classYear ? `${user.major || 'CS'} ${user.classYear}` : "CS '25"}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded transition-colors"
              title="Account Options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
