import React, { useState } from 'react';
import { Shield, ShieldAlert, Users, Calendar, Check, X, Search, CheckCircle2, AlertCircle } from 'lucide-react';
import { User, RoleRequest, Event, Role } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { storage } from '../../services/storage';
import { nativeBridge } from '../../services/bridge';

export interface AdminDashboardViewProps {
  users: User[];
  roleRequests: RoleRequest[];
  events: Event[];
  onRefreshData: () => void;
  onSelectEvent: (event: Event) => void;
  activeSection?: 'dashboard' | 'roles' | 'users' | 'events';
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  users,
  roleRequests,
  events,
  onRefreshData,
  onSelectEvent,
  activeSection = 'dashboard',
}) => {
  const [currentSection, setCurrentSection] = useState<'dashboard' | 'roles' | 'users' | 'events'>(activeSection);
  const [userRoleFilter, setUserRoleFilter] = useState<'All' | Role>('All');
  const [userSearch, setUserSearch] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const pendingRequests = roleRequests.filter((r) => r.status === 'Pending');

  const handleApprove = (requestId: number) => {
    nativeBridge.hapticFeedback('success');
    storage.approveRoleRequest(requestId, 1);
    setActionNotice('Permohonan role berhasil disetujui! Pengguna telah ditingkatkan role-nya.');
    onRefreshData();
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleReject = (requestId: number) => {
    nativeBridge.hapticFeedback('error');
    storage.rejectRoleRequest(requestId, 1);
    setActionNotice('Permohonan role telah ditolak.');
    onRefreshData();
    setTimeout(() => setActionNotice(null), 4000);
  };

  const filteredUsers = users.filter((u) => {
    const matchRole = userRoleFilter === 'All' || u.role === userRoleFilter;
    const matchSearch =
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase());
    return matchRole && matchSearch;
  });

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* Admin Control Center Header */}
      <div className="p-6 rounded-3xl bg-[#111113] border border-[#27272a] shadow-xl flex flex-col sm:flex-row items-center sm:items-start justify-between gap-5 text-center sm:text-left">
        <div>
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#b7ff00] font-bold">
              Control Center & Moderasi
            </span>
            <Badge variant="lime" size="sm">Admin Authority</Badge>
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white mt-1">
            GigRadar Platform Governance
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Kelola izin hak akses role, moderasi publikasi event, dan direktori pengguna global.
          </p>
        </div>

        {pendingRequests.length > 0 && (
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
            <ShieldAlert className="w-5 h-5 text-amber-400 animate-pulse" />
            <span>
              <strong>{pendingRequests.length} Permohonan Role</strong> menunggu verifikasi
            </span>
          </div>
        )}
      </div>

      {actionNotice && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-xs text-emerald-300 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* KPI Overview (Section 42) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-[#111113] border border-[#27272a]">
          <span className="text-[10px] font-mono uppercase text-zinc-400">Total Pengguna Terdaftar</span>
          <p className="font-display font-black text-2xl text-white mt-1">{users.length}</p>
          <span className="text-[10px] text-zinc-500 font-mono mt-0.5 block">Akun aktif</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#111113] border border-[#27272a]">
          <span className="text-[10px] font-mono uppercase text-zinc-400">Antrian Verifikasi Role</span>
          <p className={`font-display font-black text-2xl mt-1 ${pendingRequests.length > 0 ? 'text-amber-400' : 'text-white'}`}>
            {pendingRequests.length}
          </p>
          <span className="text-[10px] text-zinc-500 font-mono mt-0.5 block">Artist & EO</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#111113] border border-[#27272a]">
          <span className="text-[10px] font-mono uppercase text-zinc-400">Event Global</span>
          <p className="font-display font-black text-2xl text-white mt-1">{events.length}</p>
          <span className="text-[10px] text-zinc-500 font-mono mt-0.5 block">Di seluruh venue</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#111113] border border-[#27272a]">
          <span className="text-[10px] font-mono uppercase text-zinc-400">Status Keamanan</span>
          <p className="font-display font-black text-2xl text-[#b7ff00] mt-1">100% SECURE</p>
          <span className="text-[10px] text-emerald-400 font-mono mt-0.5 block">JWT + RBAC Enforced</span>
        </div>
      </div>

      {/* Navigation Subtabs: Dashboard, Role Requests, Users, Events */}
      <div className="flex gap-2 border-b border-[#27272a] pb-2 text-xs overflow-x-auto no-scrollbar">
        {[
          { id: 'dashboard', label: 'Ringkasan Platform' },
          { id: 'roles', label: `Antrian Role (${pendingRequests.length})` },
          { id: 'users', label: `Direktori User (${users.length})` },
          { id: 'events', label: `Moderasi Gigs (${events.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setCurrentSection(tab.id as any)}
            className={`px-3.5 py-2 rounded-xl font-medium whitespace-nowrap transition-colors cursor-pointer ${
              currentSection === tab.id
                ? 'bg-[#18181b] text-[#b7ff00] font-bold border border-zinc-700 shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB: ROLE REQUESTS QUEUE (Section 43) */}
      {(currentSection === 'dashboard' || currentSection === 'roles') && (
        <div className="p-6 rounded-3xl bg-[#111113] border border-[#27272a] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-base text-white">
                Antrian Permohonan Kenaikan Role (Artist / EO)
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Pengguna yang mendaftar sebagai Artist atau EO memerlukan approval admin sebelum fitur manajemen terbuka.
              </p>
            </div>
          </div>

          {pendingRequests.length > 0 ? (
            <div className="space-y-3">
              {pendingRequests.map((req) => (
                <div
                  key={req.requestId}
                  className="p-4 rounded-2xl bg-[#18181b] border border-[#27272a] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={req.user?.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                      alt="Avatar"
                      className="w-12 h-12 rounded-xl object-cover ring-1 ring-zinc-700 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{req.user?.name}</span>
                        <Badge variant="warning" size="sm">Menunggu Review</Badge>
                      </div>
                      <p className="text-zinc-400 mt-0.5">{req.user?.email} • {req.user?.city || 'Jakarta'}</p>
                      <p className="text-[11px] font-mono text-zinc-500 mt-1">
                        Memohon Role: <strong className="text-[#b7ff00]">{req.requestedRole}</strong> • Diajukan: {new Date(req.createdAt).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                  </div>

                  {/* Actions: Approve / Reject (Section 43) */}
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleReject(req.requestId)}
                      className="px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-semibold cursor-pointer flex items-center gap-1.5 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" /> Tolak
                    </button>
                    <button
                      onClick={() => handleApprove(req.requestId)}
                      className="px-4 py-2 rounded-xl bg-[#b7ff00] hover:bg-[#c6ff24] text-black font-bold cursor-pointer flex items-center gap-1.5 shadow-[0_0_15px_rgba(183,255,0,0.3)] transition-colors"
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" /> Setujui Permohonan
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-zinc-500 py-8 text-center bg-[#18181b]/50 rounded-2xl border border-zinc-800">
              Tidak ada antrian permohonan role yang pending.
            </p>
          )}
        </div>
      )}

      {/* TAB: USER DIRECTORY (Section 44) */}
      {currentSection === 'users' && (
        <div className="p-6 rounded-3xl bg-[#111113] border border-[#27272a] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-display font-bold text-base text-white">Direktori Pengguna Platform</h3>
              <p className="text-xs text-zinc-400 mt-0.5">Daftar akun terdaftar di ekosistem GigRadar</p>
            </div>

            {/* Filter Pills */}
            <div className="flex gap-1.5 text-xs font-mono">
              {(['All', 'User', 'Artist', 'EO', 'Admin'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setUserRoleFilter(r)}
                  className={`px-3 py-1 rounded-lg border transition-colors cursor-pointer ${
                    userRoleFilter === r
                      ? 'bg-[#18181b] border-[#b7ff00] text-[#b7ff00] font-bold'
                      : 'border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder="Cari user berdasarkan nama atau email..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#18181b] border border-[#27272a] text-xs text-white outline-none focus:border-[#b7ff00]"
            />
          </div>

          <div className="space-y-2">
            {filteredUsers.map((u) => (
              <div
                key={u.userId}
                className="p-3.5 rounded-xl bg-[#18181b] border border-[#27272a] flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <img src={u.photoUrl} alt={u.name} className="w-10 h-10 rounded-lg object-cover ring-1 ring-zinc-700" />
                  <div>
                    <h5 className="font-bold text-white">{u.name}</h5>
                    <p className="text-zinc-400">{u.email}</p>
                  </div>
                </div>

                <div className="text-right">
                  <Badge variant={u.role === 'Admin' ? 'lime' : u.role === 'Artist' ? 'purple' : u.role === 'EO' ? 'warning' : 'zinc'} size="sm">
                    {u.role}
                  </Badge>
                  <span className="text-[10px] text-zinc-500 font-mono block mt-1">{u.city || 'Jakarta'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: GLOBAL EVENTS MODERATION (Section 45) */}
      {currentSection === 'events' && (
        <div className="p-6 rounded-3xl bg-[#111113] border border-[#27272a] space-y-4">
          <h3 className="font-display font-bold text-base text-white">Moderasi Event Global</h3>
          <p className="text-xs text-zinc-400">
            Admin memiliki otorisasi penuh untuk mengaudit, memoderasi, dan meninjau kelayakan acara publik.
          </p>

          <div className="space-y-3">
            {events.map((evt) => (
              <div
                key={evt.eventId}
                onClick={() => onSelectEvent(evt)}
                className="p-4 rounded-xl bg-[#18181b] hover:bg-[#222226] border border-[#27272a] flex items-center justify-between gap-3 text-xs cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <img src={evt.posterUrl} alt={evt.name} className="w-12 h-16 rounded-lg object-cover bg-zinc-800" />
                  <div>
                    <h5 className="font-bold text-sm text-white">{evt.name}</h5>
                    <p className="text-zinc-400">{evt.venue?.name} • Genre: {evt.genre?.name}</p>
                    <span className="text-[10px] text-zinc-500 font-mono">Diselenggarakan: {evt.organizer?.name || 'EO Mitra'}</span>
                  </div>
                </div>

                <div className="text-right">
                  <Badge variant={evt.status === 'Published' ? 'lime' : 'zinc'} size="sm">
                    {evt.status}
                  </Badge>
                  <span className="text-xs font-bold text-[#b7ff00] block mt-1">Audit Gig →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
