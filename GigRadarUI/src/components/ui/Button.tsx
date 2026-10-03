import React from 'react';
import { Loader2 } from 'lucide-react';
import { nativeBridge } from '../../services/bridge';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  className = '',
  icon,
  onClick,
  ...props
}) => {
  const baseStyles = 'relative inline-flex items-center justify-center font-medium transition-all duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 select-none active:scale-[0.98] outline-none';

  const sizeStyles = {
    sm: 'min-h-[38px] px-3.5 py-1.5 text-xs rounded-lg gap-1.5',
    md: 'min-h-[44px] px-5 py-2.5 text-sm rounded-xl gap-2', // Min 44px touch target per spec
    lg: 'min-h-[50px] px-6 py-3 text-base rounded-xl gap-2.5 font-semibold',
  };

  const variantStyles = {
    primary: 'bg-[#b7ff00] text-black hover:bg-[#c6ff24] shadow-[0_0_20px_rgba(183,255,0,0.25)] hover:shadow-[0_0_25px_rgba(183,255,0,0.4)] border border-[#b7ff00]/20 font-bold',
    secondary: 'bg-[#18181b] text-[#fafafa] hover:bg-[#27272a] border border-[#27272a] hover:border-zinc-600',
    outline: 'bg-transparent text-[#fafafa] border border-[#27272a] hover:bg-[#18181b] hover:border-zinc-500',
    ghost: 'bg-transparent text-zinc-400 hover:text-white hover:bg-white/5',
    danger: 'bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 hover:border-red-500/50',
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && !isLoading) {
      nativeBridge.hapticFeedback('light');
      onClick?.(e);
    }
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      onClick={handleClick}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-current" />
          <span>Memproses...</span>
        </>
      ) : (
        <>
          {icon && <span className="shrink-0">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};
