import React from 'react';
import { Compass, Radio, Ticket, User, LayoutDashboard, CalendarDays, Music, ShieldAlert, BarChart3 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { nativeBridge } from '../../services/bridge';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const { role } = useAuth();

  const handleTabClick = (id: string) => {
    nativeBridge.hapticFeedback('light');
    setActiveTab(id);
  };

  const userNav = [
    { id: 'discover', label: 'Discover', icon: <Compass className="w-5 h-5" /> },
    { id: 'explore', label: 'Explore', icon: <Radio className="w-5 h-5" /> },
    { id: 'radar', label: 'Radar', icon: <Radio className="w-6 h-6 text-[#b7ff00]" />, special: true },
    { id: 'tickets', label: 'Tickets', icon: <Ticket className="w-5 h-5" /> },
    { id: 'profile', label: 'Profile', icon: <User className="w-5 h-5" /> },
  ];

  const eoNav = [
    { id: 'eo_dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'eo_events', label: 'Events', icon: <CalendarDays className="w-5 h-5" /> },
    { id: 'eo_tickets', label: 'Tickets', icon: <Ticket className="w-5 h-5" /> },
    { id: 'eo_analytics', label: 'Analytics', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'profile', label: 'Profile', icon: <User className="w-5 h-5" /> },
  ];

  const artistNav = [
    { id: 'artist_dashboard', label: 'Artist Hub', icon: <Music className="w-5 h-5" /> },
    { id: 'profile', label: 'Profile', icon: <User className="w-5 h-5" /> },
  ];

  const adminNav = [
    { id: 'admin_dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'admin_roles', label: 'Requests', icon: <ShieldAlert className="w-5 h-5" /> },
    { id: 'admin_events', label: 'Events', icon: <CalendarDays className="w-5 h-5" /> },
    { id: 'profile', label: 'Profile', icon: <User className="w-5 h-5" /> },
  ];

  let navItems = userNav;
  if (role === 'EO') navItems = eoNav;
  else if (role === 'Artist') navItems = artistNav;
  else if (role === 'Admin') navItems = adminNav;

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#09090b]/90 backdrop-blur-2xl border-t border-[#27272a] px-2 py-2 flex items-center justify-around select-none">
      {navItems.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => handleTabClick(item.id)}
            className={`relative flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-2 rounded-xl transition-all duration-200 cursor-pointer ${
              isActive ? 'text-[#b7ff00]' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {item.special ? (
              <div className="relative -top-2 w-11 h-11 rounded-full bg-[#18181b] border-2 border-[#b7ff00] flex items-center justify-center shadow-[0_0_15px_rgba(183,255,0,0.3)]">
                {item.icon}
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#b7ff00] animate-ping" />
              </div>
            ) : (
              <span className="shrink-0">{item.icon}</span>
            )}
            <span
              className={`text-[10px] font-medium tracking-tight mt-0.5 ${
                isActive ? 'font-bold text-white' : 'text-zinc-400'
              }`}
            >
              {item.label}
            </span>
            {isActive && !item.special && (
              <span className="absolute bottom-0.5 w-3 h-0.5 rounded-full bg-[#b7ff00]" />
            )}
          </button>
        );
      })}
    </nav>
  );
};
