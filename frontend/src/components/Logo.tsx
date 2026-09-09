import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export const Logo: React.FC<LogoProps> = ({ className = 'h-8 w-8', size = 32 }) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-xl bg-[#4f46e5] text-white shadow-sm flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-4/5 h-4/5"
      >
        {/* Graduation Mortarboard Cap */}
        <path
          d="M50 20L15 36L50 52L85 36L50 20Z"
          fill="white"
        />
        {/* Skull Cap Base */}
        <path
          d="M25 45V60C25 72 75 72 75 60V45L50 56L25 45Z"
          fill="#e0e7ff"
        />
        {/* Tassel Bar and Drop */}
        <rect
          x="77"
          y="38"
          width="5.5"
          height="28"
          rx="2.75"
          fill="#c7d2fe"
        />
        <circle cx="79.75" cy="67" r="4.5" fill="#c7d2fe" />
        {/* Gold Accent Sparkle Star */}
        <path
          d="M75 18C75 24 81 27 86 28C81 29 75 32 75 38C75 32 69 29 64 28C69 27 75 24 75 18Z"
          fill="#f59e0b"
        />
      </svg>
    </div>
  );
};
