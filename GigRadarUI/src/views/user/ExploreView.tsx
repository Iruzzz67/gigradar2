import React, { useState } from 'react';
import { Search, SlidersHorizontal, MapPin, Building2, Calendar, Radio } from 'lucide-react';
import { Event, Artist, Venue } from '../../types';
import { EventCard } from '../../components/event/EventCard';
import { ArtistCard } from '../../components/artist/ArtistCard';
import { GenreChip } from '../../components/ui/GenreChip';
import { EmptyState } from '../../components/ui/EmptyState';
import { storage } from '../../services/storage';

export interface ExploreViewProps {
  events: Event[];
  artists: Artist[];
  venues: Venue[];
  onSelectEvent: (event: Event) => void;
  onSelectArtist: (artist: Artist) => void;
  onToggleFavorite: (eventId: number) => void;
  onToggleFollow: (artistId: number) => void;
}

export const ExploreView: React.FC<ExploreViewProps> = ({
  events,
  artists,
  venues,
  onSelectEvent,
  onSelectArtist,
  onToggleFavorite,
  onToggleFollow,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'events' | 'artists' | 'venues'>('events');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [maxDistance, setMaxDistance] = useState<number>(50);

  const genres = storage.getGenres();

  // Filtered Events
  const filteredEvents = events.filter((e) => {
    const matchSearch =
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.venue?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.genre?.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchGenre = !selectedGenre || e.genre?.name === selectedGenre;
    const matchDist = (e.distanceKm ?? 10) <= maxDistance;
    return matchSearch && matchGenre && matchDist;
  });

  // Filtered Artists
  const filteredArtists = artists.filter((a) => {
    const matchSearch =
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchGenre = !selectedGenre || a.genre.toLowerCase() === selectedGenre.toLowerCase();
    return matchSearch && matchGenre;
  });

  // Filtered Venues
  const filteredVenues = venues.filter((v) => {
    return (
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.address.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* Header */}
      <div>
        <h1 className="font-display font-black text-2xl sm:text-3xl text-white">
          Eksplorasi Skena Musik
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          Cari berdasarkan nama band, venue pertunjukan, atau genre underground favoritmu.
        </p>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-3.5 w-5 h-5 text-zinc-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari gigs, band, shoegaze, venue Bentara Budaya..."
          className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-[#111113] border border-[#27272a] focus:border-[#b7ff00] text-sm text-white outline-none shadow-lg"
        />
      </div>

      {/* Category Tabs: Events, Artists, Venues (Section 21) */}
      <div className="flex gap-2 p-1.5 rounded-2xl bg-[#111113] border border-[#27272a] text-xs font-semibold">
        {[
          { id: 'events', label: `Gigs (${filteredEvents.length})`, icon: <Calendar className="w-4 h-4" /> },
          { id: 'artists', label: `Band & Musisi (${filteredArtists.length})`, icon: <Radio className="w-4 h-4" /> },
          { id: 'venues', label: `Venue Skena (${filteredVenues.length})`, icon: <Building2 className="w-4 h-4" /> },
        ].map((tab) => {
          const isActive = activeCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id as any)}
              className={`flex-1 py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                isActive
                  ? 'bg-[#18181b] text-[#b7ff00] border border-zinc-700 font-bold shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Filters Strip (Genre & Distance) */}
      {activeCategory !== 'venues' && (
        <div className="p-4 rounded-2xl bg-[#111113] border border-[#27272a] space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-zinc-300 flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#b7ff00]" />
              Filter Radius Jarak: <strong className="text-white">{maxDistance} km</strong>
            </span>
            {selectedGenre && (
              <button
                onClick={() => setSelectedGenre(null)}
                className="text-[#b7ff00] hover:underline cursor-pointer"
              >
                Reset Genre
              </button>
            )}
          </div>

          <input
            type="range"
            min="5"
            max="100"
            step="5"
            value={maxDistance}
            onChange={(e) => setMaxDistance(Number(e.target.value))}
            className="w-full accent-[#b7ff00] cursor-pointer"
          />

          {/* Genre Chips */}
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar pt-1">
            {genres.map((g) => (
              <GenreChip
                key={g.genreId}
                genre={g.name}
                icon={g.icon}
                size="sm"
                isSelected={selectedGenre === g.name}
                onClick={() => setSelectedGenre(selectedGenre === g.name ? null : g.name)}
              />
            ))}
          </div>
        </div>
      )}

      {/* CATEGORY: EVENTS */}
      {activeCategory === 'events' && (
        <div>
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
              title="Tidak Menemukan Gig"
              description="Tidak ada gig yang cocok dengan kata kunci atau parameter filter pencarianmu."
              actionLabel="Reset Pencarian"
              onAction={() => {
                setSearchQuery('');
                setSelectedGenre(null);
                setMaxDistance(100);
              }}
            />
          )}
        </div>
      )}

      {/* CATEGORY: ARTISTS */}
      {activeCategory === 'artists' && (
        <div>
          {filteredArtists.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredArtists.map((artist) => (
                <ArtistCard
                  key={artist.artistId}
                  artist={artist}
                  onClick={onSelectArtist}
                  onToggleFollow={onToggleFollow}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="Tidak Menemukan Band"
              description="Band atau musisi yang kamu cari belum terdaftar di direktori."
              actionLabel="Reset Pencarian"
              onAction={() => setSearchQuery('')}
            />
          )}
        </div>
      )}

      {/* CATEGORY: VENUES */}
      {activeCategory === 'venues' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredVenues.map((venue) => (
            <div
              key={venue.venueId}
              className="p-4 rounded-2xl bg-[#111113] border border-[#27272a] hover:border-zinc-600 transition-colors flex gap-4 items-center"
            >
              <img
                src={venue.photoUrl}
                alt={venue.name}
                className="w-20 h-20 rounded-xl object-cover bg-zinc-800 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-mono text-[#b7ff00] uppercase font-bold">Venue Mitra</span>
                <h4 className="font-display font-bold text-base text-white truncate mt-0.5">{venue.name}</h4>
                <p className="text-xs text-zinc-400 mt-1 line-clamp-1">{venue.address}</p>
                <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono mt-1">
                  <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{venue.city} • Kapasitas: {venue.capacity}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
