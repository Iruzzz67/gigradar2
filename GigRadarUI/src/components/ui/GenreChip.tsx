import React from 'react';
import { GENRE_COLORS } from '../../services/mockData';

export interface GenreChipProps {
  genre: string;
  icon?: string;
  isSelected?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const GenreChip: React.FC<GenreChipProps> = ({
  genre,
  icon,
  isSelected = false,
  onClick,
  size = 'md',
  className = '',
}) => {
  const color = GENRE_COLORS[genre] || {
    bg: 'bg-zinc-900',
    text: 'text-zinc-300',
    glow: 'rgba(255,255,255,0.1)',
    hex: '#a1a1aa',
  };

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-1 rounded-full gap-1.5 min-h-[30px]',
    md: 'text-xs px-3.5 py-1.5 rounded-full gap-2 min-h-[36px]',
    lg: 'text-sm px-4 py-2.5 rounded-2xl gap-2.5 min-h-[44px]',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`inline-flex items-center font-medium transition-all duration-200 select-none border ${
        sizeStyles[size]
      } ${
        isSelected
          ? 'bg-[#b7ff00]/15 text-[#b7ff00] border-[#b7ff00] shadow-[0_0_15px_rgba(183,255,0,0.3)] ring-1 ring-[#b7ff00]'
          : `${color.bg} ${color.text} border-zinc-800/80 hover:border-zinc-700 hover:scale-[1.02]`
      } ${onClick ? 'cursor-pointer active:scale-95' : 'cursor-default'} ${className}`}
    >
      {icon && <span className="text-sm shrink-0">{icon}</span>}
      <span className="truncate">{genre}</span>
    </button>
  );
};
