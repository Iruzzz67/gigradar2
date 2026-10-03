import React from 'react';
import {
  Compass,
  Radio,
  Ticket,
  User as UserIcon,
  LayoutDashboard,
  CalendarDays,
  BarChart3,
  ShieldAlert,
  Users,
  Music,
  PlusCircle,
  ScanLine,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenCreateEvent?: () => void;
  onOpenGateValidator?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenCreateEvent,
  onOpenGateValidator,
}) => {
  const { role } = useAuth();

  const userNav = [
    { id: 'discover', label: 'Discover', icon: <Compass className="w-5 h-5" /> },
    { id: 'explore', label: 'Explore', icon: <Radio className="w-5 h-5" /> },
    { id: 'radar', label: 'Radar', icon: <Radio className="w-5 h-5 text-[#b7ff00]" /> },
    { id: 'tickets', label: 'My Tickets', icon: <Ticket className="w-5 h-5" /> },
    { id: 'profile', label: 'Profile', icon: <UserIcon className="w-5 h-5" /> },
  ];

  const eoNav = [
    { id: 'eo_dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'eo_events', label: 'Events & Gigs', icon: <CalendarDays className="w-5 h-5" /> },
    { id: 'eo_tickets', label: 'Ticket Types', icon: <Ticket className="w-5 h-5" /> },
    { id: 'eo_analytics', label: 'Analytics', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'profile', label: 'EO Profile', icon: <UserIcon className="w-5 h-5" /> },
  ];

  const artistNav = [
    { id: 'artist_dashboard', label: 'Artist Hub', icon: <Music className="w-5 h-5" /> },
    { id: 'profile', label: 'Band Profile', icon: <UserIcon className="w-5 h-5" /> },
  ];

  const adminNav = [
    { id: 'admin_dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'admin_roles', label: 'Role Requests', icon: <ShieldAlert className="w-5 h-5 text-amber-400" /> },
    { id: 'admin_users', label: 'User Directory', icon: <Users className="w-5 h-5" /> },
    { id: 'admin_events', label: 'Event Moderation', icon: <CalendarDays className="w-5 h-5" /> },
    { id: 'profile', label: 'Settings', icon: <UserIcon className="w-5 h-5" /> },
  ];

  let currentNav = userNav;
  if (role === 'EO') currentNav = eoNav;
  else if (role === 'Artist') currentNav = artistNav;
  else if (role === 'Admin') currentNav = adminNav;

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-[#27272a] bg-[#09090b] p-4 shrink-0 justify-between select-none">
      <div className="space-y-6">
        {/* Role Header Indicator */}
        <div className="px-3 py-2 rounded-xl bg-[#111113] border border-[#27272a]">
          <p className="text-[10px] uppercase font-mono tracking-widest text-zinc-500">Active Workspace</p>
          <p className="text-sm font-display font-bold text-white capitalize mt-0.5">{role} Mode</p>
        </div>

        {/* Action Shortcuts for EO */}
        {role === 'EO' && (
          <div className="space-y-2">
            {onOpenCreateEvent && (
              <button
                onClick={onOpenCreateEvent}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#b7ff00] text-black font-semibold text-xs rounded-xl shadow-[0_0_15px_rgba(183,255,0,0.2)] hover:bg-[#c4ff2e] transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create New Gig</span>
              </button>
            )}
            {onOpenGateValidator && (
              <button
                onClick={onOpenGateValidator}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-[#18181b] hover:bg-[#27272a] text-zinc-200 border border-[#27272a] font-medium text-xs rounded-xl transition-all cursor-pointer"
              >
                <ScanLine className="w-4 h-4 text-[#b7ff00]" />
                <span>Gate Scanner</span>
              </button>
            )}
          </div>
        )}

        {/* Navigation Links */}
        <nav className="space-y-1">
          {currentNav.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-[#18181b] text-white font-semibold border border-zinc-700/60 shadow-inner'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                }`}
              >
                <span className={isActive ? 'text-[#b7ff00]' : 'text-zinc-500'}>{item.icon}</span>
                <span>{item.label}</span>
                {item.id === 'radar' && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-[#b7ff00] animate-pulse" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-3 rounded-xl bg-[#111113]/70 border border-[#27272a]/80 text-[11px] text-zinc-500">
        <p className="font-medium text-zinc-400">GigRadar Engine v2.0</p>
        <p className="mt-0.5">Skena & Underground Music Ecosystem</p>
      </div>
    </aside>
  );
};
