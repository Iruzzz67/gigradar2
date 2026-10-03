import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';
import { AudioTrack } from '../../types';
import { nativeBridge } from '../../services/bridge';

export interface AudioPlayerProps {
  track: AudioTrack;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ track }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 100
  const intervalRef = useRef<any>(null);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 100 / (track.durationSeconds || 30);
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, track.durationSeconds]);

  const togglePlay = () => {
    nativeBridge.hapticFeedback('light');
    if (progress >= 100) setProgress(0);
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newProgress = Math.min(100, Math.max(0, (clickX / rect.width) * 100));
    setProgress(newProgress);
  };

  const currentSeconds = Math.round((progress / 100) * (track.durationSeconds || 30));

  return (
    <div className="p-3.5 rounded-xl bg-[#18181b] border border-[#27272a] hover:border-zinc-600 transition-colors flex items-center gap-3">
      {/* Play/Pause Button */}
      <button
        onClick={togglePlay}
        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 ${
          isPlaying
            ? 'bg-[#b7ff00] text-black shadow-[0_0_15px_rgba(183,255,0,0.4)]'
            : 'bg-[#111113] text-white hover:text-[#b7ff00] border border-zinc-700'
        }`}
      >
        {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
      </button>

      {/* Track Info & Scrubber */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-xs font-bold text-white truncate pr-2">{track.title}</p>
          <span className="text-[10px] font-mono text-[#b7ff00] shrink-0">
            0:{currentSeconds < 10 ? '0' : ''}{currentSeconds} / 0:{track.durationSeconds || 30} (Preview)
          </span>
        </div>

        {/* Progress Scrubber */}
        <div
          onClick={handleSeek}
          className="relative h-2 bg-zinc-800 rounded-full overflow-hidden cursor-pointer group"
        >
          <div
            className="absolute top-0 bottom-0 left-0 bg-[#b7ff00] rounded-full transition-all duration-150"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <Volume2 className="w-4 h-4 text-zinc-500 shrink-0" />
    </div>
  );
};
