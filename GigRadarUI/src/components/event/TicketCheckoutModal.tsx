import React, { useState } from 'react';
import { CheckCircle2, Ticket as TicketIcon, AlertCircle, ArrowRight, QrCode } from 'lucide-react';
import { Event, EventTicketType, Ticket } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { nativeBridge } from '../../services/bridge';

export interface TicketCheckoutModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
  onTicketPurchased?: (ticket: Ticket) => void;
}

export const TicketCheckoutModal: React.FC<TicketCheckoutModalProps> = ({
  event,
  isOpen,
  onClose,
  onTicketPurchased,
}) => {
  const { currentUser } = useAuth();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedTicketType, setSelectedTicketType] = useState<EventTicketType | null>(null);
  const [quantity, setQuantity] = useState<number>(1);

  // Form Fields
  const [fullName, setFullName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState('081234567890');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [dateOfBirth, setDateOfBirth] = useState('2002-08-15');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [purchasedTickets, setPurchasedTickets] = useState<Ticket[]>([]);

  if (!event) return null;

  const ticketTypes = event.ticketTypes || [];

  const handleSelectTier = (tier: EventTicketType) => {
    if (tier.stock <= 0) return;
    setSelectedTicketType(tier);
    setErrorMessage('');
  };

  const handleProceedToDetails = () => {
    if (!selectedTicketType) {
      setErrorMessage('Silakan pilih salah satu kategori tiket terlebih dahulu.');
      return;
    }
    setStep(2);
  };

  const handleConfirmPurchase = async () => {
    setErrorMessage('');

    // Validation per Section 27:
    // Name >= 3 chars, phone >= 9 digits, valid email, age >= 17
    if (!fullName.trim() || fullName.trim().length < 3) {
      setErrorMessage('Nama lengkap minimal harus 3 karakter.');
      return;
    }
    if (!phone || phone.replace(/\D/g, '').length < 9) {
      setErrorMessage('Nomor telepon minimal harus 9 digit.');
      return;
    }
    if (!email.includes('@') || !email.includes('.')) {
      setErrorMessage('Format alamat email tidak valid.');
      return;
    }

    // Age calculation
    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    if (age < 17) {
      setErrorMessage('Syarat usia pengunjung minimal 17 tahun.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.buyTicket({
        eventId: event.eventId,
        userId: currentUser?.userId || 4,
        ticketTypeId: selectedTicketType!.eventTicketTypeId,
        quantity,
        buyerName: fullName,
        buyerPhone: phone,
        buyerEmail: email,
        buyerDateOfBirth: dateOfBirth,
      });

      if (res.success && res.tickets.length > 0) {
        nativeBridge.hapticFeedback('success');
        setPurchasedTickets(res.tickets);
        onTicketPurchased?.(res.tickets[0]);
        setStep(3);
      } else {
        setErrorMessage(res.error || 'Gagal memproses transaksi tiket.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetAndClose = () => {
    setStep(1);
    setSelectedTicketType(null);
    setQuantity(1);
    setErrorMessage('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleResetAndClose}
      maxWidth="lg"
      title={step === 3 ? 'Pembelian Berhasil!' : 'Pemesanan Tiket'}
      subtitle={event.name}
    >
      <div className="space-y-6">
        {/* Step Progression Bar */}
        <div className="flex items-center justify-between px-2 pb-2 border-b border-[#27272a] text-xs font-mono">
          <div className={`flex items-center gap-1.5 ${step >= 1 ? 'text-[#b7ff00] font-bold' : 'text-zinc-600'}`}>
            <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px]">
              1
            </span>
            <span>Pilih Tiket</span>
          </div>
          <div className="w-8 h-[1px] bg-zinc-800" />
          <div className={`flex items-center gap-1.5 ${step >= 2 ? 'text-[#b7ff00] font-bold' : 'text-zinc-600'}`}>
            <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px]">
              2
            </span>
            <span>Data Pengunjung</span>
          </div>
          <div className="w-8 h-[1px] bg-zinc-800" />
          <div className={`flex items-center gap-1.5 ${step === 3 ? 'text-[#b7ff00] font-bold' : 'text-zinc-600'}`}>
            <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px]">
              3
            </span>
            <span>E-Tiket Selesai</span>
          </div>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2.5 text-xs text-red-400 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* STEP 1: Select Category */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-2.5">
              {ticketTypes.map((tier) => {
                const isSelected = selectedTicketType?.eventTicketTypeId === tier.eventTicketTypeId;
                const isSoldOut = tier.stock <= 0;
                return (
                  <div
                    key={tier.eventTicketTypeId}
                    onClick={() => !isSoldOut && handleSelectTier(tier)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer select-none flex items-center justify-between ${
                      isSoldOut
                        ? 'opacity-40 bg-zinc-900 border-zinc-800 cursor-not-allowed'
                        : isSelected
                        ? 'bg-[#18181b] border-[#b7ff00] shadow-[0_0_20px_rgba(183,255,0,0.15)] ring-1 ring-[#b7ff00]'
                        : 'bg-[#18181b]/60 border-[#27272a] hover:border-zinc-600 hover:bg-[#18181b]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-sm text-white">{tier.name}</p>
                        {isSoldOut ? (
                          <Badge variant="danger" size="sm">Habis</Badge>
                        ) : tier.stock <= 20 ? (
                          <Badge variant="warning" size="sm">Sisa {tier.stock}</Badge>
                        ) : (
                          <Badge variant="lime" size="sm">Tersedia</Badge>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400 mt-1 max-w-xs">{tier.description}</p>
                    </div>

                    <div className="text-right shrink-0 ml-3">
                      <p className="font-display font-bold text-base text-[#b7ff00]">
                        IDR {tier.price.toLocaleString('id-ID')}
                      </p>
                      <span className="text-[11px] text-zinc-500 font-mono">per tiket</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quantity Selector */}
            {selectedTicketType && (
              <div className="p-4 rounded-xl bg-[#18181b] border border-[#27272a] flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-white">Jumlah Tiket</p>
                  <p className="text-[11px] text-zinc-400 font-mono">Maksimal 4 tiket per akun</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-bold flex items-center justify-center cursor-pointer"
                  >
                    -
                  </button>
                  <span className="font-display font-bold text-base text-white w-6 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(4, Math.min(selectedTicketType.stock, quantity + 1)))}
                    className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-bold flex items-center justify-center cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            <Button
              variant="primary"
              size="lg"
              className="w-full mt-4"
              disabled={!selectedTicketType}
              onClick={handleProceedToDetails}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Lanjut ke Data Pemesan
            </Button>
          </div>
        )}

        {/* STEP 2: Attendee Form & Review */}
        {step === 2 && (
          <div className="space-y-4">
            {/* Form Fields */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Nama Lengkap (sesuai KTP/Identitas)
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nama lengkap pengunjung"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#18181b] border border-[#27272a] focus:border-[#b7ff00] text-sm text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Nomor WhatsApp / HP
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0812xxxxxxx"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#18181b] border border-[#27272a] focus:border-[#b7ff00] text-sm text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Tanggal Lahir (Min 17 Tahun)
                  </label>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#18181b] border border-[#27272a] focus:border-[#b7ff00] text-sm text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Alamat Email (Pengiriman E-Tiket)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#18181b] border border-[#27272a] focus:border-[#b7ff00] text-sm text-white outline-none"
                />
              </div>
            </div>

            {/* Order Review Box */}
            <div className="p-4 rounded-xl bg-[#18181b] border border-[#27272a] space-y-2">
              <div className="flex justify-between text-xs text-zinc-400">
                <span>Kategori</span>
                <span className="font-semibold text-white">{selectedTicketType?.name} x {quantity}</span>
              </div>
              <div className="flex justify-between text-xs text-zinc-400">
                <span>Harga Satuan</span>
                <span>IDR {selectedTicketType?.price.toLocaleString('id-ID')}</span>
              </div>
              <div className="pt-2 border-t border-zinc-800 flex justify-between items-center">
                <span className="text-sm font-bold text-white">Total Pembayaran</span>
                <span className="font-display font-extrabold text-lg text-[#b7ff00]">
                  IDR {((selectedTicketType?.price || 0) * quantity).toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                size="md"
                className="w-1/3"
                onClick={() => setStep(1)}
              >
                Kembali
              </Button>
              <Button
                variant="primary"
                size="md"
                className="w-2/3"
                isLoading={isLoading}
                onClick={handleConfirmPurchase}
              >
                Konfirmasi & Bayar
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: Ticket Success with QR */}
        {step === 3 && (
          <div className="space-y-5 text-center py-2">
            <div className="w-16 h-16 rounded-full bg-[#b7ff00]/15 text-[#b7ff00] border border-[#b7ff00]/40 flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(183,255,0,0.3)]">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="font-display font-bold text-xl text-white">E-Tiket Berhasil Diterbitkan!</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Tunjukkan QR code ini kepada petugas gate saat memasuki venue.
              </p>
            </div>

            {purchasedTickets.length > 0 && (
              <div className="p-5 rounded-2xl bg-[#18181b] border border-[#27272a] max-w-xs mx-auto space-y-4 shadow-xl">
                {/* Visual SVG QR Code Matrix */}
                <div className="bg-white p-3 rounded-xl mx-auto w-44 h-44 flex flex-col items-center justify-center shadow-inner">
                  <div className="w-36 h-36 border-4 border-black p-2 flex flex-col justify-between">
                    <div className="flex justify-between">
                      <div className="w-8 h-8 bg-black" />
                      <div className="w-8 h-8 bg-black" />
                    </div>
                    <div className="flex items-center justify-center">
                      <QrCode className="w-12 h-12 text-black" />
                    </div>
                    <div className="flex justify-between">
                      <div className="w-8 h-8 bg-black" />
                      <div className="w-4 h-4 bg-black rounded-full" />
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">Kode Tiket</p>
                  <p className="font-mono font-bold text-sm text-[#b7ff00] mt-0.5 tracking-wider">
                    {purchasedTickets[0].qrCode}
                  </p>
                </div>

                <div className="pt-2 border-t border-zinc-800 text-left text-xs space-y-1">
                  <p className="text-zinc-400"><strong className="text-white">Pemilik:</strong> {purchasedTickets[0].buyerName}</p>
                  <p className="text-zinc-400"><strong className="text-white">Jenis:</strong> {purchasedTickets[0].ticketType}</p>
                  <p className="text-zinc-400"><strong className="text-white">Status:</strong> <span className="text-emerald-400 font-bold">ACTIVE</span></p>
                </div>
              </div>
            )}

            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={handleResetAndClose}
              icon={<TicketIcon className="w-4 h-4" />}
            >
              Lihat di Daftar Tiket Saya
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};
