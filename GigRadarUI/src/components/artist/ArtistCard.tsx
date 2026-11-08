import React from 'react';
import { Users, Play, Pause, Sparkles } from 'lucide-react';
import { Artist } from '../../types';
import { nativeBridge } from '../../services/bridge';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';

export interface ArtistCardProps {
  artist: Artist;
  onClick: (artist: Artist) => void;
  onToggleFollow?: (artistId: number) => void;
}

export const ArtistCard: React.FC<ArtistCardProps> = ({
  artist,
  onClick,
  onToggleFollow,
}) => {
  const { currentTrack, isPlaying, play, togglePlay } = useAudioPlayer();
  const hypeTrack = artist.tracks && artist.tracks.length > 0 ? artist.tracks[0] : null;
  const isThisPlaying = isPlaying && hypeTrack && currentTrack?.trackId === hypeTrack.trackId;

  const handleFollowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    nativeBridge.hapticFeedback('light');
    onToggleFollow?.(artist.artistId);
  };

  const handleQuickPlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    nativeBridge.hapticFeedback('light');
    if (hypeTrack) {
      if (currentTrack?.trackId === hypeTrack.trackId) {
        togglePlay();
      } else {
        play(hypeTrack, artist, true);
      }
    }
  };

  return (
    <div
      onClick={() => onClick(artist)}
      className={`group p-3.5 rounded-2xl transition-all duration-300 cursor-pointer flex items-center justify-between select-none border ${
        isThisPlaying
          ? 'bg-[#181c12] border-[#b7ff00]/60 shadow-[0_0_20px_rgba(183,255,0,0.15)]'
          : 'bg-[#111113] hover:bg-[#18181b] border-[#27272a] hover:border-zinc-600'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Photo with hover play overlay */}
        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-zinc-800 shrink-0 ring-1 ring-zinc-700 group-hover:ring-[#b7ff00] transition-all">
          <img
            src={artist.photoUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&auto=format&fit=crop&q=80'}
            alt={artist.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
          {hypeTrack && (
            <button
              onClick={handleQuickPlay}
              className={`absolute inset-0 flex items-center justify-center transition-opacity ${
                isThisPlaying
                  ? 'bg-black/60 opacity-100'
                  : 'bg-black/40 opacity-70 group-hover:opacity-100'
              }`}
              title={isThisPlaying ? 'Jeda Lagu' : `Putar Lagu: "${hypeTrack.title}"`}
            >
              <div className="w-7 h-7 rounded-full bg-[#b7ff00] text-black flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-110">
                {isThisPlaying ? (
                  <Pause className="w-3.5 h-3.5 fill-current" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                )}
              </div>
            </button>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h4 className="font-display font-bold text-sm text-white group-hover:text-[#b7ff00] transition-colors truncate">
              {artist.name}
            </h4>
            {artist.logoUrl && (
              <img
                src={artist.logoUrl}
                alt={`${artist.name} logo`}
                className="w-4 h-4 rounded object-contain bg-black/60 p-0.5 border border-[#b7ff00]/30 shrink-0"
                title={`Logo ${artist.name}`}
              />
            )}
            {isThisPlaying && (
              <span className="flex items-end gap-0.5 h-3">
                <span className="w-0.5 bg-[#b7ff00] h-2 animate-pulse" />
                <span className="w-0.5 bg-[#b7ff00] h-3 animate-[pulse_0.7s_infinite]" />
                <span className="w-0.5 bg-[#b7ff00] h-1.5 animate-[pulse_1.1s_infinite]" />
              </span>
            )}
          </div>

          <p className="text-xs text-zinc-400 truncate">{artist.genre} • {artist.city}</p>

          {hypeTrack ? (
            <div className="flex items-center gap-1 text-[11px] text-[#b7ff00] truncate mt-0.5 font-medium">
              <Sparkles className="w-3 h-3 shrink-0" />
              <span className="truncate">Lagu Populer: "{hypeTrack.title}"</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-[11px] text-zinc-500 font-mono mt-0.5">
              <Users className="w-3 h-3 text-zinc-400" />
              <span>{artist.followersCount.toLocaleString('id-ID')} pengikut</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 ml-2">
        {hypeTrack && (
          <button
            onClick={handleQuickPlay}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
              isThisPlaying
                ? 'bg-[#b7ff00] text-black shadow-[0_0_15px_rgba(183,255,0,0.5)] ring-2 ring-[#b7ff00]'
                : 'bg-zinc-800 text-zinc-200 hover:text-white hover:bg-zinc-700 border border-zinc-700 hover:border-[#b7ff00]/50'
            }`}
            title={isThisPlaying ? `Jeda "${hypeTrack.title}"` : `Putar Lagu Populer: "${hypeTrack.title}"`}
          >
            {isThisPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span className="hidden sm:inline font-mono">Jeda</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current ml-0.5 text-[#b7ff00]" />
                <span className="hidden sm:inline font-mono">Setel Lagu</span>
              </>
            )}
          </button>
        )}

        <button
          onClick={handleFollowClick}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
            artist.isFollowed
              ? 'bg-[#18181b] text-zinc-300 border border-zinc-700 hover:border-red-500/40 hover:text-red-400'
              : 'bg-[#b7ff00]/15 text-[#b7ff00] border border-[#b7ff00]/30 hover:bg-[#b7ff00]/25'
          }`}
        >
          {artist.isFollowed ? 'Mengikuti' : '+ Ikuti'}
        </button>
      </div>
    </div>
  );
};
