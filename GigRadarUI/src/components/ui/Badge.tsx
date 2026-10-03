import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'lime' | 'zinc' | 'danger' | 'warning' | 'purple' | 'cyan' | 'success';
  size?: 'sm' | 'md';
  pulse?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'lime',
  size = 'md',
  pulse = false,
  className = '',
}) => {
  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 rounded-md gap-1',
    md: 'text-xs px-2.5 py-1 rounded-lg gap-1.5',
  };

  const variantStyles = {
    lime: 'bg-[#b7ff00]/15 text-[#b7ff00] border border-[#b7ff00]/30',
    zinc: 'bg-[#18181b] text-zinc-300 border border-[#27272a]',
    danger: 'bg-red-500/15 text-red-400 border border-red-500/30',
    warning: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
    success: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    purple: 'bg-purple-500/15 text-purple-400 border border-purple-500/30',
    cyan: 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30',
  };

  return (
    <span className={`inline-flex items-center font-medium tracking-wide uppercase select-none ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}>
      {pulse && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-current"></span>
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-current"></span>
        </span>
      )}
      {children}
    </span>
  );
};
