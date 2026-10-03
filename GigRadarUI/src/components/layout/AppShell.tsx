import React, { useState } from 'react';
import { Wifi, Battery, Smartphone, Monitor } from 'lucide-react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';

export interface AppShellProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenCreateEvent?: () => void;
  onOpenGateValidator?: () => void;
  onOpenProfile?: () => void;
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  activeTab,
  setActiveTab,
  onOpenCreateEvent,
  onOpenGateValidator,
  onOpenProfile,
}) => {
  const [isPhoneFrame, setIsPhoneFrame] = useState(false);

  // If in Phone Mockup / Android Simulator mode:
  if (isPhoneFrame) {
    return (
      <div className="min-h-screen bg-[#060608] text-[#fafafa] flex flex-col items-center justify-center p-2 sm:p-6 select-none relative overflow-x-hidden">
        {/* Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#b7ff00]/5 rounded-full blur-[160px] pointer-events-none" />

        {/* Floating Simulator Control Bar */}
        <div className="mb-4 flex flex-wrap items-center justify-center gap-3 bg-[#111113] px-4 py-2 rounded-2xl border border-[#27272a] shadow-2xl relative z-20">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#b7ff00] animate-ping" />
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Simulasi Android APK (Pixel / Galaxy 120Hz)
            </span>
          </div>

          <button
            onClick={() => setIsPhoneFrame(false)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 cursor-pointer transition-colors"
          >
            <Monitor className="w-3.5 h-3.5 text-[#b7ff00]" />
            <span>Kembali ke Mode Desktop Penuh</span>
          </button>
        </div>

        {/* Realistic Android Smartphone Bezel */}
        <div className="relative w-full max-w-[395px] h-[820px] rounded-[52px] bg-[#09090b] border-[10px] border-[#222226] shadow-[0_0_80px_rgba(0,0,0,0.9),0_0_35px_rgba(183,255,0,0.15)] flex flex-col overflow-hidden ring-1 ring-zinc-700 relative z-10">
          {/* Android Status Bar with Clock & Camera Punch-hole */}
          <div className="h-9 px-6 bg-[#09090b] text-white flex items-center justify-between text-[11px] font-semibold select-none shrink-0 z-30 border-b border-zinc-900">
            <span>12:00</span>
            {/* Front camera punch-hole notch */}
            <div className="w-3 h-3 rounded-full bg-black ring-1 ring-zinc-800" />
            <div className="flex items-center gap-1.5 text-zinc-300">
              <span className="text-[10px] font-mono">5G</span>
              <Wifi className="w-3 h-3 text-zinc-400" />
              <Battery className="w-3.5 h-3.5 text-[#b7ff00]" />
            </div>
          </div>

          {/* Internal Mobile Screen Content (Scrollable) */}
          <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar relative bg-[#09090b]">
            <Header
              onOpenProfile={onOpenProfile}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              isInsidePhoneFrame={true}
            />

            {/* Mobile Viewport Main Body */}
            <div className="flex-1 p-3.5 pb-20 overflow-y-auto custom-scrollbar">
              {children}
            </div>

            {/* Docked Mobile Bottom Navigation Bar inside Phone */}
            <div className="sticky bottom-0 left-0 right-0 z-40 bg-[#09090b]/95 backdrop-blur-xl border-t border-[#27272a]">
              <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
              {/* Android Bottom Gesture Bar */}
              <div className="bg-[#09090b] pt-0.5 pb-2 flex justify-center">
                <div className="w-28 h-1 bg-zinc-600 rounded-full" />
              </div>
            </div>
          </div>
        </div>

        <p className="text-[11px] font-mono text-zinc-500 mt-3 text-center">
          Inilah wujud presisi antarmuka ketika aplikasi di-export dan di-install sebagai file .APK pada smartphone Android.
        </p>
      </div>
    );
  }

  // Normal Fullscreen Responsive Mode
  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] flex flex-col antialiased selection:bg-[#b7ff00] selection:text-black">
      {/* Sticky Header */}
      <Header
        onOpenProfile={onOpenProfile}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isPhoneFrame={isPhoneFrame}
        onTogglePhoneFrame={() => setIsPhoneFrame(true)}
      />

      {/* Main Body with Desktop Sidebar + Content */}
      <div className="flex-1 flex w-full">
        {/* Persistent Desktop Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenCreateEvent={onOpenCreateEvent}
          onOpenGateValidator={onOpenGateValidator}
        />

        {/* Dynamic Page Content View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto pb-24 lg:pb-12 overflow-x-hidden">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};
