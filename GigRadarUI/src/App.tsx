import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LocationProvider, useLocation } from './context/LocationContext';
import { Event, Artist, Venue, Ticket, RoleRequest, User } from './types';
import { storage } from './services/storage';

// Views
import { LoginView } from './views/auth/LoginView';
import { RegisterView } from './views/auth/RegisterView';
import { OnboardingView } from './views/auth/OnboardingView';
import { DiscoverView } from './views/user/DiscoverView';
import { ExploreView } from './views/user/ExploreView';
import { RadarScreen } from './views/user/RadarScreen';
import { MyTicketsView } from './views/user/MyTicketsView';
import { ProfileView } from './views/user/ProfileView';
import { ArtistDashboardView } from './views/artist/ArtistDashboardView';
import { EoDashboardView } from './views/eo/EoDashboardView';
import { AdminDashboardView } from './views/admin/AdminDashboardView';

// Layout & Modals
import { AppShell } from './components/layout/AppShell';
import { EventDetailModal } from './components/event/EventDetailModal';
import { TicketCheckoutModal } from './components/event/TicketCheckoutModal';
import { ArtistDetailModal } from './components/artist/ArtistDetailModal';
import { BottomMusicPlayer } from './components/artist/BottomMusicPlayer';
import { GateValidatorModal } from './components/ticket/GateValidatorModal';
import { CreateEventModal } from './components/forms/CreateEventModal';
import { RoleRequestModal } from './components/forms/RoleRequestModal';
import { LocationModal } from './components/location/LocationModal';

const MainAppContent: React.FC = () => {
  const { currentUser, role, logout } = useAuth();
  const { isLocationModalOpen, setIsLocationModalOpen } = useLocation();

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<string>('discover');
  const [exploreCategory, setExploreCategory] = useState<'events' | 'artists' | 'venues'>('events');
  const [authScreen, setAuthScreen] = useState<'login' | 'register' | 'onboarding'>('login');

  // Domain data (initialized directly from storage to eliminate empty-state flicker)
  const [events, setEvents] = useState<Event[]>(() => storage.getEvents());
  const [artists, setArtists] = useState<Artist[]>(() => storage.getArtists());
  const [venues, setVenues] = useState<Venue[]>(() => storage.getVenues());
  const [tickets, setTickets] = useState<Ticket[]>(() => storage.getAllTickets());
  const [roleRequests, setRoleRequests] = useState<RoleRequest[]>(() => storage.getRoleRequests());
  const [users, setUsers] = useState<User[]>(() => storage.getUsers());

  // Modals state
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [checkoutEvent, setCheckoutEvent] = useState<Event | null>(null);
  const [isGateValidatorOpen, setIsGateValidatorOpen] = useState(false);
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [isRoleRequestOpen, setIsRoleRequestOpen] = useState(false);

  // Sync role changes to appropriate initial tab and enforce role boundaries
  useEffect(() => {
    if (role === 'EO') setActiveTab('eo_dashboard');
    else if (role === 'Artist') setActiveTab('artist_dashboard');
    else if (role === 'Admin') setActiveTab('admin_dashboard');
    else setActiveTab('discover');
  }, [role]);

  const handleSetActiveTab = (tab: string) => {
    // Strict isolation: user can only navigate within their own role domain
    if (role === 'User' && (tab.startsWith('eo_') || tab.startsWith('artist_') || tab.startsWith('admin_'))) {
      setActiveTab('discover');
      return;
    }
    if (role === 'Artist' && (tab.startsWith('eo_') || tab.startsWith('admin_'))) {
      setActiveTab('artist_dashboard');
      return;
    }
    if (role === 'EO' && (tab.startsWith('artist_') || tab.startsWith('admin_'))) {
      setActiveTab('eo_dashboard');
      return;
    }
    if (role === 'Admin' && (tab.startsWith('artist_') || tab.startsWith('eo_'))) {
      setActiveTab('admin_dashboard');
      return;
    }
    setActiveTab(tab);
  };

  // Load data from storage repository
  const refreshAllData = () => {
    setEvents(storage.getEvents());
    setArtists(storage.getArtists());
    setVenues(storage.getVenues());
    setTickets(storage.getAllTickets());
    setRoleRequests(storage.getRoleRequests());
    setUsers(storage.getUsers());
  };

  useEffect(() => {
    refreshAllData();
  }, [currentUser]);

  // Handlers
  const handleToggleFavorite = (eventId: number) => {
    storage.toggleFavorite(eventId);
    refreshAllData();
    if (selectedEvent && selectedEvent.eventId === eventId) {
      setSelectedEvent((prev) => (prev ? { ...prev, isFavorite: !prev.isFavorite } : null));
    }
  };

  const handleToggleFollow = (artistId: number) => {
    storage.toggleFollowArtist(artistId);
    refreshAllData();
    if (selectedArtist && selectedArtist.artistId === artistId) {
      setSelectedArtist((prev) => (prev ? { ...prev, isFollowed: !prev.isFollowed } : null));
    }
  };

  const handleOpenCheckout = (event: Event) => {
    setSelectedEvent(null);
    setCheckoutEvent(event);
  };

  const handleTicketPurchased = (newTicket: Ticket) => {
    refreshAllData();
    // After buying, user can view in My Tickets
  };

  const handleEventCreated = (newEvent: Event) => {
    refreshAllData();
  };

  // If not logged in
  if (!currentUser) {
    if (authScreen === 'register') {
      return (
        <RegisterView
          onGoToLogin={() => setAuthScreen('login')}
          onRegisterSuccess={(needsOnboarding) => {
            if (needsOnboarding) setAuthScreen('onboarding');
            refreshAllData();
          }}
        />
      );
    }
    if (authScreen === 'onboarding') {
      return <OnboardingView onComplete={() => refreshAllData()} />;
    }
    return (
      <LoginView
        onGoToRegister={() => setAuthScreen('register')}
        onLoginSuccess={() => refreshAllData()}
      />
    );
  }

  // Active Artist object for Artist role
  const currentArtist =
    artists.find((a) => a.userId === currentUser.userId) ||
    artists.find((a) => a.name.toLowerCase() === currentUser.name.toLowerCase()) ||
    artists.find((a) => currentUser.email.toLowerCase().includes(a.name.toLowerCase().replace(/\s+/g, ''))) ||
    artists[0];

  return (
    <AppShell
      activeTab={activeTab}
      setActiveTab={handleSetActiveTab}
      onOpenCreateEvent={() => setIsCreateEventOpen(true)}
      onOpenGateValidator={() => setIsGateValidatorOpen(true)}
      onOpenProfile={() => handleSetActiveTab('profile')}
    >
      {/* 1. USER VIEWS */}
      {activeTab === 'discover' && (
        <DiscoverView
          events={events}
          artists={artists}
          onSelectEvent={(e) => setSelectedEvent(e)}
          onSelectArtist={(a) => setSelectedArtist(a)}
          onToggleFavorite={handleToggleFavorite}
          onToggleFollow={handleToggleFollow}
          onNavigateToRadar={() => setActiveTab('radar')}
          onNavigateToExplore={() => {
            setExploreCategory('artists');
            setActiveTab('explore');
          }}
        />
      )}

      {activeTab === 'explore' && (
        <ExploreView
          events={events}
          artists={artists}
          venues={venues}
          initialCategory={exploreCategory}
          onSelectEvent={(e) => setSelectedEvent(e)}
          onSelectArtist={(a) => setSelectedArtist(a)}
          onToggleFavorite={handleToggleFavorite}
          onToggleFollow={handleToggleFollow}
        />
      )}

      {activeTab === 'radar' && (
        <RadarScreen
          events={events}
          onSelectEvent={(e) => setSelectedEvent(e)}
          onToggleFavorite={handleToggleFavorite}
        />
      )}

      {activeTab === 'tickets' && (
        <MyTicketsView
          tickets={tickets.filter((t) => t.userId === currentUser.userId)}
          onExploreGigs={() => setActiveTab('discover')}
        />
      )}

      {/* 2. ARTIST VIEWS */}
      {activeTab === 'artist_dashboard' && (
        <ArtistDashboardView
          artist={currentArtist}
          events={events}
          onUpdateArtist={(updated) => {
            refreshAllData();
          }}
          onSelectEvent={(e) => setSelectedEvent(e)}
        />
      )}

      {/* 3. EO VIEWS */}
      {(activeTab === 'eo_dashboard' || activeTab === 'eo_events' || activeTab === 'eo_tickets' || activeTab === 'eo_analytics') && (
        <EoDashboardView
          events={events}
          venues={venues}
          artists={artists}
          onOpenCreateEvent={() => setIsCreateEventOpen(true)}
          onOpenGateValidator={() => setIsGateValidatorOpen(true)}
          onSelectEvent={(e) => setSelectedEvent(e)}
          activeSection={activeTab.replace('eo_', '') as any}
        />
      )}

      {/* 4. ADMIN VIEWS */}
      {(activeTab === 'admin_dashboard' || activeTab === 'admin_roles' || activeTab === 'admin_users' || activeTab === 'admin_events') && (
        <AdminDashboardView
          users={users}
          roleRequests={roleRequests}
          events={events}
          onRefreshData={refreshAllData}
          onSelectEvent={(e) => setSelectedEvent(e)}
          activeSection={activeTab.replace('admin_', '') as any}
        />
      )}

      {/* 5. SHARED PROFILE VIEW */}
      {activeTab === 'profile' && (
        <ProfileView
          events={events}
          artists={artists}
          onSelectEvent={(e) => setSelectedEvent(e)}
          onSelectArtist={(a) => setSelectedArtist(a)}
          onLogout={logout}
          onRequestRoleUpgrade={() => setIsRoleRequestOpen(true)}
        />
      )}

      {/* GLOBAL MODALS */}
      <EventDetailModal
        event={selectedEvent}
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onSelectArtist={(a) => {
          setSelectedEvent(null);
          setSelectedArtist(a);
        }}
        onToggleFavorite={handleToggleFavorite}
        onOpenCheckout={handleOpenCheckout}
      />

      <TicketCheckoutModal
        event={checkoutEvent}
        isOpen={!!checkoutEvent}
        onClose={() => setCheckoutEvent(null)}
        onTicketPurchased={handleTicketPurchased}
      />

      <ArtistDetailModal
        artist={selectedArtist}
        isOpen={!!selectedArtist}
        onClose={() => setSelectedArtist(null)}
        onToggleFollow={handleToggleFollow}
        onSelectEvent={(e) => setSelectedEvent(e)}
        allEvents={events}
      />

      <GateValidatorModal
        isOpen={isGateValidatorOpen}
        onClose={() => {
          setIsGateValidatorOpen(false);
          refreshAllData();
        }}
      />

      <CreateEventModal
        isOpen={isCreateEventOpen}
        onClose={() => setIsCreateEventOpen(false)}
        onEventCreated={handleEventCreated}
        venues={venues}
        artists={artists}
        userId={currentUser.userId}
      />

      <RoleRequestModal
        isOpen={isRoleRequestOpen}
        onClose={() => {
          setIsRoleRequestOpen(false);
          refreshAllData();
        }}
      />

      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
      />

      {/* Global Skena Music Bottom Player */}
      <BottomMusicPlayer onOpenArtist={(a) => setSelectedArtist(a)} />
    </AppShell>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <LocationProvider>
        <MainAppContent />
      </LocationProvider>
    </AuthProvider>
  );
}
