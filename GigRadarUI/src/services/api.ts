import { Event, Artist, Venue, Genre, Ticket, User, RoleRequest } from '../types';
import { storage } from './storage';

export const API_BASE_URL = 'http://localhost:5555/api';

class ApiClient {
  private backendAvailable: boolean = false;
  private hasCheckedBackend: boolean = false;

  async checkBackendHealth(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 1200);
      const res = await fetch(`${API_BASE_URL}/genres`, { signal: controller.signal });
      clearTimeout(timeout);
      this.backendAvailable = res.ok;
    } catch {
      this.backendAvailable = false;
    }
    this.hasCheckedBackend = true;
    return this.backendAvailable;
  }

  isOnline(): boolean {
    return this.backendAvailable;
  }

  // --- Auth ---
  async login(email: string, password = ''): Promise<{ success: boolean; user?: User; token?: string; error?: string }> {
    const trimmedEmail = (email || '').trim().toLowerCase();
    const trimmedPw = (password || '').trim();

    // 1. Try backend API if available
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail, password: trimmedPw }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          storage.setCurrentUser(data.user);
          storage.setToken(data.token);
          return { success: true, user: data.user, token: data.token };
        }
      }
    } catch {
      // Backend offline fallback to storage repository
    }

    // 2. Storage repository fallback
    const users = storage.getUsers();
    const user = users.find(u => u.email.toLowerCase() === trimmedEmail);
    if (!user) {
      return { success: false, error: 'Email belum terdaftar di GigRadar.' };
    }

    // Check password: match user password or universal demo password
    const acceptedDemoPasswords = ['password123', 'admin123', 'eo123', 'artist123', 'user123'];
    if (trimmedPw && user.password && trimmedPw !== user.password && !acceptedDemoPasswords.includes(trimmedPw)) {
      return { success: false, error: 'Kata sandi tidak sesuai. Silakan periksa kembali.' };
    }

    const token = 'jwt_token_' + btoa(user.email) + '_' + Date.now();
    storage.setCurrentUser(user);
    storage.setToken(token);
    return { success: true, user, token };
  }

  async register(name: string, email: string, password = '', requestedRole: 'User' | 'Artist' | 'EO'): Promise<{ success: boolean; user?: User; error?: string }> {
    // Admin cannot be registered publicly
    if ((requestedRole as string) === 'Admin') {
      return { success: false, error: 'Akun Admin hanya dapat diakses secara internal oleh developer atau tim perusahaan.' };
    }

    const trimmedEmail = (email || '').trim().toLowerCase();
    const users = storage.getUsers();
    if (users.some(u => u.email.toLowerCase() === trimmedEmail)) {
      return { success: false, error: 'Alamat email sudah terdaftar. Silakan gunakan email lain atau masuk.' };
    }

    const newUser: User = {
      userId: Date.now(),
      name: name.trim(),
      email: trimmedEmail,
      password: password || 'user123',
      role: 'User', // Public registration always starts as User; privileged role requires admin approval
      roleStatus: requestedRole === 'User' ? 'None' : 'Pending',
      city: 'Jakarta',
      latitude: -6.2088,
      longitude: 106.8456,
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString(),
      preferences: [],
    };

    users.push(newUser);
    storage.updateUser(newUser);
    storage.setCurrentUser(newUser);

    if (requestedRole !== 'User') {
      storage.createRoleRequest(newUser.userId, requestedRole);
    }

    return { success: true, user: newUser };
  }

  // --- Events ---
  async getEvents(): Promise<Event[]> {
    return storage.getEvents();
  }

  async getEventDetail(id: number): Promise<Event | undefined> {
    return storage.getEventById(id);
  }

  async toggleFavorite(eventId: number): Promise<boolean> {
    return storage.toggleFavorite(eventId);
  }

  async saveEvent(event: Event): Promise<Event> {
    return storage.saveEvent(event);
  }

  // --- Artists ---
  async getArtists(): Promise<Artist[]> {
    return storage.getArtists();
  }

  async getArtistDetail(id: number): Promise<Artist | undefined> {
    return storage.getArtistById(id);
  }

  async toggleFollowArtist(artistId: number): Promise<boolean> {
    return storage.toggleFollowArtist(artistId);
  }

  // --- Genres & Venues ---
  async getGenres(): Promise<Genre[]> {
    return storage.getGenres();
  }

  async getVenues(): Promise<Venue[]> {
    return storage.getVenues();
  }

  // --- Tickets ---
  async getMyTickets(userId: number): Promise<Ticket[]> {
    return storage.getMyTickets(userId);
  }

  async buyTicket(params: {
    eventId: number;
    userId: number;
    ticketTypeId: number;
    quantity: number;
    buyerName: string;
    buyerPhone: string;
    buyerEmail: string;
    buyerDateOfBirth?: string;
  }): Promise<{ success: boolean; tickets: Ticket[]; error?: string }> {
    return storage.createTicketPurchase(params);
  }

  async validateTicket(codeOrId: string): Promise<{ status: 'valid' | 'used' | 'invalid'; ticket?: Ticket; message: string }> {
    return storage.validateTicket(codeOrId);
  }

  // --- Admin Governance ---
  async getRoleRequests(): Promise<RoleRequest[]> {
    return storage.getRoleRequests();
  }

  async approveRoleRequest(requestId: number, adminId: number): Promise<boolean> {
    return storage.approveRoleRequest(requestId, adminId);
  }

  async rejectRoleRequest(requestId: number, adminId: number): Promise<boolean> {
    return storage.rejectRoleRequest(requestId, adminId);
  }

  async getUsers(): Promise<User[]> {
    return storage.getUsers();
  }
}

export const api = new ApiClient();
