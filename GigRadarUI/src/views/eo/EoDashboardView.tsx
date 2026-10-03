import React, { useState } from 'react';
import { Calendar, PlusCircle, ScanLine, DollarSign, Users, Ticket, ArrowUpRight, BarChart3, Edit, Trash2 } from 'lucide-react';
import { Event, Venue, Artist } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export interface EoDashboardViewProps {
  events: Event[];
  venues: Venue[];
  artists: Artist[];
  onOpenCreateEvent: () => void;
  onOpenGateValidator: () => void;
  onSelectEvent: (event: Event) => void;
  activeSection?: 'dashboard' | 'events' | 'tickets' | 'analytics';
}

export const EoDashboardView: React.FC<EoDashboardViewProps> = ({
  events,
  onOpenCreateEvent,
  onOpenGateValidator,
  onSelectEvent,
  activeSection = 'dashboard',
}) => {
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'events' | 'tickets' | 'analytics'>(activeSection);
  const [eventStatusFilter, setEventStatusFilter] = useState<'all' | 'Published' | 'Draft' | 'SoldOut'>('all');

  // Compute EO metrics
  const totalEvents = events.length;
  let totalTicketsSold = 0;
  let grossRevenue = 0;

  events.forEach((e) => {
    e.ticketTypes?.forEach((t) => {
      const sold = t.soldCount || 0;
      totalTicketsSold += sold;
      grossRevenue += sold * t.price;
    });
  });

  const filteredEvents = events.filter((e) => {
    if (eventStatusFilter === 'all') return true;
    return e.status === eventStatusFilter;
  });

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* Top Banner & Quick Actions */}
      <div className="p-6 rounded-3xl bg-[#111113] border border-[#27272a] shadow-xl flex flex-col sm:flex-row items-center sm:items-start justify-between gap-5 text-center sm:text-left">
        <div>
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#b7ff00] font-bold">
              Koloni Gigs • EO Management Console
            </span>
            <Badge variant="lime" size="sm">EO Mode</Badge>
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white mt-1">
            Dashboard Promotor & Event Organizer
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Kelola pertunjukan, pantau alokasi kuota tiket, dan validasi pengunjung gate venue.
          </p>
        </div>

        {/* Shortcuts */}
        <div className="flex flex-wrap gap-2.5">
          <Button
            variant="primary"
            size="md"
            onClick={onOpenCreateEvent}
            icon={<PlusCircle className="w-4 h-4" />}
          >
            Buat Event Baru
          </Button>
          <Button
            variant="secondary"
            size="md"
            onClick={onOpenGateValidator}
            icon={<ScanLine className="w-4 h-4 text-[#b7ff00]" />}
          >
            Buka Scanner Gate
          </Button>
        </div>
      </div>

      {/* KPI Cards (Section 31) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-[#111113] border border-[#27272a]">
          <span className="text-[10px] font-mono uppercase text-zinc-400">Gross Revenue (GMV)</span>
          <p className="font-display font-black text-2xl text-[#b7ff00] mt-1">
            IDR {(grossRevenue / 1000).toLocaleString('id-ID')}K
          </p>
          <span className="text-[10px] text-emerald-400 font-mono mt-0.5 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" /> +18.4% bulan ini
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#111113] border border-[#27272a]">
          <span className="text-[10px] font-mono uppercase text-zinc-400">Tiket Terjual</span>
          <p className="font-display font-black text-2xl text-white mt-1">
            {totalTicketsSold.toLocaleString('id-ID')}
          </p>
          <span className="text-[10px] text-zinc-400 font-mono mt-0.5 block">Dari seluruh gigs aktif</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#111113] border border-[#27272a]">
          <span className="text-[10px] font-mono uppercase text-zinc-400">Total Event Gigs</span>
          <p className="font-display font-black text-2xl text-white mt-1">
            {totalEvents}
          </p>
          <span className="text-[10px] text-[#b7ff00] font-mono mt-0.5 block">Di Jabodetabek & Bandung</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#111113] border border-[#27272a]">
          <span className="text-[10px] font-mono uppercase text-zinc-400">Tingkat Okupansi</span>
          <p className="font-display font-black text-2xl text-white mt-1">
            84.2%
          </p>
          <span className="text-[10px] text-emerald-400 font-mono mt-0.5 block">High Demand Venue</span>
        </div>
      </div>

      {/* Navigation Subtabs: Dashboard, Events, Tickets, Analytics */}
      <div className="flex gap-2 border-b border-[#27272a] pb-2 text-xs overflow-x-auto no-scrollbar">
        {[
          { id: 'dashboard', label: 'Ringkasan & Penjualan' },
          { id: 'events', label: `Daftar Event (${events.length})` },
          { id: 'tickets', label: 'Manajemen Alokasi Tiket' },
          { id: 'analytics', label: 'Grafik Analitik GMV' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setCurrentTab(tab.id as any)}
            className={`px-3.5 py-2 rounded-xl font-medium whitespace-nowrap transition-colors cursor-pointer ${
              currentTab === tab.id
                ? 'bg-[#18181b] text-[#b7ff00] font-bold border border-zinc-700 shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB: DASHBOARD & EVENTS LIST */}
      {(currentTab === 'dashboard' || currentTab === 'events') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-base text-white">Event yang Anda Kelola</h3>

            {/* Event Status Filter Tabs */}
            <div className="flex gap-1.5 text-xs">
              {(['all', 'Published', 'Draft', 'SoldOut'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setEventStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg border font-mono ${
                    eventStatusFilter === st
                      ? 'bg-zinc-800 text-white border-zinc-600'
                      : 'border-transparent text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {st === 'all' ? 'Semua' : st}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredEvents.map((evt) => {
              const eventTickets = evt.ticketTypes || [];
              const totalEventStock = eventTickets.reduce((a, b) => a + b.stock, 0);
              const totalEventSold = eventTickets.reduce((a, b) => a + (b.soldCount || 0), 0);

              return (
                <div
                  key={evt.eventId}
                  onClick={() => onSelectEvent(evt)}
                  className="p-4 rounded-2xl bg-[#111113] hover:bg-[#18181b] border border-[#27272a] hover:border-zinc-600 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
                >
                  <div className="flex gap-3.5 items-center">
                    <img
                      src={evt.posterUrl}
                      alt={evt.name}
                      className="w-16 h-20 rounded-xl object-cover bg-zinc-800 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-[#b7ff00] font-bold">{evt.genre?.name}</span>
                        <Badge variant={evt.status === 'Published' ? 'lime' : 'zinc'} size="sm">
                          {evt.status}
                        </Badge>
                      </div>
                      <h4 className="font-display font-bold text-base text-white mt-0.5">{evt.name}</h4>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        {evt.venue?.name} • {new Date(evt.startDate).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                  </div>

                  {/* Stock & Revenue Stats */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-zinc-800 text-xs">
                    <div>
                      <span className="text-[10px] text-zinc-400 font-mono block sm:text-right">Tiket Terjual</span>
                      <p className="font-bold text-sm text-white sm:text-right">
                        {totalEventSold} / {totalEventStock + totalEventSold}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-[#b7ff00] sm:mt-1">
                      IDR {evt.minPrice.toLocaleString('id-ID')} - {evt.maxPrice.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB: TICKETS MANAGEMENT (Section 34) */}
      {currentTab === 'tickets' && (
        <div className="p-6 rounded-3xl bg-[#111113] border border-[#27272a] space-y-4">
          <h3 className="font-display font-bold text-base text-white">Kelola Alokasi Kuota Kategori Tiket</h3>
          <p className="text-xs text-zinc-400">
            Penyesuaian kuota tiket secara langsung memengaruhi radar penemuan pengguna.
          </p>

          <div className="space-y-3">
            {events.flatMap((e) =>
              (e.ticketTypes || []).map((t) => (
                <div
                  key={t.eventTicketTypeId}
                  className="p-4 rounded-xl bg-[#18181b] border border-[#27272a] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500">{e.name}</span>
                    <h5 className="font-bold text-sm text-white">{t.name}</h5>
                    <p className="text-zinc-400 mt-0.5">{t.description}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase">Harga</span>
                      <p className="font-bold text-white text-sm">IDR {t.price.toLocaleString('id-ID')}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase">Sisa Kuota</span>
                      <p className={`font-bold text-sm ${t.stock === 0 ? 'text-red-400' : 'text-[#b7ff00]'}`}>
                        {t.stock} tiket
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB: ANALYTICS (Section 35) */}
      {currentTab === 'analytics' && (
        <div className="p-6 rounded-3xl bg-[#111113] border border-[#27272a] space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-base text-white">Performa Penjualan & GMV</h3>
              <p className="text-xs text-zinc-400 mt-0.5">Analisis konversi dari radar pencarian ke checkout tiket</p>
            </div>
            <span className="text-xs font-mono text-[#b7ff00] font-bold">Oktober 2026</span>
          </div>

          {/* Visual Bar Chart Breakdown */}
          <div className="space-y-4 pt-2">
            {[
              { label: 'Night of Shoegaze', sold: 135, capacity: 200, revenue: 5850000 },
              { label: 'Midwest Emo Fest', sold: 180, capacity: 400, revenue: 7600000 },
              { label: 'Underground Indie Showcase', sold: 195, capacity: 500, revenue: 5850000 },
              { label: 'Hardcore Matinee', sold: 40, capacity: 200, revenue: 800000 },
            ].map((item, idx) => {
              const pct = Math.round((item.sold / item.capacity) * 100);
              return (
                <div key={idx} className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="font-bold text-white">{item.label}</span>
                    <span className="font-mono text-[#b7ff00]">
                      IDR {item.revenue.toLocaleString('id-ID')} ({pct}% Okupansi)
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-lime-500 to-[#b7ff00] rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
