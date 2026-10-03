import React, { useState } from 'react';
import { Compass, Flame, Clock, Calendar, Sparkles, MapPin, ArrowRight, Music2 } from 'lucide-react';
import { Event, Artist } from '../../types';
import { EventCard } from '../../components/event/EventCard';
import { ArtistCard } from '../../components/artist/ArtistCard';
import { GenreChip } from '../../components/ui/GenreChip';
import { EmptyState } from '../../components/ui/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import { storage } from '../../services/storage';

export interface DiscoverViewProps {
  events: Event[];
  artists: Artist[];
  onSelectEvent: (event: Event) => void;
  onSelectArtist: (artist: Artist) => void;
  onToggleFavorite: (eventId: number) => void;
  onToggleFollow: (artistId: number) => void;
  onNavigateToRadar: () => void;
  onNavigateToExplore: () => void;
}

export const DiscoverView: React.FC<DiscoverViewProps> = ({
  events,
  artists,
  onSelectEvent,
  onSelectArtist,
  onToggleFavorite,
  onToggleFollow,
  onNavigateToRadar,
  onNavigateToExplore,
}) => {
  const { currentUser } = useAuth();
  const { cityName } = useLocation();

  const [activeFilter, setActiveFilter] = useState<'all' | 'nearby' | 'tonight' | 'weekend' | 'recommended'>('all');
  const [selectedGenreId, setSelectedGenreId] = useState<number | null>(null);

  const genres = storage.getGenres();
  const featuredEvent = events[0];

  // Filtering Logic
  const filteredEvents = events.filter((e) => {
    // Genre filter
    if (selectedGenreId && e.genreId !== selectedGenreId) return false;

    // Filter pill logic
    if (activeFilter === 'nearby') return (e.distanceKm ?? 10) <= 15;
    if (activeFilter === 'recommended') {
      const prefs = currentUser?.preferences || [1, 6];
      return prefs.includes(e.genreId);
    }
    return true;
  });

  return (
    <div className="space-y-8 pb-12 select-none">
      {/* 1. Greeting & Context Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#b7ff00] font-bold">
            Skena Radar • {cityName}
          </span>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-white mt-0.5">
            Halo, {currentUser?.name?.split(' ')[0] || 'Kawan Skena'} 👋
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Ada <strong className="text-white">{events.length} gigs independen</strong> aktif terdeteksi di sekitarmu.
          </p>
        </div>

        {/* Shortcut to Radar CTA */}
        <button
          onClick={onNavigateToRadar}
          className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#18181b] hover:bg-[#222226] border border-[#27272a] hover:border-[#b7ff00]/50 transition-all cursor-pointer group shadow-lg"
        >
          <div className="relative w-9 h-9 rounded-xl bg-[#111113] border border-[#27272a] flex items-center justify-center text-[#b7ff00] group-hover:scale-105 transition-transform">
            <Compass className="w-5 h-5" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#b7ff00] animate-ping" />
          </div>
          <div className="text-left">
            <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 block">Peta Spasial</span>
            <span className="font-display font-bold text-xs text-white group-hover:text-[#b7ff00] transition-colors">
              Buka Radar 3D →
            </span>
          </div>
        </button>
      </div>

      {/* 2. Hero Featured Gig (Section 19) */}
      {featuredEvent && (
        <div
          onClick={() => onSelectEvent(featuredEvent)}
          className="group relative rounded-3xl overflow-hidden bg-zinc-950 border border-[#27272a] hover:border-zinc-600 transition-all duration-300 cursor-pointer shadow-2xl h-80 sm:h-96"
        >
          <img
            src={featuredEvent.posterUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=80'}
            alt={featuredEvent.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/60 to-transparent" />

          {/* Top Floating Badge */}
          <div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#b7ff00] text-black text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_20px_rgba(183,255,0,0.4)]">
              <Flame className="w-3.5 h-3.5" /> GIG OF THE WEEK
            </span>
            {featuredEvent.genre && (
              <GenreChip genre={featuredEvent.genre.name} icon={featuredEvent.genre.icon} size="sm" />
            )}
          </div>

          {/* Bottom Info Content */}
          <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6">
            <div className="max-w-2xl space-y-2">
              <span className="inline-flex items-center gap-1 text-xs font-mono text-[#b7ff00]">
                <MapPin className="w-3.5 h-3.5" /> {featuredEvent.venue?.name} • {featuredEvent.distanceKm || 3.2} km
              </span>
              <h2 className="font-display font-black text-2xl sm:text-4xl text-white group-hover:text-[#b7ff00] transition-colors leading-tight">
                {featuredEvent.name}
              </h2>
              <p className="text-xs sm:text-sm text-zinc-300 line-clamp-2 leading-relaxed">
                {featuredEvent.description}
              </p>

              <div className="pt-2 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase text-zinc-400 block">Tiket Mulai</span>
                  <span className="font-display font-extrabold text-base sm:text-lg text-[#b7ff00]">
                    IDR {featuredEvent.minPrice.toLocaleString('id-ID')}
                  </span>
                </div>
                <span className="px-4 py-2 rounded-xl bg-[#b7ff00] text-black font-bold text-xs shadow-md group-hover:bg-[#c9ff38] transition-colors">
                  Dapatkan Tiket →
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Quick Filter Tabs (Section 19) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-lg text-white">Eksplorasi Feed</h3>
          <button
            onClick={onNavigateToExplore}
            className="text-xs text-[#b7ff00] hover:underline font-medium flex items-center gap-1 cursor-pointer"
          >
            Lihat Semua <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Quick Filter Pills */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 text-xs">
          {[
            { id: 'all', label: 'Semua Gigs', icon: <Compass className="w-3.5 h-3.5" /> },
            { id: 'nearby', label: 'Terdekat (<15km)', icon: <MapPin className="w-3.5 h-3.5" /> },
            { id: 'recommended', label: 'Rekomendasi Selera', icon: <Sparkles className="w-3.5 h-3.5" /> },
            { id: 'tonight', label: 'Malam Ini', icon: <Clock className="w-3.5 h-3.5" /> },
            { id: 'weekend', label: 'Akhir Pekan', icon: <Calendar className="w-3.5 h-3.5" /> },
          ].map((f) => {
            const isActive = activeFilter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id as any)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#b7ff00] text-black font-bold shadow-[0_0_15px_rgba(183,255,0,0.25)]'
                    : 'bg-[#18181b] text-zinc-400 hover:text-white border border-[#27272a]'
                }`}
              >
                {f.icon}
                <span>{f.label}</span>
              </button>
            );
          })}
        </div>

        {/* Genre Tags Horizontal Filter */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pt-1">
          <button
            onClick={() => setSelectedGenreId(null)}
            className={`text-xs px-3 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer border ${
              selectedGenreId === null
                ? 'bg-zinc-800 text-white border-zinc-600'
                : 'bg-zinc-900/60 text-zinc-500 border-zinc-800 hover:text-zinc-300'
            }`}
          >
            Semua Genre
          </button>
          {genres.map((g) => (
            <GenreChip
              key={g.genreId}
              genre={g.name}
              icon={g.icon}
              size="sm"
              isSelected={selectedGenreId === g.genreId}
              onClick={() => setSelectedGenreId(selectedGenreId === g.genreId ? null : g.genreId)}
            />
          ))}
        </div>
      </div>

      {/* 4. Event Grid Feed */}
      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {filteredEvents.map((evt) => (
            <EventCard
              key={evt.eventId}
              event={evt}
              onClick={onSelectEvent}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="Tidak Ada Gig Sesuai Filter"
          description="Coba ubah opsi filter atau pilih genre lain untuk menemukan gigs skena aktif."
          actionLabel="Reset Filter"
          onAction={() => {
            setActiveFilter('all');
            setSelectedGenreId(null);
          }}
        />
      )}

      {/* 5. Artist Discovery Section (Section 19) */}
      <div className="space-y-4 pt-6 border-t border-[#27272a]">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
              <Music2 className="w-5 h-5 text-[#b7ff00]" />
              Band & Musisi Skena
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">Dengarkan trek preview dan ikuti rilisan terbaru mereka</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {artists.slice(0, 6).map((artist) => (
            <ArtistCard
              key={artist.artistId}
              artist={artist}
              onClick={onSelectArtist}
              onToggleFollow={onToggleFollow}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
