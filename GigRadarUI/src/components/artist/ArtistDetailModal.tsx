import React, { useState } from 'react';
import { Users, Music, Disc, Newspaper, Milestone, UserCheck, Calendar } from 'lucide-react';
import { Artist, Event } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { AudioPlayer } from './AudioPlayer';
import { nativeBridge } from '../../services/bridge';

export interface ArtistDetailModalProps {
  artist: Artist | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleFollow?: (artistId: number) => void;
  onSelectEvent?: (event: Event) => void;
  allEvents?: Event[];
}

export const ArtistDetailModal: React.FC<ArtistDetailModalProps> = ({
  artist,
  isOpen,
  onClose,
  onToggleFollow,
  onSelectEvent,
  allEvents = [],
}) => {
  const [activeTab, setActiveTab] = useState<'about' | 'music' | 'albums' | 'posts' | 'journey' | 'members'>('music');

  if (!artist) return null;

  const upcomingEvents = allEvents.filter(e =>
    e.artists?.some(a => a.artistId === artist.artistId)
  );

  const handleFollow = () => {
    nativeBridge.hapticFeedback('medium');
    onToggleFollow?.(artist.artistId);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="xl" showCloseButton={true}>
      <div className="space-y-6 -m-2 sm:-m-0">
        {/* Cover & Avatar Hero */}
        <div className="relative h-48 sm:h-60 -mx-6 -mt-6 bg-zinc-900 overflow-hidden">
          <img
            src={artist.coverUrl || 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=1200&auto=format&fit=crop&q=80'}
            alt={artist.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111113] via-[#111113]/50 to-transparent" />

          {/* Artist Floating Header Info */}
          <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
            <div className="flex items-end gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-zinc-800 ring-2 ring-[#b7ff00] shrink-0 shadow-2xl">
                <img
                  src={artist.photoUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&auto=format&fit=crop&q=80'}
                  alt={artist.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#b7ff00] font-bold">
                  {artist.genre} • {artist.city}
                </span>
                <h2 className="font-display font-black text-2xl sm:text-3xl text-white">
                  {artist.name}
                </h2>
                <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-0.5">
                  <Users className="w-3.5 h-3.5 text-zinc-500" />
                  <span>{artist.followersCount.toLocaleString('id-ID')} pengikut skena</span>
                </div>
              </div>
            </div>

            <Button
              variant={artist.isFollowed ? 'secondary' : 'primary'}
              size="sm"
              onClick={handleFollow}
            >
              {artist.isFollowed ? 'Mengikuti' : '+ Ikuti Band'}
            </Button>
          </div>
        </div>

        {/* Tab Navigation Navigation */}
        <div className="flex gap-1 overflow-x-auto no-scrollbar border-b border-[#27272a] pb-2 text-xs">
          {[
            { id: 'music', label: 'Trek Audio', icon: <Music className="w-3.5 h-3.5" /> },
            { id: 'about', label: 'Bio / Profil', icon: <Users className="w-3.5 h-3.5" /> },
            { id: 'albums', label: 'Album', icon: <Disc className="w-3.5 h-3.5" /> },
            { id: 'posts', label: 'Kabar Band', icon: <Newspaper className="w-3.5 h-3.5" /> },
            { id: 'journey', label: 'Timeline', icon: <Milestone className="w-3.5 h-3.5" /> },
            { id: 'members', label: 'Personil', icon: <UserCheck className="w-3.5 h-3.5" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#18181b] text-[#b7ff00] font-bold border border-zinc-700'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* TAB: MUSIC */}
        {activeTab === 'music' && (
          <div className="space-y-3">
            <h4 className="font-display font-bold text-sm text-white">Audio Preview (30 Detik)</h4>
            {artist.tracks && artist.tracks.length > 0 ? (
              artist.tracks.map((t) => <AudioPlayer key={t.trackId} track={t} />)
            ) : (
              <p className="text-xs text-zinc-500 py-4 text-center">Belum ada preview lagu diunggah.</p>
            )}
          </div>
        )}

        {/* TAB: ABOUT */}
        {activeTab === 'about' && (
          <div className="space-y-4 text-xs text-zinc-300 leading-relaxed bg-[#18181b] p-4 rounded-xl border border-[#27272a]">
            <p>{artist.bio}</p>
            {artist.socialLinks && (
              <div className="pt-3 border-t border-zinc-800 text-[11px] text-zinc-400">
                <span>Social: </span>
                <span className="text-[#b7ff00] underline">{artist.socialLinks}</span>
              </div>
            )}
          </div>
        )}

        {/* TAB: ALBUMS */}
        {activeTab === 'albums' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {artist.albums && artist.albums.length > 0 ? (
              artist.albums.map((alb) => (
                <div key={alb.albumId} className="p-3 rounded-xl bg-[#18181b] border border-[#27272a] flex gap-3">
                  <img src={alb.coverUrl} alt={alb.title} className="w-16 h-16 rounded-lg object-cover bg-zinc-800" />
                  <div>
                    <h5 className="font-bold text-sm text-white">{alb.title}</h5>
                    <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-2">{alb.description}</p>
                    <span className="text-[10px] font-mono text-[#b7ff00] block mt-1">Rilis: {alb.releaseDate}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-zinc-500 py-4 text-center col-span-2">Belum ada album terdaftar.</p>
            )}
          </div>
        )}

        {/* TAB: POSTS */}
        {activeTab === 'posts' && (
          <div className="space-y-3">
            {artist.posts && artist.posts.length > 0 ? (
              artist.posts.map((p) => (
                <div key={p.postId} className="p-4 rounded-xl bg-[#18181b] border border-[#27272a] space-y-2">
                  <span className="text-[10px] font-mono text-zinc-500">{new Date(p.createdAt).toLocaleDateString('id-ID')}</span>
                  <h5 className="font-bold text-sm text-white">{p.title}</h5>
                  <p className="text-xs text-zinc-300 leading-relaxed">{p.content}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-zinc-500 py-4 text-center">Belum ada kabar terbaru dari band.</p>
            )}
          </div>
        )}

        {/* TAB: JOURNEY */}
        {activeTab === 'journey' && (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-zinc-800">
            {artist.journey && artist.journey.length > 0 ? (
              artist.journey.map((item) => (
                <div key={item.journeyId} className="relative">
                  <div className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-[#b7ff00] ring-4 ring-[#111113]" />
                  <span className="text-[10px] font-mono text-zinc-500 block">{item.date} • {item.category}</span>
                  <h5 className="font-bold text-sm text-white mt-0.5">{item.title}</h5>
                  <p className="text-xs text-zinc-400 mt-1">{item.description}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-zinc-500 py-4">Belum ada timeline perjalanan tercatat.</p>
            )}
          </div>
        )}

        {/* TAB: MEMBERS */}
        {activeTab === 'members' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {artist.members && artist.members.length > 0 ? (
              artist.members.map((m) => (
                <div key={m.memberId} className="p-3 rounded-xl bg-[#18181b] border border-[#27272a] text-center">
                  <img src={m.photoUrl} alt={m.name} className="w-12 h-12 rounded-full mx-auto object-cover ring-1 ring-zinc-700 mb-2" />
                  <p className="font-bold text-xs text-white truncate">{m.name}</p>
                  <p className="text-[10px] text-zinc-400 truncate">{m.role}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-zinc-500 py-4 col-span-4 text-center">Belum ada profil personil.</p>
            )}
          </div>
        )}

        {/* Upcoming Gigs Section */}
        {upcomingEvents.length > 0 && (
          <div className="pt-4 border-t border-[#27272a] space-y-2.5">
            <h4 className="font-display font-bold text-sm text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#b7ff00]" />
              Jadwal Panggung Mendatang
            </h4>
            <div className="space-y-2">
              {upcomingEvents.map((evt) => (
                <div
                  key={evt.eventId}
                  onClick={() => {
                    onClose();
                    onSelectEvent?.(evt);
                  }}
                  className="p-3 rounded-xl bg-[#18181b] hover:bg-[#222226] border border-[#27272a] flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div>
                    <p className="font-bold text-xs text-white">{evt.name}</p>
                    <p className="text-[11px] text-zinc-400">{evt.venue?.name} • {new Date(evt.startDate).toLocaleDateString('id-ID')}</p>
                  </div>
                  <span className="text-xs text-[#b7ff00] font-bold">Lihat Tiket →</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
