import React from 'react';
import { QrCode, Calendar, MapPin, CheckCircle2, Clock } from 'lucide-react';
import { Ticket } from '../../types';
import { Badge } from '../ui/Badge';

export interface TicketCardProps {
  ticket: Ticket;
  onClick: (ticket: Ticket) => void;
}

export const TicketCard: React.FC<TicketCardProps> = ({ ticket, onClick }) => {
  const event = ticket.event;
  const isActive = ticket.status === 'Active';

  return (
    <div
      onClick={() => onClick(ticket)}
      className="relative bg-[#111113] hover:bg-[#18181b] border border-[#27272a] hover:border-zinc-600 rounded-2xl overflow-hidden p-4 sm:p-5 transition-all duration-300 cursor-pointer shadow-md select-none group"
    >
      {/* Decorative Ticket Notches */}
      <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#09090b] border border-[#27272a]" />
      <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#09090b] border border-[#27272a]" />

      <div className="flex gap-4 items-center">
        {/* Poster Thumbnail */}
        <div className="relative w-16 h-20 sm:w-20 sm:h-24 rounded-xl overflow-hidden bg-zinc-800 shrink-0 ring-1 ring-zinc-700">
          <img
            src={event?.posterUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80'}
            alt="Event poster"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-2">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#b7ff00] font-bold">
              {ticket.ticketType}
            </span>
            <Badge variant={isActive ? 'lime' : 'zinc'} size="sm" pulse={isActive}>
              {isActive ? 'Aktif' : 'Sudah Digunakan'}
            </Badge>
          </div>

          <h4 className="font-display font-bold text-sm sm:text-base text-white truncate group-hover:text-[#b7ff00] transition-colors">
            {event?.name || 'Underground Gig'}
          </h4>

          <div className="mt-1.5 space-y-0.5 text-xs text-zinc-400">
            <div className="flex items-center gap-1.5 truncate">
              <Calendar className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
              <span>
                {event?.startDate
                  ? new Date(event.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                  : 'Tanggal TBA'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
              <span className="truncate">{event?.venue?.name || 'Venue TBA'}</span>
            </div>
          </div>
        </div>

        {/* QR Action Button */}
        <div className="hidden sm:flex flex-col items-center justify-center pl-3 border-l border-zinc-800/80 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-zinc-800/60 border border-zinc-700 flex items-center justify-center text-[#b7ff00] group-hover:scale-110 transition-transform">
            <QrCode className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-mono text-zinc-500 mt-1">Buka QR</span>
        </div>
      </div>
    </div>
  );
};
