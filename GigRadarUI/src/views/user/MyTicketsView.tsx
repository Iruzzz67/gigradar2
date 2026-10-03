import React, { useState } from 'react';
import { Ticket as TicketIcon, Compass, Sparkles } from 'lucide-react';
import { Ticket } from '../../types';
import { TicketCard } from '../../components/ticket/TicketCard';
import { TicketPassModal } from '../../components/ticket/TicketPassModal';
import { EmptyState } from '../../components/ui/EmptyState';

export interface MyTicketsViewProps {
  tickets: Ticket[];
  onExploreGigs: () => void;
}

export const MyTicketsView: React.FC<MyTicketsViewProps> = ({
  tickets,
  onExploreGigs,
}) => {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const activeTickets = tickets.filter((t) => t.status === 'Active');
  const pastTickets = tickets.filter((t) => t.status === 'Used');

  const displayedTickets = activeTab === 'upcoming' ? activeTickets : pastTickets;

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* Header */}
      <div>
        <h1 className="font-display font-black text-2xl sm:text-3xl text-white">
          Tiket Skena Saya
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          Akses kode QR dan tanda masuk resmi pertunjukan gig underground kamu.
        </p>
      </div>

      {/* Tabs: Upcoming vs Past (Section 29) */}
      <div className="flex gap-2 p-1.5 rounded-2xl bg-[#111113] border border-[#27272a] text-xs font-semibold max-w-sm">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`flex-1 py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'upcoming'
              ? 'bg-[#18181b] text-[#b7ff00] border border-zinc-700 font-bold shadow-sm'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Mendatang ({activeTickets.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`flex-1 py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'past'
              ? 'bg-[#18181b] text-[#b7ff00] border border-zinc-700 font-bold shadow-sm'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <TicketIcon className="w-3.5 h-3.5" />
          <span>Selesai / Terpakai ({pastTickets.length})</span>
        </button>
      </div>

      {/* Ticket List Feed */}
      {displayedTickets.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {displayedTickets.map((ticket) => (
            <TicketCard
              key={ticket.ticketId}
              ticket={ticket}
              onClick={(t) => setSelectedTicket(t)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title={activeTab === 'upcoming' ? 'Belum Ada Tiket Aktif' : 'Belum Ada Riwayat Tiket'}
          description={
            activeTab === 'upcoming'
              ? 'Kamu belum memiliki tiket untuk pertunjukan mendatang. Jelajahi radar untuk menemukan gig seru akhir pekan ini!'
              : 'Riwayat tiket yang sudah kamu gunakan di gerbang venue akan tersimpan di sini.'
          }
          actionLabel="Temukan Gig Sekarang"
          onAction={onExploreGigs}
        />
      )}

      {/* Full Ticket QR Pass Modal */}
      <TicketPassModal
        ticket={selectedTicket}
        isOpen={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
      />
    </div>
  );
};
