import React, { useState } from 'react';
import { Radio, Box, Sparkles, MapPin, List, RefreshCw } from 'lucide-react';
import { Event } from '../../types';
import { RadarCanvas } from '../../components/radar/RadarCanvas';
import { RadarThree } from '../../components/radar/RadarThree';
import { QuickPreviewSheet } from '../../components/radar/QuickPreviewSheet';
import { EventCard } from '../../components/event/EventCard';
import { useLocation } from '../../context/LocationContext';
import { nativeBridge } from '../../services/bridge';

export interface RadarScreenProps {
  events: Event[];
  onSelectEvent: (event: Event) => void;
  onToggleFavorite: (eventId: number) => void;
}

export const RadarScreen: React.FC<RadarScreenProps> = ({
  events,
  onSelectEvent,
  onToggleFavorite,
}) => {
  const { cityName, permissionStatus, refreshLocation } = useLocation();

  const [renderMode, setRenderMode] = useState<'3d' | '2d' | 'list'>('2d');
  const [maxRangeKm, setMaxRangeKm] = useState<number>(25);
  const [previewEvent, setPreviewEvent] = useState<Event | null>(null);

  const handleNodeClick = (event: Event) => {
    nativeBridge.hapticFeedback('medium');
    setPreviewEvent(event);
  };

  const handleClosePreview = () => {
    setPreviewEvent(null);
  };

  const handleViewFullEvent = (event: Event) => {
    setPreviewEvent(null);
    onSelectEvent(event);
  };

  return (
    <div className="space-y-6 pb-12 select-none relative min-h-[80vh]">
      {/* Top Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#b7ff00] animate-ping" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#b7ff00] font-bold">
              Radar Frekuensi Aktif
            </span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-white mt-0.5">
            Peta Spasial Gigs
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-zinc-500" />
            Pusat koordinat: <strong className="text-white">{cityName}</strong>
            <button
              onClick={refreshLocation}
              className="text-xs text-[#b7ff00] hover:underline ml-2 flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${permissionStatus === 'requesting' ? 'animate-spin' : ''}`} />
              Segarkan GPS
            </button>
          </p>
        </div>

        {/* View Mode Switcher: 2D Canvas vs 3D WebGL vs Accessible List */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#111113] p-1 rounded-2xl border border-[#27272a] text-xs font-semibold">
            <button
              onClick={() => {
                nativeBridge.hapticFeedback('light');
                setRenderMode('2d');
              }}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                renderMode === '2d'
                  ? 'bg-[#18181b] text-[#b7ff00] border border-zinc-700 shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Canvas 2D</span>
            </button>

            <button
              onClick={() => {
                nativeBridge.hapticFeedback('light');
                setRenderMode('3d');
              }}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                renderMode === '3d'
                  ? 'bg-[#18181b] text-[#b7ff00] border border-zinc-700 shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              <span>Spatial 3D</span>
            </button>

            <button
              onClick={() => {
                nativeBridge.hapticFeedback('light');
                setRenderMode('list');
              }}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                renderMode === 'list'
                  ? 'bg-[#18181b] text-[#b7ff00] border border-zinc-700 shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title="Daftar teks untuk aksesibilitas (Section 54)"
            >
              <List className="w-3.5 h-3.5" />
              <span>Daftar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Range Radius Selector */}
      {renderMode !== 'list' && (
        <div className="flex items-center justify-between p-3 rounded-2xl bg-[#111113] border border-[#27272a] text-xs">
          <span className="font-mono text-zinc-400">Radius Jangkauan Pindai:</span>
          <div className="flex gap-2">
            {[10, 25, 50].map((km) => (
              <button
                key={km}
                onClick={() => setMaxRangeKm(km)}
                className={`px-3 py-1 rounded-lg font-mono font-bold transition-colors cursor-pointer ${
                  maxRangeKm === km
                    ? 'bg-[#b7ff00] text-black shadow-[0_0_10px_rgba(183,255,0,0.3)]'
                    : 'bg-zinc-800/80 text-zinc-400 hover:text-white'
                }`}
              >
                {km} KM
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Radar Presentation Area */}
      <div className="relative">
        {renderMode === '2d' && (
          <div className="relative flex flex-col items-center justify-center py-4 bg-[#111113]/40 rounded-3xl border border-[#27272a] overflow-hidden">
            <RadarCanvas
              events={events}
              onSelectEvent={handleNodeClick}
              maxRangeKm={maxRangeKm}
            />
            <p className="text-[11px] font-mono text-zinc-500 mt-2">
              Sentuh node berkedip untuk melihat pratinjau gig
            </p>
          </div>
        )}

        {renderMode === '3d' && (
          <div className="py-2">
            <RadarThree
              events={events}
              onSelectEvent={handleNodeClick}
              maxRangeKm={maxRangeKm}
            />
            <p className="text-[11px] font-mono text-zinc-500 mt-2 text-center">
              Navigasi spasial 3D dengan Three.js WebGL • Sentuh orb untuk membuka gig
            </p>
          </div>
        )}

        {/* Fallback Non-Visual List (Section 54 Accessibility Rule) */}
        {renderMode === 'list' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-[#18181b] border border-[#27272a] flex items-center gap-2 text-xs text-zinc-400">
              <Sparkles className="w-4 h-4 text-[#b7ff00] shrink-0" />
              <span>
                Mode daftar terurut berdasarkan jarak terdekat dari posisimu saat ini.
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {events.map((evt) => (
                <EventCard
                  key={evt.eventId}
                  event={evt}
                  onClick={onSelectEvent}
                  onToggleFavorite={onToggleFavorite}
                />
              ))}
            </div>
          </div>
        )}

        {/* Quick Preview Bottom Sheet */}
        <QuickPreviewSheet
          event={previewEvent}
          isOpen={!!previewEvent}
          onClose={handleClosePreview}
          onViewEvent={handleViewFullEvent}
        />
      </div>
    </div>
  );
};
