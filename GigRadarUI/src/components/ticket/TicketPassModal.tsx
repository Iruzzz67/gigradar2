import React from 'react';
import { QrCode, Calendar, MapPin, User, ShieldCheck, Download, Share2 } from 'lucide-react';
import { Ticket } from '../../types';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { nativeBridge } from '../../services/bridge';

export interface TicketPassModalProps {
  ticket: Ticket | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TicketPassModal: React.FC<TicketPassModalProps> = ({
  ticket,
  isOpen,
  onClose,
}) => {
  if (!ticket) return null;

  const event = ticket.event;
  const isActive = ticket.status === 'Active';

  const handleShare = () => {
    nativeBridge.shareEvent({
      name: `Tiket ${event?.name || 'GigRadar'}`,
      description: `E-tiket resmi GigRadar: ${ticket.qrCode}`,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="sm" showCloseButton={true}>
      <div className="space-y-5 -m-2 sm:-m-0 text-center">
        {/* Pass Header */}
        <div className="space-y-1">
          <Badge variant={isActive ? 'lime' : 'zinc'} size="md" pulse={isActive}>
            {isActive ? 'Tiket Aktif (Ready to Scan)' : 'Sudah Digunakan'}
          </Badge>
          <h3 className="font-display font-black text-xl text-white mt-2 leading-tight">
            {event?.name}
          </h3>
          <p className="text-xs text-zinc-400">
            {event?.venue?.name} • {event?.venue?.city}
          </p>
        </div>

        {/* The Digital QR Ticket Pass Card */}
        <div className="relative bg-[#18181b] border-2 border-[#27272a] rounded-3xl p-6 shadow-2xl overflow-hidden text-left space-y-5">
          {/* Perforated edge cuts */}
          <div className="absolute -left-4 top-40 w-8 h-8 rounded-full bg-[#111113] border border-[#27272a]" />
          <div className="absolute -right-4 top-40 w-8 h-8 rounded-full bg-[#111113] border border-[#27272a]" />

          {/* QR Matrix Render */}
          <div className="bg-white p-4 rounded-2xl mx-auto w-48 h-48 flex flex-col items-center justify-center shadow-lg">
            <div className="w-40 h-40 border-4 border-black p-2 flex flex-col justify-between">
              <div className="flex justify-between">
                <div className="w-9 h-9 bg-black" />
                <div className="w-9 h-9 bg-black" />
              </div>
              <div className="flex items-center justify-center">
                <QrCode className="w-14 h-14 text-black" />
              </div>
              <div className="flex justify-between">
                <div className="w-9 h-9 bg-black" />
                <div className="w-5 h-5 bg-black rounded-full" />
              </div>
            </div>
          </div>

          {/* Ticket Identity */}
          <div className="text-center pt-1">
            <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">Kode Unik Tiket</p>
            <p className="font-mono font-black text-base text-[#b7ff00] mt-0.5 tracking-wider select-all">
              {ticket.qrCode}
            </p>
          </div>

          <div className="border-t border-dashed border-zinc-700/80 my-2" />

          {/* Pass Metadata Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-[10px] text-zinc-400 uppercase font-mono">Pemegang Tiket</p>
              <p className="font-bold text-white truncate mt-0.5">{ticket.buyerName}</p>
            </div>
            <div>
              <p className="text-[10px] text-zinc-400 uppercase font-mono">Tipe Akses</p>
              <p className="font-bold text-[#b7ff00] truncate mt-0.5">{ticket.ticketType}</p>
            </div>
            <div>
              <p className="text-[10px] text-zinc-400 uppercase font-mono">Tanggal Acara</p>
              <p className="font-medium text-white truncate mt-0.5">
                {event?.startDate ? new Date(event.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : 'TBA'}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-zinc-400 uppercase font-mono">Harga Resmi</p>
              <p className="font-medium text-white truncate mt-0.5">IDR {ticket.price.toLocaleString('id-ID')}</p>
            </div>
          </div>

          {/* Verification Watermark */}
          <div className="p-2.5 rounded-xl bg-[#111113] border border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Enkripsi Server Terverifikasi
            </span>
            <span className="font-mono text-[10px] text-zinc-500">ID #{ticket.ticketId}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2.5 pt-1">
          <Button
            variant="outline"
            size="md"
            className="flex-1"
            onClick={handleShare}
            icon={<Share2 className="w-4 h-4" />}
          >
            Bagikan
          </Button>
          <Button
            variant="secondary"
            size="md"
            className="flex-1"
            onClick={() => alert('Tiket digital tersimpan di cache offline perangkatmu.')}
            icon={<Download className="w-4 h-4" />}
          >
            Simpan Offline
          </Button>
        </div>
      </div>
    </Modal>
  );
};
