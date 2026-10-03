import React from 'react';
import { Users, Heart } from 'lucide-react';
import { Artist } from '../../types';
import { nativeBridge } from '../../services/bridge';

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
  const handleFollowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    nativeBridge.hapticFeedback('light');
    onToggleFollow?.(artist.artistId);
  };

  return (
    <div
      onClick={() => onClick(artist)}
      className="group p-3.5 rounded-2xl bg-[#111113] hover:bg-[#18181b] border border-[#27272a] hover:border-zinc-600 transition-all duration-300 cursor-pointer flex items-center justify-between select-none"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-zinc-800 shrink-0 ring-1 ring-zinc-700 group-hover:ring-[#b7ff00] transition-all">
          <img
            src={artist.photoUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&auto=format&fit=crop&q=80'}
            alt={artist.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        </div>
        <div className="min-w-0">
          <h4 className="font-display font-bold text-sm text-white group-hover:text-[#b7ff00] transition-colors truncate">
            {artist.name}
          </h4>
          <p className="text-xs text-zinc-400 truncate">{artist.genre} • {artist.city}</p>
          <div className="flex items-center gap-1 text-[11px] text-zinc-500 font-mono mt-0.5">
            <Users className="w-3 h-3 text-zinc-400" />
            <span>{artist.followersCount.toLocaleString('id-ID')} pengikut</span>
          </div>
        </div>
      </div>

      <button
        onClick={handleFollowClick}
        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer shrink-0 ml-2 ${
          artist.isFollowed
            ? 'bg-[#18181b] text-zinc-300 border border-zinc-700 hover:border-red-500/40 hover:text-red-400'
            : 'bg-[#b7ff00]/15 text-[#b7ff00] border border-[#b7ff00]/30 hover:bg-[#b7ff00]/25'
        }`}
      >
        {artist.isFollowed ? 'Mengikuti' : '+ Ikuti'}
      </button>
    </div>
  );
};
