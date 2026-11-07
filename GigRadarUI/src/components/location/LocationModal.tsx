import React, { useState } from 'react';
import { MapPin, Navigation, Check, Search, RefreshCw, Compass } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { useLocation, POPULAR_INDONESIAN_CITIES, IndonesianCity } from '../../context/LocationContext';
import { nativeBridge } from '../../services/bridge';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LocationModal: React.FC<LocationModalProps> = ({ isOpen, onClose }) => {
  const {
    coords,
    cityName,
    isCustomCity,
    permissionStatus,
    refreshLocation,
    setCityManually,
  } = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);

  const filteredCities = POPULAR_INDONESIAN_CITIES.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.province.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDetectGPS = async () => {
    setIsDetecting(true);
    nativeBridge.hapticFeedback('medium');
    await refreshLocation();
    setIsDetecting(false);
    onClose();
  };

  const handleSelectCity = (city: IndonesianCity) => {
    nativeBridge.hapticFeedback('light');
    setCityManually(city);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pusat Lokasi & Radar Kota"
      subtitle="Pilih kota atau deteksi GPS untuk memindai konser dan gigs terdekat."
      maxWidth="lg"
    >
      <div className="space-y-5">
        {/* Current Active Location Banner */}
        <div className="p-4 rounded-2xl bg-[#18181b] border border-[#27272a] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#b7ff00]/10 border border-[#b7ff00]/30 flex items-center justify-center text-[#b7ff00] shrink-0">
              <Compass className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <p className="text-[11px] font-mono uppercase text-zinc-400">
                Pusat Radar Saat Ini {isCustomCity ? '• Dipilih Manual' : '• Terdeteksi GPS'}
              </p>
              <h3 className="text-base font-display font-bold text-white flex items-center gap-2">
                {cityName}
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
                  {coords.latitude.toFixed(4)}, {coords.longitude.toFixed(4)}
                </span>
              </h3>
            </div>
          </div>

          {/* Auto GPS Trigger Button */}
          <button
            onClick={handleDetectGPS}
            disabled={isDetecting}
            className="flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-[#b7ff00] text-black font-semibold text-xs hover:bg-[#c4ff2e] transition-all cursor-pointer shadow-[0_0_15px_rgba(183,255,0,0.2)] disabled:opacity-50 shrink-0"
          >
            {isDetecting ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Navigation className="w-3.5 h-3.5" />
            )}
            <span>{isDetecting ? 'Mencari GPS...' : 'Deteksi GPS Saya'}</span>
          </button>
        </div>

        {permissionStatus === 'denied' && (
          <p className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3.5 py-2.5 rounded-xl">
            ⚠️ Izin lokasi browser belum diaktifkan atau perangkat laptop tidak memiliki sensor GPS fisik. Anda dapat memilih kota di bawah ini untuk menjelajahi skena musik.
          </p>
        )}

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kota skena musik (cth: Bandung, Surabaya, Jogja, Bali)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#111113] border border-[#27272a] text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#b7ff00] transition-colors"
          />
        </div>

        {/* City Grid List */}
        <div>
          <p className="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-2.5">
            Daftar Kota Skena Musik ({filteredCities.length})
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
            {filteredCities.map((city) => {
              const isSelected = cityName.toLowerCase() === city.name.toLowerCase();
              return (
                <button
                  key={city.id}
                  onClick={() => handleSelectCity(city)}
                  className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#b7ff00]/10 border-[#b7ff00]/50 text-white shadow-[0_0_15px_rgba(183,255,0,0.1)]'
                      : 'bg-[#141416] border-[#27272a] hover:border-zinc-600 text-zinc-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <MapPin
                      className={`w-4 h-4 ${
                        isSelected ? 'text-[#b7ff00]' : 'text-zinc-500'
                      }`}
                    />
                    <div>
                      <p className="text-xs font-bold leading-tight">{city.name}</p>
                      <p className="text-[10px] text-zinc-500">{city.province}</p>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-[#b7ff00] text-black flex items-center justify-center">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
};
