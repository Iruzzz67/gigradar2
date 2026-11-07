import React from 'react';
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
  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] flex flex-col antialiased selection:bg-[#b7ff00] selection:text-black">
      {/* Sticky Header */}
      <Header
        onOpenProfile={onOpenProfile}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Body with Dynamic Responsive Layout */}
      <div className="flex-1 flex w-full">
        {/* Desktop Sidebar (Automatically visible on large screens, hidden on mobile) */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenCreateEvent={onOpenCreateEvent}
          onOpenGateValidator={onOpenGateValidator}
        />

        {/* Dynamic Page Content View (Fluid across all viewport sizes) */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto pb-24 lg:pb-12 overflow-x-hidden">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation (Automatically visible on mobile, hidden on desktop) */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};
