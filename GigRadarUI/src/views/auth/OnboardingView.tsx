import React, { useState } from 'react';
import { ArrowRight, Sparkles, Check } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { storage } from '../../services/storage';
import { GENRE_COLORS } from '../../services/mockData';
import { nativeBridge } from '../../services/bridge';

export interface OnboardingViewProps {
  onComplete: () => void;
}

export const OnboardingView: React.FC<OnboardingViewProps> = ({ onComplete }) => {
  const { updatePreferences } = useAuth();
  const genres = storage.getGenres();
  const [selectedIds, setSelectedIds] = useState<number[]>([1, 6]); // Default Indie, Shoegaze selected

  const toggleGenre = (genreId: number) => {
    nativeBridge.hapticFeedback('light');
    setSelectedIds((prev) =>
      prev.includes(genreId) ? prev.filter((id) => id !== genreId) : [...prev, genreId]
    );
  };

  const handleContinue = () => {
    if (selectedIds.length === 0) return;
    nativeBridge.hapticFeedback('success');
    updatePreferences(selectedIds);
    onComplete();
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col justify-center items-center px-4 py-8 select-none relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#b7ff00]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-xl bg-[#111113] border border-[#27272a] rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#b7ff00]/15 border border-[#b7ff00]/30 text-xs font-mono text-[#b7ff00] font-bold">
            <Sparkles className="w-3.5 h-3.5" /> Preferensi Musik Skena
          </div>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
            Pilih Genre Favoritmu
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
            Radar spasial GigRadar akan memprioritaskan rekomendasi gig dan pertunjukan yang sesuai dengan selera musikmu.
          </p>
        </div>

        {/* 12-Genre Grid (Section 18) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {genres.map((genre) => {
            const isSelected = selectedIds.includes(genre.genreId);
            const color = GENRE_COLORS[genre.name] || {
              bg: 'bg-zinc-900',
              text: 'text-zinc-300',
              hex: '#b7ff00',
            };

            return (
              <div
                key={genre.genreId}
                onClick={() => toggleGenre(genre.genreId)}
                className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer select-none flex flex-col justify-between h-24 ${
                  isSelected
                    ? 'bg-[#18181b] border-[#b7ff00] shadow-[0_0_20px_rgba(183,255,0,0.2)] ring-1 ring-[#b7ff00]'
                    : `${color.bg} border-zinc-800/80 hover:border-zinc-700 hover:scale-[1.02]`
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{genre.icon}</span>
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-[#b7ff00] text-black shadow-sm'
                        : 'border border-zinc-700 bg-zinc-900'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>

                <div>
                  <h4 className="font-display font-bold text-sm text-white">{genre.name}</h4>
                  <span className="text-[10px] font-mono text-zinc-400 uppercase">
                    {isSelected ? 'Terpilih' : 'Sentuh untuk pilih'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <Button
            variant="primary"
            size="lg"
            className="w-full text-base"
            disabled={selectedIds.length === 0}
            onClick={handleContinue}
            icon={<ArrowRight className="w-5 h-5" />}
          >
            Lanjut ke Radar ({selectedIds.length} Terpilih)
          </Button>
          <p className="text-[11px] text-zinc-500 text-center mt-2 font-mono">
            Minimal pilih 1 genre skena musik
          </p>
        </div>
      </div>
    </div>
  );
};
