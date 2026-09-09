import React from 'react';
import { SlidersHorizontal } from 'lucide-react';

export interface StateOption {
  id: string;
  label: string;
}

interface StateSwitcherProps {
  activeState: string;
  options: StateOption[];
  onSelectState: (state: string) => void;
}

export const StateSwitcher: React.FC<StateSwitcherProps> = ({
  activeState,
  options,
  onSelectState,
}) => {
  return (
    <div className="w-full bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
      <div className="flex items-center gap-2 flex-shrink-0">
        <SlidersHorizontal className="w-4 h-4 text-[#3525cd]" />
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Preview State:
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
        {options.map((opt) => {
          const isActive = activeState === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onSelectState(opt.id)}
              className={`px-3 py-1 rounded-full text-xs transition-all font-medium ${
                isActive
                  ? 'bg-[#3525cd] text-white font-semibold shadow-xs'
                  : 'bg-[#eff4ff] text-slate-600 hover:text-[#0b1c30] hover:bg-slate-200/60'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
