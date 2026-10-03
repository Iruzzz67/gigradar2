import React, { useState } from 'react';
import { Plus, Trash2, ArrowRight, ArrowLeft, Check, Calendar, MapPin, Sparkles } from 'lucide-react';
import { Event, Venue, Artist, EventTicketType } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { api } from '../../services/api';
import { storage } from '../../services/storage';

export interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated: (event: Event) => void;
  venues: Venue[];
  artists: Artist[];
  userId: number;
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({
  isOpen,
  onClose,
  onEventCreated,
  venues,
  artists,
  userId,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [posterUrl, setPosterUrl] = useState('https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80');
  const [startDate, setStartDate] = useState('2026-11-05T20:00');
  const [endDate, setEndDate] = useState('2026-11-05T23:30');
  const [genreId, setGenreId] = useState(1);

  // Venue
  const [venueId, setVenueId] = useState(venues[0]?.venueId || 1);

  // Lineup
  const [selectedArtistIds, setSelectedArtistIds] = useState<number[]>([1]);

  // Ticket Tiers
  const [ticketTiers, setTicketTiers] = useState<Omit<EventTicketType, 'eventTicketTypeId' | 'eventId'>[]>([
    { name: 'Early Bird', description: 'Akses festival berdiri kuota terbatas', price: 30000, stock: 50, sortOrder: 1 },
    { name: 'General Admission', description: 'Akses reguler berdiri + official sticker pack', price: 45000, stock: 150, sortOrder: 2 },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleArtistSelection = (artistId: number) => {
    setSelectedArtistIds((prev) =>
      prev.includes(artistId) ? prev.filter((id) => id !== artistId) : [...prev, artistId]
    );
  };

  const handleAddTicketTier = () => {
    setTicketTiers((prev) => [
      ...prev,
      { name: 'VIP Pass', description: 'Akses prioritas + merchandise eksklusif', price: 80000, stock: 30, sortOrder: prev.length + 1 },
    ]);
  };

  const handleRemoveTicketTier = (index: number) => {
    setTicketTiers((prev) => prev.filter((_, i) => i !== index));
  };

  const handleTierChange = (index: number, field: string, value: any) => {
    setTicketTiers((prev) => {
      const updated = [...prev];
      (updated[index] as any)[field] = value;
      return updated;
    });
  };

  const handleSave = async (publishStatus: 'Published' | 'Draft' = 'Published') => {
    setIsSubmitting(true);
    try {
      const selectedVenue = venues.find((v) => v.venueId === venueId) || venues[0];
      const selectedArtists = artists.filter((a) => selectedArtistIds.includes(a.artistId));
      const genres = storage.getGenres();
      const selectedGenre = genres.find((g) => g.genreId === genreId) || genres[0];

      const minPrice = Math.min(...ticketTiers.map((t) => t.price), 0);
      const maxPrice = Math.max(...ticketTiers.map((t) => t.price), 0);
      const capacity = ticketTiers.reduce((acc, t) => acc + t.stock, 0);

      const newEventId = Date.now();

      const createdEvent: Event = {
        eventId: newEventId,
        name,
        description,
        posterUrl,
        venueId: selectedVenue.venueId,
        venue: selectedVenue,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        latitude: selectedVenue.latitude,
        longitude: selectedVenue.longitude,
        genreId: selectedGenre.genreId,
        genre: selectedGenre,
        createdBy: userId,
        status: publishStatus,
        minPrice,
        maxPrice,
        capacity,
        viewsCount: 0,
        savesCount: 0,
        artists: selectedArtists,
        ticketTypes: ticketTiers.map((t, idx) => ({
          ...t,
          eventTicketTypeId: newEventId + idx,
          eventId: newEventId,
          soldCount: 0,
        })),
      };

      await api.saveEvent(createdEvent);
      onEventCreated(createdEvent);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="xl" title="Wizard Pembuatan Gig Baru" subtitle="Langkah 1 s/d 5">
      <div className="space-y-6">
        {/* Step Indicator */}
        <div className="grid grid-cols-5 gap-2 text-center text-xs font-mono pb-2 border-b border-[#27272a]">
          {[
            { num: 1, label: 'Info Dasar' },
            { num: 2, label: 'Pilih Venue' },
            { num: 3, label: 'Lineup' },
            { num: 4, label: 'Kategori Tiket' },
            { num: 5, label: 'Publikasi' },
          ].map((s) => (
            <div
              key={s.num}
              className={`p-1.5 rounded-lg border transition-all ${
                step === s.num
                  ? 'bg-[#18181b] border-[#b7ff00] text-[#b7ff00] font-bold'
                  : step > s.num
                  ? 'border-zinc-700 text-zinc-300'
                  : 'border-zinc-800 text-zinc-600'
              }`}
            >
              <span className="block text-[10px]">0{s.num}</span>
              <span className="truncate hidden sm:block">{s.label}</span>
            </div>
          ))}
        </div>

        {/* STEP 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Nama Acara / Gig</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Jakarta Noise Fest Vol. 2"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#18181b] border border-[#27272a] focus:border-[#b7ff00] text-sm text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Deskripsi Acara</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Jelaskan konsep acara, atmosfer, dan arahan dresscode/ketentuan..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#18181b] border border-[#27272a] focus:border-[#b7ff00] text-sm text-white outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Mulai</label>
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#18181b] border border-[#27272a] text-xs text-white outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Selesai</label>
                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#18181b] border border-[#27272a] text-xs text-white outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Genre Utama</label>
              <select
                value={genreId}
                onChange={(e) => setGenreId(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#18181b] border border-[#27272a] text-xs text-white outline-none"
              >
                {storage.getGenres().map((g) => (
                  <option key={g.genreId} value={g.genreId}>
                    {g.icon} {g.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* STEP 2: Venue Selection */}
        {step === 2 && (
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-zinc-300">Pilih Lokasi Venue</label>
            <div className="space-y-2">
              {venues.map((v) => {
                const isSelected = venueId === v.venueId;
                return (
                  <div
                    key={v.venueId}
                    onClick={() => setVenueId(v.venueId)}
                    className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#18181b] border-[#b7ff00] text-white ring-1 ring-[#b7ff00]'
                        : 'bg-[#18181b]/50 border-[#27272a] text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    <div>
                      <h5 className="font-bold text-sm text-white">{v.name}</h5>
                      <p className="text-xs text-zinc-400 mt-0.5">{v.address} • {v.city}</p>
                    </div>
                    <span className="text-xs font-mono text-[#b7ff00]">Kapasitas: {v.capacity}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 3: Lineup Selection */}
        {step === 3 && (
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-zinc-300">Pilih Band / Penampil (Lineup)</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {artists.map((artist) => {
                const isSelected = selectedArtistIds.includes(artist.artistId);
                return (
                  <div
                    key={artist.artistId}
                    onClick={() => toggleArtistSelection(artist.artistId)}
                    className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#18181b] border-[#b7ff00] ring-1 ring-[#b7ff00]'
                        : 'bg-[#18181b]/50 border-[#27272a] hover:border-zinc-700'
                    }`}
                  >
                    <img src={artist.photoUrl} alt={artist.name} className="w-10 h-10 rounded-lg object-cover" />
                    <div className="truncate flex-1">
                      <p className="font-bold text-xs text-white truncate">{artist.name}</p>
                      <p className="text-[10px] text-zinc-400">{artist.genre} • {artist.city}</p>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-[#b7ff00] shrink-0" />}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 4: Ticket Tiers */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-zinc-300">Kategori & Harga Tiket</label>
              <button
                type="button"
                onClick={handleAddTicketTier}
                className="flex items-center gap-1 text-xs text-[#b7ff00] hover:underline cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Tambah Kategori
              </button>
            </div>

            <div className="space-y-3">
              {ticketTiers.map((tier, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-[#18181b] border border-[#27272a] space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      value={tier.name}
                      onChange={(e) => handleTierChange(idx, 'name', e.target.value)}
                      placeholder="Nama kategori (e.g. Festival, VIP)"
                      className="font-bold text-sm text-white bg-transparent border-b border-zinc-700 focus:border-[#b7ff00] pb-1 outline-none flex-1"
                    />
                    {ticketTiers.length > 1 && (
                      <button
                        onClick={() => handleRemoveTicketTier(idx)}
                        className="text-zinc-500 hover:text-red-400 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="text-[10px] text-zinc-400">Harga (IDR)</label>
                      <input
                        type="number"
                        value={tier.price}
                        onChange={(e) => handleTierChange(idx, 'price', Number(e.target.value))}
                        className="w-full p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-zinc-400">Alokasi Kuota / Stok</label>
                      <input
                        type="number"
                        value={tier.stock}
                        onChange={(e) => handleTierChange(idx, 'stock', Number(e.target.value))}
                        className="w-full p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 5: Final Review & Publish */}
        {step === 5 && (
          <div className="space-y-4 text-center py-2">
            <div className="w-14 h-14 rounded-2xl bg-[#b7ff00]/15 text-[#b7ff00] border border-[#b7ff00]/30 flex items-center justify-center mx-auto">
              <Sparkles className="w-7 h-7" />
            </div>
            <div>
              <h4 className="font-display font-bold text-lg text-white">Siap Untuk Diluncurkan!</h4>
              <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                Gig akan langsung tampil di Radar spasial pengguna terdekat dan siap untuk melayani pembelian tiket.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#18181b] border border-[#27272a] text-left text-xs space-y-1.5">
              <p><strong className="text-white">Nama:</strong> {name || 'Gig Tanpa Judul'}</p>
              <p><strong className="text-white">Venue:</strong> {venues.find((v) => v.venueId === venueId)?.name}</p>
              <p><strong className="text-white">Penampil:</strong> {selectedArtistIds.length} Band terpilih</p>
              <p><strong className="text-white">Total Tiket:</strong> {ticketTiers.reduce((a, b) => a + b.stock, 0)} tiket</p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                size="md"
                className="flex-1"
                isLoading={isSubmitting}
                onClick={() => handleSave('Draft')}
              >
                Simpan Draft
              </Button>
              <Button
                variant="primary"
                size="md"
                className="flex-1"
                isLoading={isSubmitting}
                onClick={() => handleSave('Published')}
              >
                Publikasikan Sekarang
              </Button>
            </div>
          </div>
        )}

        {/* Bottom Wizard Stepper Navigation */}
        {step < 5 && (
          <div className="flex justify-between pt-3 border-t border-[#27272a]">
            <Button
              variant="ghost"
              size="sm"
              disabled={step === 1}
              onClick={() => setStep((prev) => (prev - 1) as any)}
              icon={<ArrowLeft className="w-4 h-4" />}
            >
              Sebelumnya
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setStep((prev) => (prev + 1) as any)}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Selanjutnya
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};
