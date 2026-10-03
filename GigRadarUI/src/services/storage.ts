import { User, Event, Artist, Venue, Genre, Ticket, RoleRequest, Role } from '../types';
import { INITIAL_USERS, INITIAL_EVENTS, INITIAL_ARTISTS, INITIAL_VENUES, INITIAL_GENRES, INITIAL_ROLE_REQUESTS } from './mockData';

const KEYS = {
  USERS: 'gigradar_users',
  CURRENT_USER: 'gigradar_current_user',
  TOKEN: 'gigradar_jwt_token',
  EVENTS: 'gigradar_events',
  ARTISTS: 'gigradar_artists',
  VENUES: 'gigradar_venues',
  GENRES: 'gigradar_genres',
  TICKETS: 'gigradar_my_tickets',
  ROLE_REQUESTS: 'gigradar_role_requests',
  FAVORITES: 'gigradar_favorites',
  FOLLOWS: 'gigradar_follows',
};

class StorageRepository {
  private getItem<T>(key: string, fallback: T): T {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch {
      return fallback;
    }
  }

  private setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Storage write error:', e);
    }
  }

  init(): void {
    const existingUsers = this.getItem<User[] | null>(KEYS.USERS, null);
    if (!existingUsers) {
      this.setItem(KEYS.USERS, INITIAL_USERS);
    } else {
      // Ensure existing users have their corresponding password synced
      let updated = false;
      const merged = existingUsers.map(u => {
        const init = INITIAL_USERS.find(iu => iu.userId === u.userId);
        if (init && !u.password) {
          updated = true;
          return { ...u, password: init.password };
        }
        return u;
      });
      if (updated) this.setItem(KEYS.USERS, merged);
    }
    if (!localStorage.getItem(KEYS.EVENTS)) {
      this.setItem(KEYS.EVENTS, INITIAL_EVENTS);
    }
    if (!localStorage.getItem(KEYS.ARTISTS)) {
      this.setItem(KEYS.ARTISTS, INITIAL_ARTISTS);
    }
    if (!localStorage.getItem(KEYS.VENUES)) {
      this.setItem(KEYS.VENUES, INITIAL_VENUES);
    }
    if (!localStorage.getItem(KEYS.GENRES)) {
      this.setItem(KEYS.GENRES, INITIAL_GENRES);
    }
    if (!localStorage.getItem(KEYS.ROLE_REQUESTS)) {
      this.setItem(KEYS.ROLE_REQUESTS, INITIAL_ROLE_REQUESTS);
    }
    if (!localStorage.getItem(KEYS.TICKETS)) {
      // Seed a sample ticket for user
      const sampleTicket: Ticket = {
        ticketId: 101,
        eventId: 1,
        event: INITIAL_EVENTS[0],
        userId: 4,
        ticketType: 'Regular Gate Pass',
        price: 45000,
        buyerName: 'Dimas Wicaksono',
        buyerPhone: '081234567890',
        buyerEmail: 'user@gigradar.com',
        buyerDateOfBirth: '2001-05-12',
        qrCode: 'GR-TKT-98234-ACTIVE',
        status: 'Active',
        purchasedAt: '2026-09-30T10:15:00Z',
      };
      this.setItem(KEYS.TICKETS, [sampleTicket]);
    }
  }

  // --- Auth & Session ---
  getCurrentUser(): User | null {
    return this.getItem<User | null>(KEYS.CURRENT_USER, null);
  }

  setCurrentUser(user: User | null): void {
    this.setItem(KEYS.CURRENT_USER, user);
  }

  getToken(): string | null {
    return localStorage.getItem(KEYS.TOKEN) || 'mock_jwt_token_gigradar_sec_2026';
  }

  setToken(token: string | null): void {
    if (token) localStorage.setItem(KEYS.TOKEN, token);
    else localStorage.removeItem(KEYS.TOKEN);
  }

  getUsers(): User[] {
    return this.getItem<User[]>(KEYS.USERS, INITIAL_USERS);
  }

  updateUser(updated: User): void {
    const users = this.getUsers().map(u => (u.userId === updated.userId ? updated : u));
    this.setItem(KEYS.USERS, users);
    const current = this.getCurrentUser();
    if (current && current.userId === updated.userId) {
      this.setCurrentUser(updated);
    }
  }

  // --- Events ---
  getEvents(): Event[] {
    return this.getItem<Event[]>(KEYS.EVENTS, INITIAL_EVENTS);
  }

  getEventById(id: number): Event | undefined {
    return this.getEvents().find(e => e.eventId === id);
  }

  saveEvent(event: Event): Event {
    const events = this.getEvents();
    const existingIndex = events.findIndex(e => e.eventId === event.eventId);
    if (existingIndex >= 0) {
      events[existingIndex] = event;
    } else {
      event.eventId = Date.now();
      events.unshift(event);
    }
    this.setItem(KEYS.EVENTS, events);
    return event;
  }

  toggleFavorite(eventId: number): boolean {
    const events = this.getEvents();
    const event = events.find(e => e.eventId === eventId);
    if (!event) return false;
    event.isFavorite = !event.isFavorite;
    event.savesCount += event.isFavorite ? 1 : -1;
    this.setItem(KEYS.EVENTS, events);
    return event.isFavorite;
  }

  // --- Artists ---
  getArtists(): Artist[] {
    return this.getItem<Artist[]>(KEYS.ARTISTS, INITIAL_ARTISTS);
  }

  getArtistById(id: number): Artist | undefined {
    return this.getArtists().find(a => a.artistId === id);
  }

  saveArtist(artist: Artist): Artist {
    const artists = this.getArtists();
    const idx = artists.findIndex(a => a.artistId === artist.artistId);
    if (idx >= 0) {
      artists[idx] = artist;
    } else {
      artists.push(artist);
    }
    this.setItem(KEYS.ARTISTS, artists);
    return artist;
  }

  toggleFollowArtist(artistId: number): boolean {
    const artists = this.getArtists();
    const artist = artists.find(a => a.artistId === artistId);
    if (!artist) return false;
    artist.isFollowed = !artist.isFollowed;
    artist.followersCount += artist.isFollowed ? 1 : -1;
    this.setItem(KEYS.ARTISTS, artists);
    return artist.isFollowed;
  }

  // --- Genres & Venues ---
  getGenres(): Genre[] {
    return this.getItem<Genre[]>(KEYS.GENRES, INITIAL_GENRES);
  }

  getVenues(): Venue[] {
    return this.getItem<Venue[]>(KEYS.VENUES, INITIAL_VENUES);
  }

  // --- Tickets & Purchases ---
  getMyTickets(userId: number): Ticket[] {
    const all = this.getItem<Ticket[]>(KEYS.TICKETS, []);
    return all.filter(t => t.userId === userId);
  }

  getAllTickets(): Ticket[] {
    return this.getItem<Ticket[]>(KEYS.TICKETS, []);
  }

  createTicketPurchase(data: {
    eventId: number;
    userId: number;
    ticketTypeId: number;
    quantity: number;
    buyerName: string;
    buyerPhone: string;
    buyerEmail: string;
    buyerDateOfBirth?: string;
  }): { success: boolean; tickets: Ticket[]; error?: string } {
    const events = this.getEvents();
    const event = events.find(e => e.eventId === data.eventId);
    if (!event) return { success: false, tickets: [], error: 'Event tidak ditemukan.' };

    const ticketType = event.ticketTypes?.find(t => t.eventTicketTypeId === data.ticketTypeId);
    if (!ticketType) return { success: false, tickets: [], error: 'Kategori tiket tidak valid.' };

    if (ticketType.stock < data.quantity) {
      return { success: false, tickets: [], error: `Stok tiket tidak mencukupi (sisa ${ticketType.stock}).` };
    }

    // Atomic decrement stock
    ticketType.stock -= data.quantity;
    ticketType.soldCount = (ticketType.soldCount || 0) + data.quantity;
    this.setItem(KEYS.EVENTS, events);

    // Create tickets
    const existingTickets = this.getItem<Ticket[]>(KEYS.TICKETS, []);
    const newTickets: Ticket[] = [];

    for (let i = 0; i < data.quantity; i++) {
      const randomCode = Math.floor(100000 + Math.random() * 900000);
      const ticket: Ticket = {
        ticketId: Date.now() + i,
        eventId: event.eventId,
        event: event,
        userId: data.userId,
        ticketType: ticketType.name,
        price: ticketType.price,
        buyerName: data.buyerName,
        buyerPhone: data.buyerPhone,
        buyerEmail: data.buyerEmail,
        buyerDateOfBirth: data.buyerDateOfBirth,
        qrCode: `GR-TKT-${randomCode}-ACTIVE`,
        status: 'Active',
        purchasedAt: new Date().toISOString(),
      };
      newTickets.push(ticket);
      existingTickets.unshift(ticket);
    }

    this.setItem(KEYS.TICKETS, existingTickets);
    return { success: true, tickets: newTickets };
  }

  validateTicket(codeOrId: string): { status: 'valid' | 'used' | 'invalid'; ticket?: Ticket; message: string } {
    const all = this.getAllTickets();
    const query = codeOrId.trim().toUpperCase();
    
    const ticket = all.find(t => 
      t.qrCode.toUpperCase() === query || 
      t.ticketId.toString() === query ||
      t.qrCode.toUpperCase().includes(query)
    );

    if (!ticket) {
      return {
        status: 'invalid',
        message: 'Tiket tidak ditemukan dalam sistem database.',
      };
    }

    if (ticket.status === 'Used') {
      return {
        status: 'used',
        ticket,
        message: `Tiket sudah pernah digunakan sebelumnya (Scan: ${new Date(ticket.purchasedAt).toLocaleTimeString()}).`,
      };
    }

    // Mark as Used
    ticket.status = 'Used';
    this.setItem(KEYS.TICKETS, all);

    return {
      status: 'valid',
      ticket,
      message: 'Tiket valid! Akses gate diizinkan.',
    };
  }

  // --- Role Requests ---
  getRoleRequests(): RoleRequest[] {
    return this.getItem<RoleRequest[]>(KEYS.ROLE_REQUESTS, INITIAL_ROLE_REQUESTS);
  }

  createRoleRequest(userId: number, requestedRole: 'Artist' | 'EO'): RoleRequest {
    const requests = this.getRoleRequests();
    const user = this.getUsers().find(u => u.userId === userId);
    const newReq: RoleRequest = {
      requestId: Date.now(),
      userId,
      user,
      requestedRole,
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };
    requests.unshift(newReq);
    this.setItem(KEYS.ROLE_REQUESTS, requests);

    if (user) {
      user.roleStatus = 'Pending';
      this.updateUser(user);
    }
    return newReq;
  }

  approveRoleRequest(requestId: number, adminId: number): boolean {
    const requests = this.getRoleRequests();
    const req = requests.find(r => r.requestId === requestId);
    if (!req) return false;

    req.status = 'Approved';
    req.reviewedByAdminId = adminId;
    req.reviewedAt = new Date().toISOString();
    this.setItem(KEYS.ROLE_REQUESTS, requests);

    // Promote User
    const user = this.getUsers().find(u => u.userId === req.userId);
    if (user) {
      user.role = req.requestedRole as Role;
      user.roleStatus = 'Approved';
      this.updateUser(user);
    }
    return true;
  }

  rejectRoleRequest(requestId: number, adminId: number): boolean {
    const requests = this.getRoleRequests();
    const req = requests.find(r => r.requestId === requestId);
    if (!req) return false;

    req.status = 'Rejected';
    req.reviewedByAdminId = adminId;
    req.reviewedAt = new Date().toISOString();
    this.setItem(KEYS.ROLE_REQUESTS, requests);

    const user = this.getUsers().find(u => u.userId === req.userId);
    if (user) {
      user.roleStatus = 'None';
      this.updateUser(user);
    }
    return true;
  }
}

export const storage = new StorageRepository();
storage.init();
