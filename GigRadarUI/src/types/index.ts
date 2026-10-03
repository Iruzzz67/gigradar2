export type Role = 'User' | 'Artist' | 'EO' | 'Admin';
export type RoleStatus = 'None' | 'Pending' | 'Approved';

export interface User {
  userId: number;
  name: string;
  email: string;
  role: Role;
  roleStatus: RoleStatus;
  city: string;
  latitude: number;
  longitude: number;
  photoUrl: string;
  createdAt: string;
  preferences?: number[]; // Genre IDs
  password?: string;
}

export interface Genre {
  genreId: number;
  name: string;
  icon: string;
  color?: string;
  accent?: string;
}

export interface Venue {
  venueId: number;
  name: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  capacity: number;
  photoUrl: string;
}

export interface AudioTrack {
  trackId: number;
  artistId: number;
  title: string;
  audioUrl: string;
  coverUrl: string;
  genre: string;
  durationSeconds: number;
  releaseDate?: string;
}

export interface ArtistAlbum {
  albumId: number;
  artistId: number;
  title: string;
  coverUrl: string;
  description: string;
  releaseDate?: string;
}

export interface ArtistPost {
  postId: number;
  artistId: number;
  title: string;
  content: string;
  imageUrl: string;
  isPublished: boolean;
  createdAt: string;
}

export interface ArtistMember {
  memberId: number;
  artistId: number;
  name: string;
  role: string;
  photoUrl?: string;
  joinedAt?: string;
}

export interface ArtistJourneyItem {
  journeyId: number;
  artistId: number;
  title: string;
  description: string;
  category: 'Formation' | 'Single' | 'Gig' | 'Album' | 'Achievement' | 'Tour' | 'Other';
  date?: string;
}

export interface Artist {
  artistId: number;
  userId?: number;
  name: string;
  bio: string;
  photoUrl: string;
  coverUrl: string;
  genre: string;
  city: string;
  socialLinks: string;
  followersCount: number;
  isFollowed?: boolean;
  tracks?: AudioTrack[];
  albums?: ArtistAlbum[];
  posts?: ArtistPost[];
  members?: ArtistMember[];
  journey?: ArtistJourneyItem[];
}

export interface EventTicketType {
  eventTicketTypeId: number;
  eventId: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  sortOrder: number;
  soldCount?: number;
}

export interface EventArtist {
  id: number;
  eventId: number;
  artistId: number;
  order: number;
  artist?: Artist;
}

export type EventStatus = 'Published' | 'Draft' | 'SoldOut' | 'Completed';

export interface Event {
  eventId: number;
  name: string;
  description: string;
  posterUrl: string;
  ticketLink?: string;
  venueId: number;
  venue?: Venue;
  startDate: string;
  endDate: string;
  latitude: number;
  longitude: number;
  genreId: number;
  genre?: Genre;
  createdBy: number;
  organizer?: User;
  status: EventStatus;
  minPrice: number;
  maxPrice: number;
  capacity: number;
  viewsCount: number;
  savesCount: number;
  isFavorite?: boolean;
  distanceKm?: number;
  artists?: Artist[];
  ticketTypes?: EventTicketType[];
}

export type TicketStatus = 'Active' | 'Used';

export interface Ticket {
  ticketId: number;
  eventId: number;
  event?: Event;
  userId: number;
  ticketType: string;
  price: number;
  buyerName: string;
  buyerPhone: string;
  buyerEmail: string;
  buyerDateOfBirth?: string;
  qrCode: string;
  status: TicketStatus;
  purchasedAt: string;
}

export interface RoleRequest {
  requestId: number;
  userId: number;
  user?: User;
  requestedRole: 'Artist' | 'EO';
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
  reviewedByAdminId?: number;
  reviewedAt?: string;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface RadarNode {
  id: number;
  eventId: number;
  name: string;
  genre: string;
  genreColor: string;
  venueName: string;
  distanceKm: number;
  bearingDeg: number;
  x: number; // Normalized coordinate -1 to 1
  y: number;
  event: Event;
}

export interface TicketScanResult {
  status: 'valid' | 'used' | 'invalid';
  ticket?: Ticket;
  message: string;
  timestamp: string;
}
