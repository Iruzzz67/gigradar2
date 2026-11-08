import React, { useState, useEffect } from 'react';
import {
  Users,
  Music,
  Disc,
  Newspaper,
  Milestone,
  UserCheck,
  Calendar,
  Sparkles,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Disc3,
  BookOpen,
  History,
} from 'lucide-react';
import { Artist, Event } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { AudioPlayer } from './AudioPlayer';
import { nativeBridge } from '../../services/bridge';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';

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
  const [activeTab, setActiveTab] = useState<'music' | 'history' | 'about' | 'albums' | 'posts' | 'journey' | 'members'>('music');
  const {
    currentTrack,
    isPlaying,
    progress,
    currentTime,
    duration,
    isMuted,
    play,
    togglePlay,
    toggleMute,
    seek,
  } = useAudioPlayer();

  const hypeTrack = artist?.tracks && artist.tracks.length > 0 ? artist.tracks[0] : null;

  // Set default tab to 'music' when profile opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab('music');
    }
  }, [isOpen, artist?.artistId]);

  // AUTO-PLAY: Automatically trigger playback of the artist's hype song when modal opens only if no Spotify embed
  useEffect(() => {
    if (isOpen && artist && hypeTrack && !artist.spotifyEmbedUrl) {
      play(hypeTrack, artist, true);
    }
  }, [isOpen, artist?.artistId]);

  if (!artist) return null;

  const isHypePlaying = isPlaying && currentTrack?.trackId === hypeTrack?.trackId;

  const upcomingEvents = allEvents.filter((e) =>
    e.artists?.some((a) => a.artistId === artist.artistId)
  );

  const handleFollow = () => {
    nativeBridge.hapticFeedback('medium');
    onToggleFollow?.(artist.artistId);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newProgress = Math.min(100, Math.max(0, (clickX / rect.width) * 100));
    seek(newProgress);
  };

  const formatSeconds = (sec: number) => {
    const s = Math.round(sec);
    return `0:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="xl" showCloseButton={true}>
      <div className="space-y-5 -m-2 sm:-m-0">
        {/* Cover & Avatar Hero */}
        <div className="relative h-48 sm:h-60 -mx-6 -mt-6 bg-zinc-900 overflow-hidden">
          <img
            src={artist.coverUrl || 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=1200&auto=format&fit=crop&q=80'}
            alt={artist.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111113] via-[#111113]/60 to-transparent" />

          {/* Artist Floating Header Info */}
          <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between gap-3">
            <div className="flex items-end gap-3.5 min-w-0">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-zinc-800 ring-2 ring-[#b7ff00] shrink-0 shadow-2xl">
                <img
                  src={artist.photoUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&auto=format&fit=crop&q=80'}
                  alt={artist.name}
                  className="w-full h-full object-cover"
                />
                {isHypePlaying && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Disc3 className="w-6 h-6 text-[#b7ff00] animate-spin" />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#b7ff00] font-bold block truncate">
                  {artist.genre} • {artist.city}
                </span>
                <div className="flex items-center gap-2">
                  <h2 className="font-display font-black text-2xl sm:text-3xl text-white truncate">
                    {artist.name}
                  </h2>
                  {artist.logoUrl && (
                    <img
                      src={artist.logoUrl}
                      alt={`${artist.name} logo`}
                      className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl object-contain bg-black/80 p-1 border border-[#b7ff00]/40 shrink-0 shadow-lg"
                      title={`Logo Resmi ${artist.name}`}
                    />
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-0.5">
                  <Users className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                  <span>{artist.followersCount.toLocaleString('id-ID')} pengikut skena</span>
                </div>
              </div>
            </div>

            <Button
              variant={artist.isFollowed ? 'secondary' : 'primary'}
              size="sm"
              onClick={handleFollow}
              className="shrink-0"
            >
              {artist.isFollowed ? 'Mengikuti' : '+ Ikuti Band'}
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 overflow-x-auto no-scrollbar border-b border-[#27272a] pb-2 text-xs">
          {[
            { id: 'music', label: 'Trek Audio', icon: <Music className="w-3.5 h-3.5" /> },
            { id: 'history', label: 'Sejarah Band', icon: <BookOpen className="w-3.5 h-3.5" /> },
            { id: 'about', label: 'Bio / Profil', icon: <Users className="w-3.5 h-3.5" /> },
            { id: 'journey', label: 'Timeline', icon: <Milestone className="w-3.5 h-3.5" /> },
            { id: 'albums', label: 'Album', icon: <Disc className="w-3.5 h-3.5" /> },
            { id: 'posts', label: 'Kabar Band', icon: <Newspaper className="w-3.5 h-3.5" /> },
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
          <div className="space-y-4">
            {/* 1. SPOTIFY EMBED (FEATURED AT TOP OF TRACK AUDIO) */}
            {artist.spotifyEmbedUrl ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-[11px] text-[#1DB954] flex items-center gap-1.5 font-bold uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-[#1DB954] animate-pulse" />
                    Spotify Official Artist Player
                  </span>
                  <a
                    href={artist.spotifyEmbedUrl.replace('/embed/', '/')}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] font-mono text-zinc-400 hover:text-[#1DB954] transition-colors"
                  >
                    Buka di Spotify ↗
                  </a>
                </div>
                <div className="w-full rounded-2xl overflow-hidden bg-black/60 shadow-[0_4px_30px_rgba(0,0,0,0.6)] border border-zinc-800">
                  <iframe
                    data-testid="embed-iframe"
                    style={{ borderRadius: '12px', display: 'block' }}
                    src={artist.spotifyEmbedUrl}
                    width="100%"
                    height="352"
                    frameBorder="0"
                    allowFullScreen
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                  />
                </div>
              </div>
            ) : (
              <>
                {/* 2. QUICK AUDIO PREVIEW BANNER (SHOWN ONLY WHEN NO SPOTIFY EMBED) */}
                {hypeTrack && (
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#17220e] via-[#12160d] to-[#18181b] border border-[#b7ff00]/40 shadow-[0_4px_25px_rgba(183,255,0,0.12)]">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-[#b7ff00] text-black flex items-center justify-center font-bold shrink-0 shadow-[0_0_12px_rgba(183,255,0,0.4)]">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-mono font-bold text-[#b7ff00] uppercase tracking-wider bg-[#b7ff00]/20 px-1.5 py-0.5 rounded">
                              🔥 PREVIEW AUDIO TERSETEL OTOMATIS
                            </span>
                            {isHypePlaying && (
                              <span className="flex items-end gap-0.5 h-3">
                                <span className="w-0.5 bg-[#b7ff00] h-2 animate-pulse" />
                                <span className="w-0.5 bg-[#b7ff00] h-3 animate-[pulse_0.7s_infinite]" />
                                <span className="w-0.5 bg-[#b7ff00] h-1.5 animate-[pulse_1.1s_infinite]" />
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-bold text-white truncate mt-0.5">
                            "{hypeTrack.title}" — {artist.name}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={toggleMute}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                          title={isMuted ? 'Nyalakan Suara' : 'Bisukan Suara'}
                        >
                          {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
                        </button>

                        <button
                          onClick={togglePlay}
                          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                            isHypePlaying
                              ? 'bg-[#b7ff00] text-black shadow-[0_0_15px_rgba(183,255,0,0.5)]'
                              : 'bg-zinc-800 text-white hover:text-[#b7ff00] border border-zinc-700'
                          }`}
                          title={isHypePlaying ? 'Jeda Lagu' : 'Putar Lagu'}
                        >
                          {isHypePlaying ? (
                            <Pause className="w-4 h-4 fill-current" />
                          ) : (
                            <Play className="w-4 h-4 fill-current ml-0.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Scrubber Bar */}
                    <div
                      onClick={handleSeek}
                      className="relative h-1.5 bg-zinc-800 rounded-full overflow-hidden cursor-pointer"
                    >
                      <div
                        className="absolute top-0 bottom-0 left-0 bg-[#b7ff00] rounded-full transition-all duration-100 shadow-[0_0_6px_#b7ff00]"
                        style={{ width: `${isHypePlaying ? progress : 0}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400 mt-1">
                      <span>{formatSeconds(isHypePlaying ? currentTime : 0)}</span>
                      <span className="text-[#b7ff00]">Audio Preview Skena (30s)</span>
                      <span>{formatSeconds(isHypePlaying ? duration : hypeTrack.durationSeconds || 30)}</span>
                    </div>
                  </div>
                )}

                {/* 3. TRACK LIST (SHOWN ONLY WHEN NO SPOTIFY EMBED) */}
                <div className="flex items-center justify-between pt-1">
                  <h4 className="font-display font-bold text-sm text-white flex items-center gap-1.5">
                    <Music className="w-4 h-4 text-[#b7ff00]" />
                    Daftar Lagu Populer
                  </h4>
                  <span className="text-[11px] text-zinc-400 font-mono">
                    {artist.tracks?.length || 0} trek audio
                  </span>
                </div>

                {artist.tracks && artist.tracks.length > 0 ? (
                  <div className="space-y-2.5">
                    {artist.tracks.map((t, idx) => (
                      <AudioPlayer
                        key={t.trackId}
                        track={t}
                        artist={artist}
                        isHypeTrack={idx === 0}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-500 py-6 text-center">Belum ada preview lagu diunggah.</p>
                )}
              </>
            )}
          </div>
        )}

        {/* TAB: HISTORY */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            {/* Historical Origin Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#18181b] via-[#141416] to-[#111113] border border-[#27272a] shadow-xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#b7ff00]/15 border border-[#b7ff00]/30 flex items-center justify-center text-[#b7ff00] shrink-0">
                    <History className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-sm text-white">
                      Sejarah Perjalanan & Asal-Usul {artist.name}
                    </h4>
                    <span className="text-[10px] font-mono text-zinc-400">
                      Asal: {artist.city} • Genre: {artist.genre}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#b7ff00]/15 text-[#b7ff00] border border-[#b7ff00]/30 font-bold">
                  Arsip Musik Skena ID
                </span>
              </div>

              {/* Narrative Story */}
              <div className="space-y-3.5 text-xs text-zinc-300 leading-relaxed">
                {(artist.history || artist.bio).split('\n\n').map((paragraph, pIdx) => (
                  <p key={pIdx} className="text-zinc-300 leading-relaxed text-xs">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            {/* Key Timeline Milestones Preview */}
            {artist.journey && artist.journey.length > 0 && (
              <div className="p-4 rounded-2xl bg-[#141416] border border-[#27272a] space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="font-display font-bold text-xs text-white flex items-center gap-1.5">
                    <Milestone className="w-3.5 h-3.5 text-[#b7ff00]" />
                    Milestone Penting dalam Sejarah Band
                  </h5>
                  <button
                    onClick={() => setActiveTab('journey')}
                    className="text-[11px] text-[#b7ff00] hover:underline font-mono font-bold"
                  >
                    Buka Timeline →
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {artist.journey.map((item) => (
                    <div
                      key={item.journeyId}
                      className="p-2.5 rounded-xl bg-[#19191d] border border-zinc-800 flex gap-2.5 items-start"
                    >
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#b7ff00]/20 text-[#b7ff00] font-bold shrink-0">
                        {item.date?.split('-')[0] || item.category}
                      </span>
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-white truncate">{item.title}</p>
                        <p className="text-[11px] text-zinc-400 line-clamp-2 mt-0.5">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB: ABOUT */}
        {activeTab === 'about' && (
          <div className="space-y-4 text-xs text-zinc-300 leading-relaxed bg-[#18181b] p-4 rounded-xl border border-[#27272a]">
            <p className="whitespace-pre-line">{artist.bio}</p>
            {artist.socialLinks && (
              <div className="pt-3 border-t border-zinc-800 text-[11px] text-zinc-400 flex items-center gap-2">
                <span className="font-semibold text-white">Official Media:</span>
                <span className="text-[#b7ff00] underline font-mono">{artist.socialLinks}</span>
              </div>
            )}
          </div>
        )}

        {/* TAB: ALBUMS */}
        {activeTab === 'albums' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {artist.albums && artist.albums.length > 0 ? (
              artist.albums.map((alb) => (
                <div key={alb.albumId} className="p-3 rounded-xl bg-[#18181b] border border-[#27272a] flex gap-3 items-center">
                  <img
                    src={alb.coverUrl}
                    alt={alb.title}
                    className="w-16 h-16 rounded-lg object-cover bg-zinc-800 shrink-0 ring-1 ring-zinc-700"
                  />
                  <div className="min-w-0">
                    <h5 className="font-bold text-sm text-white truncate">{alb.title}</h5>
                    <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-2">{alb.description}</p>
                    <span className="text-[10px] font-mono text-[#b7ff00] block mt-1">Rilis: {alb.releaseDate}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-zinc-500 py-6 text-center col-span-2">Belum ada album terdaftar.</p>
            )}
          </div>
        )}

        {/* TAB: POSTS */}
        {activeTab === 'posts' && (
          <div className="space-y-3">
            {artist.posts && artist.posts.length > 0 ? (
              artist.posts.map((p) => (
                <div key={p.postId} className="p-4 rounded-xl bg-[#18181b] border border-[#27272a] space-y-2">
                  <span className="text-[10px] font-mono text-zinc-500">
                    {new Date(p.createdAt).toLocaleDateString('id-ID', { dateStyle: 'long' })}
                  </span>
                  <h5 className="font-bold text-sm text-white">{p.title}</h5>
                  <p className="text-xs text-zinc-300 leading-relaxed">{p.content}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-zinc-500 py-6 text-center">Belum ada kabar terbaru dari band.</p>
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
                  <span className="text-[10px] font-mono text-zinc-500 block">
                    {item.date} • <strong className="text-[#b7ff00]">{item.category}</strong>
                  </span>
                  <h5 className="font-bold text-sm text-white mt-0.5">{item.title}</h5>
                  <p className="text-xs text-zinc-400 mt-1">{item.description}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-zinc-500 py-6">Belum ada timeline perjalanan tercatat.</p>
            )}
          </div>
        )}

        {/* TAB: MEMBERS */}
        {activeTab === 'members' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {artist.members && artist.members.length > 0 ? (
              artist.members.map((m) => (
                <div key={m.memberId} className="p-3 rounded-xl bg-[#18181b] border border-[#27272a] text-center">
                  <img
                    src={m.photoUrl || artist.photoUrl}
                    alt={m.name}
                    className="w-14 h-14 rounded-full mx-auto object-cover ring-2 ring-zinc-700 mb-2"
                  />
                  <p className="font-bold text-xs text-white truncate">{m.name}</p>
                  <p className="text-[11px] text-zinc-400 truncate">{m.role}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-zinc-500 py-6 col-span-3 text-center">Belum ada profil personil.</p>
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
                    <p className="text-[11px] text-zinc-400">
                      {evt.venue?.name} • {new Date(evt.startDate).toLocaleDateString('id-ID')}
                    </p>
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
