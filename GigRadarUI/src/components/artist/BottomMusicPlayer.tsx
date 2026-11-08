import React from 'react';
import { Play, Pause, Volume2, VolumeX, X, Disc3 } from 'lucide-react';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';
import { Artist } from '../../types';

export interface BottomMusicPlayerProps {
  onOpenArtist?: (artist: Artist) => void;
}

export const BottomMusicPlayer: React.FC<BottomMusicPlayerProps> = ({ onOpenArtist }) => {
  const {
    currentTrack,
    currentArtist,
    isPlaying,
    progress,
    currentTime,
    duration,
    isMuted,
    togglePlay,
    toggleMute,
    seek,
    stop,
  } = useAudioPlayer();

  if (!currentTrack || !currentArtist) {
    return null;
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newProgress = Math.min(100, Math.max(0, (clickX / rect.width) * 100));
    seek(newProgress);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed bottom-20 lg:bottom-4 left-4 right-4 max-w-xl mx-auto z-40 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="p-3 bg-[#111113]/95 backdrop-blur-xl border border-[#b7ff00]/40 rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.8),0_0_20px_rgba(183,255,0,0.15)] flex flex-col gap-2">
        {/* Progress Bar on top */}
        <div
          onClick={handleSeek}
          className="relative h-1.5 bg-zinc-800 rounded-full overflow-hidden cursor-pointer group"
          title="Klik untuk melompati waktu trek"
        >
          <div
            className="absolute top-0 bottom-0 left-0 bg-[#b7ff00] rounded-full transition-all duration-100 shadow-[0_0_8px_#b7ff00]"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Player Controls & Info */}
        <div className="flex items-center justify-between gap-3">
          {/* Artist & Track Info */}
          <div
            onClick={() => onOpenArtist?.(currentArtist)}
            className="flex items-center gap-3 min-w-0 cursor-pointer group flex-1"
          >
            <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-zinc-800 shrink-0 ring-1 ring-zinc-700 group-hover:ring-[#b7ff00] transition-all">
              <img
                src={currentTrack.coverUrl || currentArtist.photoUrl}
                alt={currentTrack.title}
                className={`w-full h-full object-cover ${isPlaying ? 'animate-[spin_10s_linear_infinite]' : ''}`}
              />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <Disc3 className="w-4 h-4 text-white/70" />
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#b7ff00]/20 text-[#b7ff00] font-bold">
                  SKENA HYPE
                </span>
                <p className="text-xs font-bold text-white truncate group-hover:text-[#b7ff00] transition-colors">
                  {currentTrack.title}
                </p>
              </div>
              <p className="text-[11px] text-zinc-400 truncate">
                {currentArtist.name} • <span className="text-zinc-500">{formatTime(currentTime)} / {formatTime(duration)}</span>
              </p>
            </div>
          </div>

          {/* Equalizer animation when playing */}
          {isPlaying && (
            <div className="hidden sm:flex items-end gap-0.5 h-4 shrink-0 px-2">
              <span className="w-1 bg-[#b7ff00] h-3 rounded-full animate-pulse" />
              <span className="w-1 bg-[#b7ff00] h-4 rounded-full animate-[pulse_0.8s_ease-in-out_infinite]" />
              <span className="w-1 bg-[#b7ff00] h-2 rounded-full animate-[pulse_1.2s_ease-in-out_infinite]" />
              <span className="w-1 bg-[#b7ff00] h-3.5 rounded-full animate-[pulse_0.6s_ease-in-out_infinite]" />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={toggleMute}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors"
              title={isMuted ? 'Nyalakan Suara' : 'Bisukan Suara'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              onClick={togglePlay}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                isPlaying
                  ? 'bg-[#b7ff00] text-black shadow-[0_0_15px_rgba(183,255,0,0.5)] scale-105'
                  : 'bg-zinc-800 text-white hover:text-[#b7ff00] border border-zinc-700'
              }`}
              title={isPlaying ? 'Jeda Lagu' : 'Putar Lagu'}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
            </button>

            <button
              onClick={stop}
              className="p-2 rounded-xl text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/80 transition-colors"
              title="Tutup Pemutar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
