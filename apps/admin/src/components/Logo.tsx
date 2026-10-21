import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark';
  subtitle?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  variant = 'light',
  subtitle = 'Admin Console',
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
  };

  const isLight = variant === 'light';

  return (
    <div className="flex items-center gap-2.5">
      {/* Visual Bag Emblem */}
      <div className={`${iconSizes[size]} shrink-0`}>
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="ab_admin_grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>
            <linearGradient id="ab_admin_gold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FBBF24" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
          </defs>
          <rect x="14" y="26" width="72" height="64" rx="18" fill="url(#ab_admin_grad)" />
          <path d="M34 30 V20 C34 11.16 41.16 4 50 4 C58.84 4 66 11.16 66 20 V30" stroke="#047857" strokeWidth="8" strokeLinecap="round" />
          <path d="M34 28 V20 C34 12.27 41.16 6 50 6 C58.84 6 66 12.27 66 20 V28" stroke="#34D399" strokeWidth="6" strokeLinecap="round" />
          <path d="M32 58 L44 70 L68 44" stroke="#FFFFFF" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M74 15 L76.5 21.5 L83 24 L76.5 26.5 L74 33 L71.5 26.5 L65 24 L71.5 21.5 Z" fill="url(#ab_admin_gold)" />
        </svg>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col">
        <span className={`font-black ${textSizes[size]} tracking-tight leading-none ${isLight ? 'text-white' : 'text-gray-900'}`}>
          apna<span className="text-emerald-400">buy</span>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 ml-0.5 align-top" />
        </span>
        {subtitle && (
          <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider mt-0.5">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
};

