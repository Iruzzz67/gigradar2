using Microsoft.EntityFrameworkCore;
using GigRadarApi.Models;

namespace GigRadarApi.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Genre> Genres { get; set; }
        public DbSet<Artist> Artists { get; set; }
        public DbSet<ArtistAlbum> ArtistAlbums { get; set; }
        public DbSet<ArtistPost> ArtistPosts { get; set; }
        public DbSet<ArtistMember> ArtistMembers { get; set; }
        public DbSet<ArtistJourneyItem> ArtistJourneyItems { get; set; }
        public DbSet<Venue> Venues { get; set; }
        public DbSet<Event> Events { get; set; }
        public DbSet<EventArtist> EventArtists { get; set; }
        public DbSet<Ticket> Tickets { get; set; }
        public DbSet<EventTicketType> EventTicketTypes { get; set; }
        public DbSet<UserPreference> UserPreferences { get; set; }
        public DbSet<Favorite> Favorites { get; set; }
        public DbSet<Follow> Follows { get; set; }
        public DbSet<AudioTrack> AudioTracks { get; set; }
        public DbSet<RoleRequest> RoleRequests { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Unique constraints
            modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();

            // Satu user ber-role Artist maksimal satu profil artist
            modelBuilder.Entity<Artist>().HasIndex(a => a.UserId).IsUnique();

            // EventArtist composite key
            modelBuilder.Entity<EventArtist>()
                .HasIndex(ea => new { ea.EventId, ea.ArtistId })
                .IsUnique();

            // Follow unique constraint
            modelBuilder.Entity<Follow>()
                .HasIndex(f => new { f.UserId, f.ArtistId })
                .IsUnique();

            // Favorite unique constraint
            modelBuilder.Entity<Favorite>()
                .HasIndex(f => new { f.UserId, f.EventId })
                .IsUnique();

            // Seed Admin, EO, Artist & Regular User
            modelBuilder.Entity<User>().HasData(
                new User { UserId = 1, Name = "Admin Governance", Email = "admin@gigradar.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"), Role = "Admin", RoleStatus = "Approved", City = "Jakarta" },
                new User { UserId = 2, Name = "Koloni Gigs Organizer", Email = "eo@gigradar.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("eo123"), Role = "EO", RoleStatus = "Approved", City = "Jakarta" },
                new User { UserId = 3, Name = "The Jeblogs", Email = "artist@gigradar.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("artist123"), Role = "Artist", RoleStatus = "Approved", City = "Klaten" },
                new User { UserId = 4, Name = "Dimas Wicaksono", Email = "user@gigradar.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("user123"), Role = "User", RoleStatus = "None", City = "Jakarta" },
                new User { UserId = 5, Name = "FSTVLST", Email = "fstvlst@gigradar.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("artist123"), Role = "Artist", RoleStatus = "Approved", City = "Yogyakarta" }
            );

            // Seed Genres
            modelBuilder.Entity<Genre>().HasData(
                new Genre { GenreId = 1, Name = "Indie", Icon = "🎸" },
                new Genre { GenreId = 2, Name = "Alternative", Icon = "🎵" },
                new Genre { GenreId = 3, Name = "Rock", Icon = "🤘" },
                new Genre { GenreId = 4, Name = "Punk", Icon = "💀" },
                new Genre { GenreId = 5, Name = "Hardcore", Icon = "🔥" },
                new Genre { GenreId = 6, Name = "Shoegaze", Icon = "🌙" },
                new Genre { GenreId = 7, Name = "Emo", Icon = "💔" },
                new Genre { GenreId = 8, Name = "Metal", Icon = "⚔️" },
                new Genre { GenreId = 9, Name = "Jazz", Icon = "🎷" },
                new Genre { GenreId = 10, Name = "Folk", Icon = "🪕" },
                new Genre { GenreId = 11, Name = "Electronic", Icon = "🎛️" },
                new Genre { GenreId = 12, Name = "Pop", Icon = "🎤" }
            );

            // Seed Venues
            modelBuilder.Entity<Venue>().HasData(
                new Venue { VenueId = 1, Name = "Graha Bhakti Budaya", Address = "Jl. Taman Ismail Marzuki", City = "Jakarta", Latitude = -6.1944, Longitude = 106.8329, Capacity = 1200 },
                new Venue { VenueId = 2, Name = "Gedung Kesenian", Address = "Jl. Sinabun", City = "Bandung", Latitude = -6.8849, Longitude = 107.6143, Capacity = 500 },
                new Venue { VenueId = 3, Name = "Bentara Budaya", Address = "Jl. Palmerah Selatan", City = "Jakarta", Latitude = -6.2297, Longitude = 106.8184, Capacity = 300 }
            );

            // Seed Artists (Artist 1 to 8)
            modelBuilder.Entity<Artist>().HasData(
                new Artist { ArtistId = 1, UserId = 3, Name = "The Jeblogs", Bio = "Unit rock alternatif asal Klaten. Mengusung lirik jujur keseharian anak muda dengan energi panggung meledak-ledak.", Genre = "Rock", City = "Klaten", PhotoUrl = "https://thejeblogs.com/assets/img/abt.jpg", CoverUrl = "https://bojakramapress.com/wp-content/uploads/2026/01/Foto-Jeblogs.jpg", LogoUrl = "/logos/the-jeblogs.svg", SpotifyEmbedUrl = "https://open.spotify.com/embed/artist/2uGEBoKHco8L9Pbq99iXmv?utm_source=generator&si=19784a42b72d4b03" },
                new Artist { ArtistId = 2, UserId = 5, Name = "FSTVLST", Bio = "Kuartet visual rock asal ISI Yogyakarta. Mengusung konsep Almost Rock Barely Art.", Genre = "Rock", City = "Yogyakarta", PhotoUrl = "https://upload.wikimedia.org/wikipedia/commons/8/8a/Fstvlst_2023.jpg", CoverUrl = "https://images.genius.com/45476801ad4ad4a5e1733d33a28e1857.640x640x1.jpg", LogoUrl = "/logos/fstvlst.svg", SpotifyEmbedUrl = "https://open.spotify.com/embed/artist/1nqagRy1zxX6z9KtsfZhqf?utm_source=generator&si=d0cc663d13414212" },
                new Artist { ArtistId = 3, Name = "Dongker", Bio = "Art punk dari ITB Bandung bertopeng balaclava.", Genre = "Punk", City = "Bandung", PhotoUrl = "https://upload.wikimedia.org/wikipedia/commons/b/b2/Dongker_Photo_2025.png", CoverUrl = "https://upload.wikimedia.org/wikipedia/commons/e/e0/Dongker_live_at_Grammars_Bandung.jpg", LogoUrl = "/logos/dongker.svg", SpotifyEmbedUrl = "https://open.spotify.com/embed/artist/6sf1OnuDZM48bgFQvPkbYm?utm_source=generator&si=17aa115432394f4a" },
                new Artist { ArtistId = 4, Name = "Perunggu", Bio = "Band rock pulang kantor asal Jakarta dengan lagu 33x.", Genre = "Indie", City = "Jakarta", PhotoUrl = "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80", CoverUrl = "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=1200&auto=format&fit=crop&q=80", LogoUrl = "/logos/perunggu.svg" },
                new Artist { ArtistId = 5, Name = "Sukatani", Bio = "Duo post-punk / electro-punk kolektif tani Purbalingga.", Genre = "Punk", City = "Purbalingga", PhotoUrl = "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80", CoverUrl = "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&auto=format&fit=crop&q=80", LogoUrl = "/logos/sukatani.svg" },
                new Artist { ArtistId = 6, Name = "The Adams", Bio = "Legenda power pop dan indie rock Jakarta sejak 2002.", Genre = "Indie", City = "Jakarta", PhotoUrl = "https://images.unsplash.com/photo-1520523839898-507125cd53c1?w=600&auto=format&fit=crop&q=80", CoverUrl = "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=80", LogoUrl = "/logos/the-adams.svg" },
                new Artist { ArtistId = 7, Name = "Lomba Sihir", Bio = "Kolektif pop alternatif papan atas ibu kota yang meramu lirik satir Jakarta.", Genre = "Pop", City = "Jakarta", PhotoUrl = "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&auto=format&fit=crop&q=80", CoverUrl = "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&auto=format&fit=crop&q=80", LogoUrl = "/logos/lomba-sihir.svg" },
                new Artist { ArtistId = 8, Name = "Bernadya", Bio = "Solois indie pop / folk asal Surabaya yang menjadi fenomena musik nasional.", Genre = "Pop", City = "Surabaya", PhotoUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80", CoverUrl = "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=80", LogoUrl = "/logos/bernadya.svg" }
            );

            // Seed konten demo untuk The Jeblogs (Artist 1) & FSTVLST (Artist 2)
            modelBuilder.Entity<AudioTrack>().HasData(
                new AudioTrack { TrackId = 1, ArtistId = 1, Title = "Bersandarlah", AudioUrl = "", CoverUrl = "", Genre = "Rock", DurationSeconds = 30, ReleaseDate = new DateTime(2023, 11, 20) },
                new AudioTrack { TrackId = 2, ArtistId = 1, Title = "Menari Resah", AudioUrl = "", CoverUrl = "", Genre = "Indie Rock", DurationSeconds = 30, ReleaseDate = new DateTime(2023, 11, 20) },
                new AudioTrack { TrackId = 3, ArtistId = 1, Title = "Atas Nama", AudioUrl = "", CoverUrl = "", Genre = "Rock", DurationSeconds = 30, ReleaseDate = new DateTime(2022, 8, 10) },
                new AudioTrack { TrackId = 4, ArtistId = 2, Title = "Menantang Rasi Bintang", AudioUrl = "", CoverUrl = "", Genre = "Rock", DurationSeconds = 30, ReleaseDate = new DateTime(2014, 9, 3) },
                new AudioTrack { TrackId = 5, ArtistId = 2, Title = "Ayunan Kapal", AudioUrl = "", CoverUrl = "", Genre = "Visual Rock", DurationSeconds = 30, ReleaseDate = new DateTime(2014, 9, 3) },
                new AudioTrack { TrackId = 6, ArtistId = 2, Title = "Sireum Hideung", AudioUrl = "", CoverUrl = "", Genre = "Rock", DurationSeconds = 30, ReleaseDate = new DateTime(2020, 6, 16) }
            );

            modelBuilder.Entity<ArtistAlbum>().HasData(
                new ArtistAlbum { AlbumId = 1, ArtistId = 1, Title = "Sambutlah", Description = "Album penuh perdana berisi 8 nomor katarsis rock.", ReleaseDate = new DateTime(2023, 11, 20) },
                new ArtistAlbum { AlbumId = 2, ArtistId = 2, Title = "Hits Kitsch", Description = "Album seminal penanda babak baru FSTVLST.", ReleaseDate = new DateTime(2014, 9, 3) }
            );

            modelBuilder.Entity<ArtistPost>().HasData(
                new ArtistPost { PostId = 1, ArtistId = 1, Title = "Koor massal Bersandarlah!", Content = "Terima kasih untuk seluruh kawan skena yang bernyanyi bersama kami di panggung festival! 🎸", IsPublished = true, CreatedAt = new DateTime(2026, 10, 15), UpdatedAt = new DateTime(2026, 10, 15) },
                new ArtistPost { PostId = 2, ArtistId = 1, Title = "Menuju Panggung Skena Riuh", Content = "Sampai jumpa di panggung akbar bersama kawan-kawan FSTVLST bulan ini!", IsPublished = true, CreatedAt = new DateTime(2026, 10, 18), UpdatedAt = new DateTime(2026, 10, 18) },
                new ArtistPost { PostId = 3, ArtistId = 2, Title = "Almost Rock Barely Art di Panggung!", Content = "Malam yang magis bersama kawan-kawan festivalist dan The Jeblogs di Yogyakarta! 🤘", IsPublished = true, CreatedAt = new DateTime(2026, 10, 19), UpdatedAt = new DateTime(2026, 10, 19) }
            );

            modelBuilder.Entity<ArtistMember>().HasData(
                new ArtistMember { MemberId = 1, ArtistId = 1, Name = "Amir M.", Role = "Vokal", JoinedAt = new DateTime(2016, 8, 17) },
                new ArtistMember { MemberId = 2, ArtistId = 1, Name = "Valentino Mahoni", Role = "Gitar", JoinedAt = new DateTime(2016, 8, 17) },
                new ArtistMember { MemberId = 3, ArtistId = 1, Name = "Febrianto Prima", Role = "Gitar", JoinedAt = new DateTime(2016, 8, 17) },
                new ArtistMember { MemberId = 4, ArtistId = 1, Name = "Ryan Ramadhan", Role = "Bass", JoinedAt = new DateTime(2016, 8, 17) },
                new ArtistMember { MemberId = 5, ArtistId = 1, Name = "Dani Ardian", Role = "Drum", JoinedAt = new DateTime(2016, 8, 17) },
                new ArtistMember { MemberId = 6, ArtistId = 2, Name = "Farid Stevy Asta", Role = "Vokal / Visual", JoinedAt = new DateTime(2011, 1, 1) },
                new ArtistMember { MemberId = 7, ArtistId = 2, Name = "Roby Setiawan", Role = "Gitar", JoinedAt = new DateTime(2011, 1, 1) },
                new ArtistMember { MemberId = 8, ArtistId = 2, Name = "Fendry Aryo", Role = "Bass", JoinedAt = new DateTime(2011, 1, 1) },
                new ArtistMember { MemberId = 9, ArtistId = 2, Name = "Danish Wisnu", Role = "Drum", JoinedAt = new DateTime(2018, 5, 1) }
            );

            modelBuilder.Entity<ArtistJourneyItem>().HasData(
                new ArtistJourneyItem { JourneyId = 1, ArtistId = 1, Title = "Band terbentuk di Klaten", Description = "Bermula dari Karang Taruna Galur Manggala Desa Jeblog.", Category = "Formation", Date = new DateTime(2016, 8, 17) },
                new ArtistJourneyItem { JourneyId = 2, ArtistId = 1, Title = "Rilis EP perdana", Description = "Direkam swadaya di balai desa.", Category = "Single", Date = new DateTime(2018, 8, 17) },
                new ArtistJourneyItem { JourneyId = 3, ArtistId = 1, Title = "Rilis Album Sambutlah", Description = "Album penuh perdana meledak di panggung independen nasional.", Category = "Album", Date = new DateTime(2023, 11, 20) },
                new ArtistJourneyItem { JourneyId = 4, ArtistId = 2, Title = "Transformasi dari Jenny", Description = "Lahir kembali menjadi FSTVLST di kampus ISI Yogyakarta.", Category = "Formation", Date = new DateTime(2011, 1, 1) },
                new ArtistJourneyItem { JourneyId = 5, ArtistId = 2, Title = "Rilis Hits Kitsch", Description = "Album seminal yang melahirkan lagu kebangsaan Menantang Rasi Bintang.", Category = "Album", Date = new DateTime(2014, 9, 3) }
            );

            // Seed follower: Admin & EO mengikuti The Jeblogs & FSTVLST
            modelBuilder.Entity<Follow>().HasData(
                new Follow { FollowId = 1, UserId = 1, ArtistId = 1 },
                new Follow { FollowId = 2, UserId = 2, ArtistId = 1 },
                new Follow { FollowId = 3, UserId = 1, ArtistId = 2 },
                new Follow { FollowId = 4, UserId = 4, ArtistId = 2 }
            );

            // Seed Events
            modelBuilder.Entity<Event>().HasData(
                new Event { EventId = 1, Name = "Skena Riuh Jogja-Klaten", Description = "Kolaborasi panggung akbar The Jeblogs bersama FSTVLST", PosterUrl = "", VenueId = 3, StartDate = new DateTime(2026, 10, 18, 19, 30, 0), EndDate = new DateTime(2026, 10, 18, 23, 30, 0), Latitude = -6.2297, Longitude = 106.8184, GenreId = 3, CreatedBy = 2, MinPrice = 45000, MaxPrice = 85000, Capacity = 600 },
                new Event { EventId = 2, Name = "Bandung Underground Noise", Description = "Pentas punk rock Dongker x Sukatani", PosterUrl = "", VenueId = 2, StartDate = new DateTime(2026, 10, 25, 18, 30, 0), EndDate = new DateTime(2026, 10, 25, 23, 0, 0), Latitude = -6.8849, Longitude = 107.6143, GenreId = 4, CreatedBy = 1, MinPrice = 35000, MaxPrice = 65000, Capacity = 450 },
                new Event { EventId = 3, Name = "Rock Pulang Kantor Showcase", Description = "Perpaduan generasi emas Perunggu x The Adams", PosterUrl = "", VenueId = 1, StartDate = new DateTime(2026, 11, 2, 20, 0, 0), EndDate = new DateTime(2026, 11, 2, 23, 45, 0), Latitude = -6.1944, Longitude = 106.8329, GenreId = 1, CreatedBy = 1, MinPrice = 65000, MaxPrice = 120000, Capacity = 800 }
            );

            // Seed Ticket Types (Festival / Tribun / Bundling)
            modelBuilder.Entity<EventTicketType>().HasData(
                // Night of Shoegaze
                new EventTicketType { EventTicketTypeId = 1, EventId = 1, Name = "Festival", Description = "Akses penuh area festival (standing)", Price = 35000, Stock = 150, SortOrder = 1 },
                new EventTicketType { EventTicketTypeId = 2, EventId = 1, Name = "Tribun", Description = "Area tribun duduk dengan pemandangan panggung", Price = 25000, Stock = 50, SortOrder = 2 },
                new EventTicketType { EventTicketTypeId = 3, EventId = 1, Name = "Bundling Festival + Merch", Description = "Tiket festival + kaos eksklusif band", Price = 60000, Stock = 30, SortOrder = 3 },
                // Midwest Emo Fest
                new EventTicketType { EventTicketTypeId = 4, EventId = 2, Name = "Festival", Description = "Akses penuh festival 1 hari", Price = 50000, Stock = 300, SortOrder = 1 },
                new EventTicketType { EventTicketTypeId = 5, EventId = 2, Name = "Tribun", Description = "Area tribun duduk", Price = 30000, Stock = 100, SortOrder = 2 },
                new EventTicketType { EventTicketTypeId = 6, EventId = 2, Name = "Bundling 2 Tiket", Description = "2 tiket festival dengan harga hemat", Price = 90000, Stock = 40, SortOrder = 3 },
                // Underground Indie Night
                new EventTicketType { EventTicketTypeId = 7, EventId = 3, Name = "Festival", Description = "Akses penuh indie night", Price = 25000, Stock = 350, SortOrder = 1 },
                new EventTicketType { EventTicketTypeId = 8, EventId = 3, Name = "Tribun", Description = "Area tribun duduk", Price = 20000, Stock = 150, SortOrder = 2 },
                new EventTicketType { EventTicketTypeId = 9, EventId = 3, Name = "Bundling Festival + Minuman", Description = "Tiket festival + 1 minuman gratis", Price = 35000, Stock = 60, SortOrder = 3 }
            );

            // Seed EventArtists
            modelBuilder.Entity<EventArtist>().HasData(
                new EventArtist { Id = 1, EventId = 1, ArtistId = 1, Order = 1 },
                new EventArtist { Id = 2, EventId = 1, ArtistId = 4, Order = 2 },
                new EventArtist { Id = 3, EventId = 2, ArtistId = 2, Order = 1 },
                new EventArtist { Id = 4, EventId = 2, ArtistId = 3, Order = 2 },
                new EventArtist { Id = 5, EventId = 3, ArtistId = 5, Order = 1 },
                new EventArtist { Id = 6, EventId = 3, ArtistId = 6, Order = 2 }
            );
        }
    }
}
