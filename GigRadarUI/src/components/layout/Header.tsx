import React from 'react';
import { Radio, MapPin, RefreshCw, Shield, UserCircle2, Mic2, CalendarDays, Smartphone, Monitor, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import { Role } from '../../types';

interface HeaderProps {
  onOpenProfile?: () => void;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  isPhoneFrame?: boolean;
  onTogglePhoneFrame?: () => void;
  isInsidePhoneFrame?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenProfile,
  isPhoneFrame,
  onTogglePhoneFrame,
  isInsidePhoneFrame = false,
}) => {
  const { currentUser, role, logout } = useAuth();
  const { cityName, permissionStatus, refreshLocation } = useLocation();

  const roleIcons: Record<Role, React.ReactNode> = {
    User: <UserCircle2 className="w-3.5 h-3.5 text-zinc-400" />,
    Artist: <Mic2 className="w-3.5 h-3.5 text-fuchsia-400" />,
    EO: <CalendarDays className="w-3.5 h-3.5 text-orange-400" />,
    Admin: <Shield className="w-3.5 h-3.5 text-[#b7ff00]" />,
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#09090b]/80 backdrop-blur-xl border-b border-[#27272a] px-3.5 sm:px-8 py-3 flex items-center justify-between">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-[#111113] border border-[#27272a] text-[#b7ff00] shadow-[0_0_15px_rgba(183,255,0,0.2)]">
            <Radio className="w-4 h-4" />
            <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#b7ff00] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#b7ff00]"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-extrabold text-base tracking-wider text-white">
                GIG<span className="text-[#b7ff00]">RADAR</span>
              </span>
              <span className="text-[10px] uppercase tracking-widest font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                v2
              </span>
            </div>
          </div>
        </div>

        {/* Location Pill */}
        {!isInsidePhoneFrame && (
          <button
            onClick={refreshLocation}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#18181b] border border-[#27272a] text-xs text-zinc-300 hover:border-zinc-600 transition-colors cursor-pointer group"
            title="Klik untuk memperbarui GPS"
          >
            <MapPin className="w-3.5 h-3.5 text-[#b7ff00] group-hover:scale-110 transition-transform" />
            <span className="font-medium truncate max-w-[120px]">{cityName}</span>
            <RefreshCw
              className={`w-3 h-3 text-zinc-500 group-hover:text-zinc-300 ${
                permissionStatus === 'requesting' ? 'animate-spin' : ''
              }`}
            />
          </button>
        )}
      </div>

      {/* Right Controls: Phone Preview Simulator Toggle & Role Switcher */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Android Simulator Frame Toggle */}
        {onTogglePhoneFrame && !isInsidePhoneFrame && (
          <button
            onClick={onTogglePhoneFrame}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-sm ${
              isPhoneFrame
                ? 'bg-zinc-800 border-zinc-600 text-white'
                : 'bg-[#b7ff00]/15 hover:bg-[#b7ff00]/25 text-[#b7ff00] border-[#b7ff00]/40 shadow-[0_0_15px_rgba(183,255,0,0.2)]'
            }`}
            title="Lihat simulasi wujud aplikasi saat di-install di HP Android (APK)"
          >
            {isPhoneFrame ? <Monitor className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">
              {isPhoneFrame ? 'Mode Desktop' : '📱 Mode APK Android'}
            </span>
          </button>
        )}

        {/* Current Active Role Badge (Single-session enforcement) */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#111113] border border-[#27272a] text-xs">
          {roleIcons[role]}
          <span className="font-semibold text-white hidden sm:inline">{role}</span>
        </div>

        {/* User Profile Avatar & Name */}
        <button
          onClick={onOpenProfile}
          className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-xl bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] transition-all cursor-pointer select-none"
          title="Buka Profil & Pengaturan"
        >
          <img
            src={
              currentUser?.photoUrl ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
            }
            alt="Avatar"
            className="w-6 h-6 rounded-lg object-cover ring-1 ring-zinc-700"
          />
          <span className="hidden md:inline text-xs font-medium text-zinc-300 truncate max-w-[100px]">
            {currentUser?.name?.split(' ')[0] || 'User'}
          </span>
        </button>

        {/* Explicit Logout Button (Must logout to access other roles) */}
        <button
          onClick={logout}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 hover:border-red-500/50 transition-colors cursor-pointer text-xs font-semibold"
          title="Keluar dari akun ini untuk login dengan akun lain"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Keluar</span>
        </button>
      </div>
    </header>
  );
};
