import React, { useState } from 'react';
import { User, Heart, Users, Sliders, LogOut, Shield, MapPin, Check, Info } from 'lucide-react';
import { Event, Artist } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { GenreChip } from '../../components/ui/GenreChip';
import { useAuth } from '../../context/AuthContext';
import { storage } from '../../services/storage';

export interface ProfileViewProps {
  events: Event[];
  artists: Artist[];
  onSelectEvent: (event: Event) => void;
  onSelectArtist: (artist: Artist) => void;
  onLogout: () => void;
  onRequestRoleUpgrade?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  events,
  artists,
  onSelectEvent,
  onSelectArtist,
  onLogout,
  onRequestRoleUpgrade,
}) => {
  const { currentUser, role, updatePreferences } = useAuth();
  const genres = storage.getGenres();

  const [activeTab, setActiveTab] = useState<'favorites' | 'following' | 'preferences' | 'settings'>('favorites');
  const [selectedGenreIds, setSelectedGenreIds] = useState<number[]>(currentUser?.preferences || [1, 6]);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const favoriteEvents = events.filter((e) => e.isFavorite);
  const followedArtists = artists.filter((a) => a.isFollowed);

  const handleToggleGenrePref = (genreId: number) => {
    const updated = selectedGenreIds.includes(genreId)
      ? selectedGenreIds.filter((id) => id !== genreId)
      : [...selectedGenreIds, genreId];
    setSelectedGenreIds(updated);
    updatePreferences(updated);
  };

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* Profile Card Header */}
      <div className="p-6 rounded-3xl bg-[#111113] border border-[#27272a] shadow-xl flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
        <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-zinc-800 ring-2 ring-[#b7ff00] shadow-lg shrink-0">
          <img
            src={
              currentUser?.photoUrl ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
            }
            alt="Avatar"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h2 className="font-display font-extrabold text-2xl text-white">
              {currentUser?.name || 'Skena User'}
            </h2>
            <Badge variant="lime" size="sm">
              Role: {role}
            </Badge>
            {currentUser?.roleStatus === 'Pending' && (
              <Badge variant="warning" size="sm">
                Permohonan Pending
              </Badge>
            )}
          </div>

          <p className="text-xs text-zinc-400 mt-1">{currentUser?.email}</p>
          <p className="text-xs text-zinc-500 flex items-center justify-center sm:justify-start gap-1 mt-1 font-mono">
            <MapPin className="w-3.5 h-3.5 text-[#b7ff00]" />
            {currentUser?.city || 'Jakarta'} • Bergabung sejak 2026
          </p>
        </div>

        <div className="flex gap-2">
          {role === 'User' && onRequestRoleUpgrade && (
            <Button variant="outline" size="sm" onClick={onRequestRoleUpgrade}>
              Ajukan Akun Artist/EO
            </Button>
          )}
          <Button variant="danger" size="sm" onClick={onLogout} icon={<LogOut className="w-3.5 h-3.5" />}>
            Keluar
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#27272a] pb-2 text-xs overflow-x-auto no-scrollbar">
        {[
          { id: 'favorites', label: `Gigs Tersimpan (${favoriteEvents.length})`, icon: <Heart className="w-3.5 h-3.5" /> },
          { id: 'following', label: `Band Diikuti (${followedArtists.length})`, icon: <Users className="w-3.5 h-3.5" /> },
          { id: 'preferences', label: 'Preferensi Musik', icon: <Sliders className="w-3.5 h-3.5" /> },
          { id: 'settings', label: 'Pengaturan & Info', icon: <Info className="w-3.5 h-3.5" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-medium whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === tab.id
                ? 'bg-[#18181b] text-[#b7ff00] font-bold border border-zinc-700 shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB: FAVORITES */}
      {activeTab === 'favorites' && (
        <div>
          {favoriteEvents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {favoriteEvents.map((evt) => (
                <div
                  key={evt.eventId}
                  onClick={() => onSelectEvent(evt)}
                  className="p-3.5 rounded-2xl bg-[#111113] border border-[#27272a] hover:border-zinc-600 transition-colors flex gap-3.5 items-center cursor-pointer"
                >
                  <img
                    src={evt.posterUrl}
                    alt={evt.name}
                    className="w-16 h-20 rounded-xl object-cover bg-zinc-800 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-mono text-[#b7ff00] font-bold">{evt.genre?.name}</span>
                    <h4 className="font-display font-bold text-sm text-white truncate">{evt.name}</h4>
                    <p className="text-xs text-zinc-400 truncate mt-0.5">{evt.venue?.name}</p>
                    <span className="text-xs font-bold text-[#b7ff00] block mt-1">
                      IDR {evt.minPrice.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-zinc-500 py-8 text-center bg-[#111113] rounded-2xl border border-[#27272a]">
              Belum ada gig yang kamu simpan ke favorit.
            </p>
          )}
        </div>
      )}

      {/* TAB: FOLLOWING */}
      {activeTab === 'following' && (
        <div>
          {followedArtists.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {followedArtists.map((artist) => (
                <div
                  key={artist.artistId}
                  onClick={() => onSelectArtist(artist)}
                  className="p-3.5 rounded-2xl bg-[#111113] border border-[#27272a] hover:border-zinc-600 transition-colors flex gap-3 items-center cursor-pointer"
                >
                  <img
                    src={artist.photoUrl}
                    alt={artist.name}
                    className="w-12 h-12 rounded-full object-cover bg-zinc-800 ring-1 ring-zinc-700 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-sm text-white truncate">{artist.name}</h4>
                    <p className="text-xs text-zinc-400">{artist.genre} • {artist.city}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-zinc-500 py-8 text-center bg-[#111113] rounded-2xl border border-[#27272a]">
              Kamu belum mengikuti band mana pun.
            </p>
          )}
        </div>
      )}

      {/* TAB: PREFERENCES */}
      {activeTab === 'preferences' && (
        <div className="p-6 rounded-3xl bg-[#111113] border border-[#27272a] space-y-4">
          <div>
            <h3 className="font-display font-bold text-base text-white">Preferensi Genre Rekomendasi</h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Pilih genre yang ingin kamu utamakan di radar dan halaman penemuan gigs.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {genres.map((g) => {
              const isSelected = selectedGenreIds.includes(g.genreId);
              return (
                <button
                  key={g.genreId}
                  onClick={() => handleToggleGenrePref(g.genreId)}
                  className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#18181b] border-[#b7ff00] text-[#b7ff00] ring-1 ring-[#b7ff00]'
                      : 'bg-[#18181b]/40 border-[#27272a] text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <span>{g.icon} {g.name}</span>
                  {isSelected && <Check className="w-3.5 h-3.5" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB: SETTINGS (Section 46) */}
      {activeTab === 'settings' && (
        <div className="p-6 rounded-3xl bg-[#111113] border border-[#27272a] space-y-4 text-xs">
          <h3 className="font-display font-bold text-base text-white">Pengaturan Tampilan & Perangkat</h3>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#18181b] border border-[#27272a]">
              <div>
                <p className="font-bold text-white">Reduced Motion (Hemat Baterai)</p>
                <p className="text-[11px] text-zinc-400">Nonaktifkan animasi Three.js radar otomatis pada perangkat rendah</p>
              </div>
              <input
                type="checkbox"
                checked={reducedMotion}
                onChange={(e) => setReducedMotion(e.target.checked)}
                className="w-4 h-4 accent-[#b7ff00] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#18181b] border border-[#27272a]">
              <div>
                <p className="font-bold text-white">Notifikasi Gigs Terdekat</p>
                <p className="text-[11px] text-zinc-400">Peringatan saat ada pertunjukan musik baru dalam radius 15km</p>
              </div>
              <input
                type="checkbox"
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
                className="w-4 h-4 accent-[#b7ff00] cursor-pointer"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-800 text-[11px] text-zinc-500 space-y-1">
            <p>GigRadar UI Layer v2.0 • React + Three.js + .NET MAUI Host</p>
            <p>Arsitektur Berkelanjutan Kompatibel ASP.NET Core Web API 8 + SQLite</p>
          </div>
        </div>
      )}
    </div>
  );
};
