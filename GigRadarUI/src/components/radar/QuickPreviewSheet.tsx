import React from 'react';
import { MapPin, Calendar, ArrowRight, X } from 'lucide-react';
import { Event } from '../../types';
import { GenreChip } from '../ui/GenreChip';
import { Button } from '../ui/Button';

export interface QuickPreviewSheetProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
  onViewEvent: (event: Event) => void;
}

export const QuickPreviewSheet: React.FC<QuickPreviewSheetProps> = ({
  event,
  isOpen,
  onClose,
  onViewEvent,
}) => {
  if (!isOpen || !event) return null;

  return (
    <div className="absolute bottom-4 left-4 right-4 z-30 max-w-md mx-auto animate-in slide-in-from-bottom duration-300">
      <div className="bg-[#111113]/95 backdrop-blur-xl border border-[#b7ff00]/40 rounded-2xl p-4 shadow-[0_0_30px_rgba(0,0,0,0.8)] relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-7 h-7 rounded-full bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex gap-3.5">
          <img
            src={event.posterUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80'}
            alt={event.name}
            className="w-20 h-24 rounded-xl object-cover bg-zinc-900 shrink-0 ring-1 ring-zinc-700"
          />

          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-2 mb-1">
              {event.genre && (
                <GenreChip genre={event.genre.name} icon={event.genre.icon} size="sm" />
              )}
              <span className="text-[11px] font-mono text-[#b7ff00] font-bold">
                {event.distanceKm || 'Nearby'}
              </span>
            </div>

            <h4 className="font-display font-bold text-sm text-white truncate">
              {event.name}
            </h4>

            <div className="mt-1 space-y-0.5 text-xs text-zinc-400">
              <div className="flex items-center gap-1 truncate">
                <MapPin className="w-3 h-3 text-zinc-500 shrink-0" />
                <span className="truncate">{event.venue?.name}</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-zinc-400">
                <Calendar className="w-3 h-3 text-zinc-500 shrink-0" />
                <span>{new Date(event.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-mono uppercase text-zinc-400">Mulai dari</p>
            <p className="font-display font-bold text-sm text-[#b7ff00]">
              {event.minPrice > 0 ? `IDR ${event.minPrice.toLocaleString('id-ID')}` : 'Gratis'}
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => onViewEvent(event)}
            icon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            Buka Gig
          </Button>
        </div>
      </div>
    </div>
  );
};
