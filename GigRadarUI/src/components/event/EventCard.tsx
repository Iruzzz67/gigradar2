import React from 'react';
import { MapPin, Calendar, Heart } from 'lucide-react';
import { Event } from '../../types';
import { GenreChip } from '../ui/GenreChip';
import { Badge } from '../ui/Badge';
import { useLocation } from '../../context/LocationContext';
import { nativeBridge } from '../../services/bridge';

export interface EventCardProps {
  event: Event;
  onClick: (event: Event) => void;
  onToggleFavorite?: (eventId: number) => void;
  layout?: 'grid' | 'horizontal';
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  onClick,
  onToggleFavorite,
  layout = 'grid',
}) => {
  const { calculateDistanceKm } = useLocation();
  const distance = event.distanceKm ?? calculateDistanceKm(event.latitude, event.longitude);

  const formattedDate = new Date(event.startDate).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Check ticket stock
  const allTickets = event.ticketTypes || [];
  const totalStock = allTickets.reduce((acc, t) => acc + t.stock, 0);
  const isSoldOut = allTickets.length > 0 && totalStock === 0;
  const isLowStock = allTickets.length > 0 && totalStock > 0 && totalStock <= 30;

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    nativeBridge.hapticFeedback('medium');
    onToggleFavorite?.(event.eventId);
  };

  return (
    <div
      onClick={() => onClick(event)}
      className={`group relative bg-[#111113] border border-[#27272a] hover:border-zinc-500/80 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)] cursor-pointer flex ${
        layout === 'horizontal' ? 'flex-row h-36 sm:h-44' : 'flex-col'
      }`}
    >
      {/* Poster Image */}
      <div
        className={`relative overflow-hidden bg-zinc-900 shrink-0 ${
          layout === 'horizontal' ? 'w-32 sm:w-44 h-full' : 'w-full h-48 sm:h-52'
        }`}
      >
        <img
          src={event.posterUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80'}
          alt={event.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111113] via-transparent to-black/30" />

        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-200 cursor-pointer ${
            event.isFavorite
              ? 'bg-red-500/20 text-red-500 border border-red-500/40 shadow-[0_0_10px_rgba(239,68,68,0.3)]'
              : 'bg-black/50 text-white hover:text-red-400 border border-white/10'
          }`}
          title="Save Event"
        >
          <Heart className={`w-4 h-4 ${event.isFavorite ? 'fill-current' : ''}`} />
        </button>

        {/* Stock Badge */}
        <div className="absolute bottom-2.5 left-2.5">
          {isSoldOut ? (
            <Badge variant="danger" size="sm">Sold Out</Badge>
          ) : isLowStock ? (
            <Badge variant="warning" size="sm" pulse>Sisa Sedikit</Badge>
          ) : (
            <Badge variant="lime" size="sm">Available</Badge>
          )}
        </div>
      </div>

      {/* Event Info */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Genre and Distance Pill */}
          <div className="flex items-center justify-between gap-2 mb-2">
            {event.genre && (
              <GenreChip genre={event.genre.name} icon={event.genre.icon} size="sm" />
            )}
            <span className="flex items-center gap-1 text-[11px] font-mono text-zinc-400">
              <MapPin className="w-3 h-3 text-[#b7ff00]" />
              {distance} km
            </span>
          </div>

          {/* Title */}
          <h3 className="font-display font-bold text-base sm:text-lg text-white group-hover:text-[#b7ff00] transition-colors line-clamp-1">
            {event.name}
          </h3>

          {/* Date & Venue */}
          <div className="mt-2 space-y-1 text-xs text-zinc-400">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
              <span className="truncate">{formattedDate}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
              <span className="truncate">{event.venue?.name || 'Venue TBA'}</span>
            </div>
          </div>
        </div>

        {/* Price & CTA strip */}
        <div className="mt-3.5 pt-3 border-t border-[#27272a] flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-mono tracking-wider text-zinc-500">Mulai dari</p>
            <p className="font-display font-bold text-sm text-[#b7ff00]">
              {event.minPrice > 0 ? `IDR ${event.minPrice.toLocaleString('id-ID')}` : 'Gratis'}
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#18181b] border border-[#27272a] group-hover:border-zinc-600 text-zinc-200">
            Detail →
          </span>
        </div>
      </div>
    </div>
  );
};
