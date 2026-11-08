import React from 'react';
import { Play, Pause, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { AudioTrack, Artist } from '../../types';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';
import { nativeBridge } from '../../services/bridge';

export interface AudioPlayerProps {
  track: AudioTrack;
  artist?: Artist;
  isHypeTrack?: boolean;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ track, artist, isHypeTrack = false }) => {
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

  const isCurrentTrack = currentTrack?.trackId === track.trackId;
  const isThisPlaying = isCurrentTrack && isPlaying;

  const handlePlayToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    nativeBridge.hapticFeedback('light');

    if (isCurrentTrack) {
      togglePlay();
    } else {
      const parentArtist: Artist = artist || {
        artistId: track.artistId,
        name: 'Musisi Skena',
        bio: '',
        genre: track.genre,
        city: 'Indonesia',
        photoUrl: track.coverUrl,
        coverUrl: track.coverUrl,
        socialLinks: '',
        followersCount: 1000,
      };
      play(track, parentArtist);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!isCurrentTrack) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newProgress = Math.min(100, Math.max(0, (clickX / rect.width) * 100));
    seek(newProgress);
  };

  const currentSeconds = isCurrentTrack ? currentTime : 0;
  const totalSeconds = isCurrentTrack ? duration : track.durationSeconds || 30;

  return (
    <div
      className={`p-3.5 rounded-2xl transition-all duration-200 border flex items-center gap-3.5 ${
        isThisPlaying
          ? 'bg-[#1a1e12] border-[#b7ff00]/60 shadow-[0_4px_20px_rgba(183,255,0,0.12)]'
          : 'bg-[#18181b] border-[#27272a] hover:border-zinc-600'
      }`}
    >
      {/* Play/Pause Button */}
      <button
        onClick={handlePlayToggle}
        className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0 ${
          isThisPlaying
            ? 'bg-[#b7ff00] text-black shadow-[0_0_18px_rgba(183,255,0,0.5)] scale-105'
            : 'bg-[#111113] text-white hover:text-[#b7ff00] border border-zinc-700 hover:border-[#b7ff00]/50'
        }`}
        title={isThisPlaying ? 'Jeda Lagu' : 'Putar Lagu'}
      >
        {isThisPlaying ? (
          <Pause className="w-5 h-5 fill-current" />
        ) : (
          <Play className="w-5 h-5 fill-current ml-0.5" />
        )}
      </button>

      {/* Track Info & Scrubber */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5 gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            {isHypeTrack && (
              <span className="flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#b7ff00]/20 text-[#b7ff00] font-bold shrink-0">
                <Sparkles className="w-3 h-3" />
                HYPE TRACK
              </span>
            )}
            <p className="text-xs font-bold text-white truncate">{track.title}</p>
          </div>

          <span className="text-[10px] font-mono text-zinc-400 shrink-0">
            0:{currentSeconds < 10 ? '0' : ''}{currentSeconds} / 0:{totalSeconds < 10 ? '0' : ''}{totalSeconds}
          </span>
        </div>

        {/* Progress Scrubber */}
        <div
          onClick={handleSeek}
          className="relative h-2 bg-zinc-800 rounded-full overflow-hidden cursor-pointer group"
        >
          <div
            className={`absolute top-0 bottom-0 left-0 rounded-full transition-all duration-100 ${
              isThisPlaying ? 'bg-[#b7ff00] shadow-[0_0_8px_#b7ff00]' : 'bg-zinc-600'
            }`}
            style={{ width: `${isCurrentTrack ? progress : 0}%` }}
          />
        </div>
      </div>

      {/* Sound / Equalizer Indicator */}
      <div className="shrink-0 flex items-center gap-1">
        {isThisPlaying && (
          <div className="flex items-end gap-0.5 h-3.5 mr-1">
            <span className="w-0.5 bg-[#b7ff00] h-2 animate-pulse" />
            <span className="w-0.5 bg-[#b7ff00] h-3.5 animate-[pulse_0.7s_infinite]" />
            <span className="w-0.5 bg-[#b7ff00] h-1.5 animate-[pulse_1s_infinite]" />
          </div>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (isCurrentTrack) toggleMute();
          }}
          className="p-1 text-zinc-500 hover:text-zinc-300"
        >
          {isCurrentTrack && isMuted ? (
            <VolumeX className="w-4 h-4 text-red-400" />
          ) : (
            <Volume2 className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
};
