import React from 'react';
import { Calendar, MapPin, Share2, Heart, Users, Ticket, ExternalLink, ShieldCheck } from 'lucide-react';
import { Event, Artist } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { GenreChip } from '../ui/GenreChip';
import { Badge } from '../ui/Badge';
import { nativeBridge } from '../../services/bridge';
import { useLocation } from '../../context/LocationContext';

export interface EventDetailModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectArtist?: (artist: Artist) => void;
  onToggleFavorite?: (eventId: number) => void;
  onOpenCheckout?: (event: Event) => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  event,
  isOpen,
  onClose,
  onSelectArtist,
  onToggleFavorite,
  onOpenCheckout,
}) => {
  const { calculateDistanceKm } = useLocation();

  if (!event) return null;

  const distance = event.distanceKm ?? calculateDistanceKm(event.latitude, event.longitude);

  const formattedStartDate = new Date(event.startDate).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const formattedStartTime = new Date(event.startDate).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleShare = () => {
    nativeBridge.shareEvent({
      name: event.name,
      description: event.description,
    });
  };

  const handleTicketClick = () => {
    if (event.ticketLink) {
      nativeBridge.openExternal(event.ticketLink);
    } else {
      onOpenCheckout?.(event);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="xl" showCloseButton={true}>
      <div className="space-y-6 -m-2 sm:-m-0">
        {/* Hero Poster */}
        <div className="relative h-64 sm:h-80 -mx-6 -mt-6 rounded-t-2xl overflow-hidden bg-zinc-900">
          <img
            src={event.posterUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80'}
            alt={event.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111113] via-[#111113]/40 to-black/60" />

          {/* Top Actions Floating */}
          <div className="absolute top-4 left-4 flex gap-2">
            {event.genre && (
              <GenreChip genre={event.genre.name} icon={event.genre.icon} size="md" />
            )}
          </div>

          <div className="absolute top-4 right-14 flex gap-2">
            <button
              onClick={() => onToggleFavorite?.(event.eventId)}
              className={`w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md transition-all cursor-pointer ${
                event.isFavorite
                  ? 'bg-red-500/20 text-red-500 border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                  : 'bg-black/60 text-white border border-white/20 hover:text-red-400'
              }`}
            >
              <Heart className={`w-4 h-4 ${event.isFavorite ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={handleShare}
              className="w-9 h-9 rounded-full bg-black/60 text-white border border-white/20 hover:bg-black/80 flex items-center justify-center backdrop-blur-md transition-all cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          {/* Title on Poster */}
          <div className="absolute bottom-4 left-6 right-6">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#b7ff00]/20 text-[#b7ff00] text-xs font-mono font-bold tracking-wider uppercase mb-2 border border-[#b7ff00]/40">
              <MapPin className="w-3 h-3" />
              {distance} km dari lokasimu
            </span>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white leading-tight">
              {event.name}
            </h1>
          </div>
        </div>

        {/* Date, Time & Venue Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-[#18181b] border border-[#27272a]">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#111113] border border-[#27272a] flex items-center justify-center text-[#b7ff00] shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-zinc-400">Waktu & Tanggal</p>
              <p className="text-sm font-semibold text-white mt-0.5">{formattedStartDate}</p>
              <p className="text-xs font-mono text-zinc-400">{formattedStartTime} WIB</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#111113] border border-[#27272a] flex items-center justify-center text-[#b7ff00] shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-zinc-400">Lokasi Venue</p>
              <p className="text-sm font-semibold text-white mt-0.5">{event.venue?.name}</p>
              <p className="text-xs text-zinc-400 line-clamp-1">{event.venue?.address || event.venue?.city}</p>
            </div>
          </div>
        </div>

        {/* Lineup / Performers */}
        {event.artists && event.artists.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-[#b7ff00]" />
                Lineup Penampil
              </h3>
              <span className="text-xs text-zinc-500 font-mono">{event.artists.length} Band</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {event.artists.map((artist) => (
                <div
                  key={artist.artistId}
                  onClick={() => onSelectArtist?.(artist)}
                  className="p-3 rounded-xl bg-[#18181b] hover:bg-[#222226] border border-[#27272a] hover:border-zinc-600 transition-all cursor-pointer flex items-center gap-2.5 group"
                >
                  <img
                    src={artist.photoUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&auto=format&fit=crop&q=80'}
                    alt={artist.name}
                    className="w-10 h-10 rounded-lg object-cover ring-1 ring-zinc-700 group-hover:ring-[#b7ff00] transition-all"
                  />
                  <div className="truncate">
                    <p className="text-xs font-bold text-white group-hover:text-[#b7ff00] transition-colors truncate">
                      {artist.name}
                    </p>
                    <p className="text-[10px] text-zinc-400 truncate">{artist.genre}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        <div className="space-y-2">
          <h3 className="font-display font-bold text-base text-white">Tentang Acara</h3>
          <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line bg-[#111113] p-4 rounded-xl border border-[#27272a]">
            {event.description}
          </p>
        </div>

        {/* Ticket Tier Overview */}
        {event.ticketTypes && event.ticketTypes.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
              <Ticket className="w-4 h-4 text-[#b7ff00]" />
              Kategori Tiket
            </h3>
            <div className="space-y-2">
              {event.ticketTypes.map((tier) => (
                <div
                  key={tier.eventTicketTypeId}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-[#18181b] border border-[#27272a]"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm text-white">{tier.name}</p>
                      {tier.stock === 0 ? (
                        <Badge variant="danger" size="sm">Habis</Badge>
                      ) : tier.stock <= 20 ? (
                        <Badge variant="warning" size="sm">Sisa {tier.stock}</Badge>
                      ) : (
                        <Badge variant="lime" size="sm">Tersedia</Badge>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5">{tier.description}</p>
                  </div>
                  <p className="font-display font-bold text-base text-[#b7ff00]">
                    IDR {tier.price.toLocaleString('id-ID')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Organizer Verification */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-[#111113] border border-[#27272a] text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Diselenggarakan oleh <strong className="text-white">{event.organizer?.name || 'Koloni Gigs'}</strong></span>
          </div>
          <span className="font-mono text-[10px] text-zinc-500 uppercase">Verified EO</span>
        </div>

        {/* Action Button Bottom Bar */}
        <div className="pt-2">
          <Button
            variant="primary"
            size="lg"
            className="w-full text-base"
            onClick={handleTicketClick}
            icon={event.ticketLink ? <ExternalLink className="w-5 h-5" /> : <Ticket className="w-5 h-5" />}
          >
            {event.ticketLink ? 'Beli via Link Eksternal' : 'Pilih Tiket & Checkout'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
