using System.Data.Common;
using Microsoft.EntityFrameworkCore;

namespace GigRadarApi.Data;

/// <summary>
/// EnsureCreated() hanya membuat skema saat database belum ada — tabel/kolom baru
/// tidak otomatis muncul di database SQLite yang sudah ada. Helper ini menambahkan
/// kolom & tabel baru (tipe tiket, data pembeli, link pembelian eksternal) secara
/// idempoten tanpa menghapus data yang ada.
/// </summary>
public static class TicketSchemaBootstrap
{
    public static void Ensure(AppDbContext db)
    {
        var conn = db.Database.GetDbConnection();
        conn.Open();
        try
        {
            var eventsCols = GetColumns(conn, "Events");
            if (!eventsCols.Contains("TicketLink"))
                Execute(conn, "ALTER TABLE Events ADD COLUMN TicketLink TEXT NOT NULL DEFAULT '';");

            // Role request system (§25): status permohonan role untuk database yang sudah ada.
            var usersCols = GetColumns(conn, "Users");
            if (!usersCols.Contains("RoleStatus"))
                Execute(conn, "ALTER TABLE Users ADD COLUMN RoleStatus TEXT NOT NULL DEFAULT 'None';");

            var ticketsCols = GetColumns(conn, "Tickets");
            if (!ticketsCols.Contains("BuyerName"))
                Execute(conn, "ALTER TABLE Tickets ADD COLUMN BuyerName TEXT NOT NULL DEFAULT '';");
            if (!ticketsCols.Contains("BuyerPhone"))
                Execute(conn, "ALTER TABLE Tickets ADD COLUMN BuyerPhone TEXT NOT NULL DEFAULT '';");
            if (!ticketsCols.Contains("BuyerEmail"))
                Execute(conn, "ALTER TABLE Tickets ADD COLUMN BuyerEmail TEXT NOT NULL DEFAULT '';");
            if (!ticketsCols.Contains("BuyerDateOfBirth"))
                Execute(conn, "ALTER TABLE Tickets ADD COLUMN BuyerDateOfBirth TEXT NULL;");

            // Tabel tipe tiket (kolom mengikuti konvensi EF Core untuk SQLite:
            // decimal -> TEXT, bool/integer -> INTEGER).
            Execute(conn, """
                CREATE TABLE IF NOT EXISTS "EventTicketTypes" (
                    "EventTicketTypeId" INTEGER NOT NULL CONSTRAINT "PK_EventTicketTypes" PRIMARY KEY AUTOINCREMENT,
                    "EventId" INTEGER NOT NULL,
                    "Name" TEXT NOT NULL,
                    "Description" TEXT NOT NULL,
                    "Price" TEXT NOT NULL,
                    "Stock" INTEGER NOT NULL,
                    "SortOrder" INTEGER NOT NULL
                );
                """);

            SeedTicketTypesIfEmpty(conn);
            SetDemoTicketLink(conn);
            SeedAdminUserIfMissing(conn);
            SeedEoUserIfMissing(conn);
            EnsureArtistSchema(conn);
            SeedArtistDemo(conn);
            SeedRegularUserIfMissing(conn);
        }
        finally
        {
            conn.Close();
        }
    }

    private static void SeedTicketTypesIfEmpty(DbConnection conn)
    {
        using var countCmd = conn.CreateCommand();
        countCmd.CommandText = "SELECT COUNT(*) FROM EventTicketTypes;";
        var count = Convert.ToInt64(countCmd.ExecuteScalar() ?? 0);
        if (count > 0) return;

        Execute(conn, """
            INSERT INTO "EventTicketTypes" ("EventId", "Name", "Description", "Price", "Stock", "SortOrder") VALUES
                (1, 'Festival', 'Akses penuh area festival (standing)', '35000', 150, 1),
                (1, 'Tribun', 'Area tribun duduk dengan pemandangan panggung', '25000', 50, 2),
                (1, 'Bundling Festival + Merch', 'Tiket festival + kaos eksklusif band', '60000', 30, 3),
                (2, 'Festival', 'Akses penuh festival 1 hari', '50000', 300, 1),
                (2, 'Tribun', 'Area tribun duduk', '30000', 100, 2),
                (2, 'Bundling 2 Tiket', '2 tiket festival dengan harga hemat', '90000', 40, 3),
                (3, 'Festival', 'Akses penuh indie night', '25000', 350, 1),
                (3, 'Tribun', 'Area tribun duduk', '20000', 150, 2),
                (3, 'Bundling Festival + Minuman', 'Tiket festival + 1 minuman gratis', '35000', 60, 3);
            """);
    }

    private static void SetDemoTicketLink(DbConnection conn)
    {
        // Contoh venue yang hanya menyediakan link pembelian eksternal (event 3).
        Execute(conn, """
            UPDATE Events SET TicketLink = 'https://www.loket.com/underground-indie-night'
            WHERE EventId = 3 AND (TicketLink IS NULL OR TicketLink = '');
            """);
    }

    private static void SeedAdminUserIfMissing(DbConnection conn)
    {
        using var findCmd = conn.CreateCommand();
        findCmd.CommandText = "SELECT UserId FROM Users WHERE Email = 'admin@gigradar.com';";
        var result = findCmd.ExecuteScalar();
        if (result == null)
        {
            using var insertCmd = conn.CreateCommand();
            insertCmd.CommandText = """
                INSERT INTO Users (Name, Email, PasswordHash, Role, RoleStatus, City, Latitude, Longitude, PhotoUrl, CreatedAt)
                VALUES (@Name, @Email, @PasswordHash, @Role, @RoleStatus, @City, 0, 0, '', @CreatedAt);
                """;
            var p = insertCmd.Parameters;
            p.Add(CreateParameter(conn, "@Name", "Admin Governance"));
            p.Add(CreateParameter(conn, "@Email", "admin@gigradar.com"));
            p.Add(CreateParameter(conn, "@PasswordHash", BCrypt.Net.BCrypt.HashPassword("admin123")));
            p.Add(CreateParameter(conn, "@Role", "Admin"));
            p.Add(CreateParameter(conn, "@RoleStatus", "Approved"));
            p.Add(CreateParameter(conn, "@City", "Jakarta"));
            p.Add(CreateParameter(conn, "@CreatedAt", DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss")));
            insertCmd.ExecuteNonQuery();
        }
    }

    private static void SeedRegularUserIfMissing(DbConnection conn)
    {
        using var findCmd = conn.CreateCommand();
        findCmd.CommandText = "SELECT UserId FROM Users WHERE Email = 'user@gigradar.com';";
        var result = findCmd.ExecuteScalar();
        if (result == null)
        {
            using var insertCmd = conn.CreateCommand();
            insertCmd.CommandText = """
                INSERT INTO Users (Name, Email, PasswordHash, Role, RoleStatus, City, Latitude, Longitude, PhotoUrl, CreatedAt)
                VALUES (@Name, @Email, @PasswordHash, @Role, @RoleStatus, @City, 0, 0, '', @CreatedAt);
                """;
            var p = insertCmd.Parameters;
            p.Add(CreateParameter(conn, "@Name", "Dimas Wicaksono"));
            p.Add(CreateParameter(conn, "@Email", "user@gigradar.com"));
            p.Add(CreateParameter(conn, "@PasswordHash", BCrypt.Net.BCrypt.HashPassword("user123")));
            p.Add(CreateParameter(conn, "@Role", "User"));
            p.Add(CreateParameter(conn, "@RoleStatus", "None"));
            p.Add(CreateParameter(conn, "@City", "Jakarta"));
            p.Add(CreateParameter(conn, "@CreatedAt", DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss")));
            insertCmd.ExecuteNonQuery();
        }
    }

    /// <summary>
    /// Pastikan akun demo EO (eo@gigradar.com / eo123) ada di database yang sudah
    /// terlanjur dibuat — seed HasData hanya berlaku untuk database baru.
    /// Event 1 (Night of Shoegaze) diserahkan ke EO agar halaman kelola tiket
    /// langsung berisi data saat dicoba.
    /// </summary>
    private static void SeedEoUserIfMissing(DbConnection conn)
    {
        var eoId = 0;
        using (var findCmd = conn.CreateCommand())
        {
            findCmd.CommandText = "SELECT UserId FROM Users WHERE Email = 'eo@gigradar.com';";
            var result = findCmd.ExecuteScalar();
            if (result != null)
            {
                eoId = Convert.ToInt32(result);
            }
            else
            {
                // Hash dibuat di sisi C# lalu disisipkan via parameter (BCrypt tidak bisa dipanggil di SQL).
                using var insertCmd = conn.CreateCommand();
                insertCmd.CommandText = """
                    INSERT INTO Users (Name, Email, PasswordHash, Role, City, Latitude, Longitude, PhotoUrl, CreatedAt)
                    VALUES (@Name, @Email, @PasswordHash, @Role, @City, 0, 0, '', @CreatedAt);
                    SELECT last_insert_rowid();
                    """;
                var p = insertCmd.Parameters;
                p.Add(CreateParameter(conn, "@Name", "Event Organizer"));
                p.Add(CreateParameter(conn, "@Email", "eo@gigradar.com"));
                p.Add(CreateParameter(conn, "@PasswordHash", BCrypt.Net.BCrypt.HashPassword("eo123")));
                p.Add(CreateParameter(conn, "@Role", "EO"));
                p.Add(CreateParameter(conn, "@City", "Jakarta"));
                p.Add(CreateParameter(conn, "@CreatedAt", DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss")));
                eoId = Convert.ToInt32(insertCmd.ExecuteScalar());
            }
        }

        // Event demo milik EO (hanya bila masih dipegang Admin seed, agar tidak menimpa kepemilikan yang sudah diubah).
        Execute(conn, $"UPDATE Events SET CreatedBy = {eoId} WHERE EventId = 1 AND CreatedBy = 1;");
    }

    /// <summary>
    /// Phase 3 (Artist): tambahkan kolom & tabel baru untuk database yang sudah ada
    /// (kolom mengikuti konvensi EF Core untuk SQLite).
    /// </summary>
    private static void EnsureArtistSchema(DbConnection conn)
    {
        var artistCols = GetColumns(conn, "Artists");
        if (!artistCols.Contains("UserId"))
            Execute(conn, "ALTER TABLE Artists ADD COLUMN UserId INTEGER NULL;");
        if (!artistCols.Contains("City"))
            Execute(conn, "ALTER TABLE Artists ADD COLUMN City TEXT NOT NULL DEFAULT '';");
        if (!artistCols.Contains("CoverUrl"))
            Execute(conn, "ALTER TABLE Artists ADD COLUMN CoverUrl TEXT NOT NULL DEFAULT '';");
        if (!artistCols.Contains("History"))
            Execute(conn, "ALTER TABLE Artists ADD COLUMN History TEXT NOT NULL DEFAULT '';");

        var trackCols = GetColumns(conn, "AudioTracks");
        if (!trackCols.Contains("CoverUrl"))
            Execute(conn, "ALTER TABLE AudioTracks ADD COLUMN CoverUrl TEXT NOT NULL DEFAULT '';");
        if (!trackCols.Contains("Genre"))
            Execute(conn, "ALTER TABLE AudioTracks ADD COLUMN Genre TEXT NOT NULL DEFAULT '';");
        if (!trackCols.Contains("ReleaseDate"))
            Execute(conn, "ALTER TABLE AudioTracks ADD COLUMN ReleaseDate TEXT NULL;");
        if (!trackCols.Contains("CreatedAt"))
            Execute(conn, "ALTER TABLE AudioTracks ADD COLUMN CreatedAt TEXT NOT NULL DEFAULT '2026-01-01 00:00:00';");

        Execute(conn, """
            CREATE TABLE IF NOT EXISTS "ArtistAlbums" (
                "AlbumId" INTEGER NOT NULL CONSTRAINT "PK_ArtistAlbums" PRIMARY KEY AUTOINCREMENT,
                "ArtistId" INTEGER NOT NULL,
                "Title" TEXT NOT NULL,
                "CoverUrl" TEXT NOT NULL,
                "Description" TEXT NOT NULL,
                "ReleaseDate" TEXT NULL,
                "CreatedAt" TEXT NOT NULL
            );
            """);
        Execute(conn, """
            CREATE TABLE IF NOT EXISTS "ArtistPosts" (
                "PostId" INTEGER NOT NULL CONSTRAINT "PK_ArtistPosts" PRIMARY KEY AUTOINCREMENT,
                "ArtistId" INTEGER NOT NULL,
                "Title" TEXT NOT NULL,
                "Content" TEXT NOT NULL,
                "ImageUrl" TEXT NOT NULL,
                "IsPublished" INTEGER NOT NULL,
                "CreatedAt" TEXT NOT NULL,
                "UpdatedAt" TEXT NOT NULL
            );
            """);
        Execute(conn, """
            CREATE TABLE IF NOT EXISTS "ArtistMembers" (
                "MemberId" INTEGER NOT NULL CONSTRAINT "PK_ArtistMembers" PRIMARY KEY AUTOINCREMENT,
                "ArtistId" INTEGER NOT NULL,
                "Name" TEXT NOT NULL,
                "Role" TEXT NOT NULL,
                "PhotoUrl" TEXT NOT NULL,
                "JoinedAt" TEXT NULL,
                "CreatedAt" TEXT NOT NULL
            );
            """);
        Execute(conn, """
            CREATE TABLE IF NOT EXISTS "ArtistJourneyItems" (
                "JourneyId" INTEGER NOT NULL CONSTRAINT "PK_ArtistJourneyItems" PRIMARY KEY AUTOINCREMENT,
                "ArtistId" INTEGER NOT NULL,
                "Title" TEXT NOT NULL,
                "Description" TEXT NOT NULL,
                "ImageUrl" TEXT NOT NULL,
                "Category" TEXT NOT NULL,
                "Date" TEXT NULL,
                "CreatedAt" TEXT NOT NULL
            );
            """);

        // Index unik: satu user hanya punya satu profil artist
        Execute(conn, "CREATE UNIQUE INDEX IF NOT EXISTS \"IX_Artists_UserId\" ON \"Artists\" (\"UserId\");");
    }

    /// <summary>
    /// Akun demo Artist:
    /// - The Jeblogs (artist@gigradar.com / jeblogs@gigradar.com / artist123) -> ArtistId = 1
    /// - FSTVLST (fstvlst@gigradar.com / artist123) -> ArtistId = 2
    /// Beserta profil & konten demo untuk database lama — hanya diisi bila belum ada.
    /// </summary>
    private static void SeedArtistDemo(DbConnection conn)
    {
        // 1) Pastikan akun user Artist The Jeblogs ada
        var jeblogsUserId = 0;
        using (var findCmd = conn.CreateCommand())
        {
            findCmd.CommandText = "SELECT UserId FROM Users WHERE Email IN ('artist@gigradar.com', 'jeblogs@gigradar.com');";
            var result = findCmd.ExecuteScalar();
            if (result != null)
            {
                jeblogsUserId = Convert.ToInt32(result);
            }
            else
            {
                using var insertCmd = conn.CreateCommand();
                insertCmd.CommandText = """
                    INSERT INTO Users (Name, Email, PasswordHash, Role, RoleStatus, City, Latitude, Longitude, PhotoUrl, CreatedAt)
                    VALUES (@Name, @Email, @PasswordHash, @Role, 'Approved', @City, 0, 0, '', @CreatedAt);
                    SELECT last_insert_rowid();
                    """;
                var p = insertCmd.Parameters;
                p.Add(CreateParameter(conn, "@Name", "The Jeblogs"));
                p.Add(CreateParameter(conn, "@Email", "artist@gigradar.com"));
                p.Add(CreateParameter(conn, "@PasswordHash", BCrypt.Net.BCrypt.HashPassword("artist123")));
                p.Add(CreateParameter(conn, "@Role", "Artist"));
                p.Add(CreateParameter(conn, "@City", "Klaten"));
                p.Add(CreateParameter(conn, "@CreatedAt", DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss")));
                jeblogsUserId = Convert.ToInt32(insertCmd.ExecuteScalar());
            }
        }

        // 2) Pastikan akun user Artist FSTVLST ada
        var fstvlstUserId = 0;
        using (var findCmd = conn.CreateCommand())
        {
            findCmd.CommandText = "SELECT UserId FROM Users WHERE Email = 'fstvlst@gigradar.com';";
            var result = findCmd.ExecuteScalar();
            if (result != null)
            {
                fstvlstUserId = Convert.ToInt32(result);
            }
            else
            {
                using var insertCmd = conn.CreateCommand();
                insertCmd.CommandText = """
                    INSERT INTO Users (Name, Email, PasswordHash, Role, RoleStatus, City, Latitude, Longitude, PhotoUrl, CreatedAt)
                    VALUES (@Name, @Email, @PasswordHash, @Role, 'Approved', @City, 0, 0, '', @CreatedAt);
                    SELECT last_insert_rowid();
                    """;
                var p = insertCmd.Parameters;
                p.Add(CreateParameter(conn, "@Name", "FSTVLST"));
                p.Add(CreateParameter(conn, "@Email", "fstvlst@gigradar.com"));
                p.Add(CreateParameter(conn, "@PasswordHash", BCrypt.Net.BCrypt.HashPassword("artist123")));
                p.Add(CreateParameter(conn, "@Role", "Artist"));
                p.Add(CreateParameter(conn, "@City", "Yogyakarta"));
                p.Add(CreateParameter(conn, "@CreatedAt", DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss")));
                fstvlstUserId = Convert.ToInt32(insertCmd.ExecuteScalar());
            }
        }

        // 3) Sinkronkan nama dan profil artis utama ke database
        Execute(conn, $"""
            UPDATE Users SET Name = 'The Jeblogs', Role = 'Artist', RoleStatus = 'Approved', City = 'Klaten' WHERE UserId = {jeblogsUserId};
            UPDATE Users SET Name = 'FSTVLST', Role = 'Artist', RoleStatus = 'Approved', City = 'Yogyakarta' WHERE UserId = {fstvlstUserId};
            UPDATE Artists SET UserId = {jeblogsUserId}, Name = 'The Jeblogs', Genre = 'Rock', City = 'Klaten' WHERE ArtistId = 1;
            UPDATE Artists SET UserId = {fstvlstUserId}, Name = 'FSTVLST', Genre = 'Rock', City = 'Yogyakarta' WHERE ArtistId = 2;
            UPDATE Artists SET Name = 'Dongker', Genre = 'Punk', City = 'Bandung' WHERE ArtistId = 3;
            UPDATE Artists SET Name = 'Perunggu', Genre = 'Indie', City = 'Jakarta' WHERE ArtistId = 4;
            UPDATE Artists SET Name = 'Sukatani', Genre = 'Punk', City = 'Purbalingga' WHERE ArtistId = 5;
            UPDATE Artists SET Name = 'The Adams', Genre = 'Indie', City = 'Jakarta' WHERE ArtistId = 6;
            INSERT OR IGNORE INTO Artists (ArtistId, Name, Bio, Genre, City, PhotoUrl, CoverUrl, SocialLinks, CreatedAt, History) VALUES
                (7, 'Lomba Sihir', 'Kolektif pop alternatif Jakarta', 'Pop', 'Jakarta', '', '', '', '2026-01-01 00:00:00', ''),
                (8, 'Bernadya', 'Solois indie pop melankolis Surabaya', 'Pop', 'Surabaya', '', '', '', '2026-01-01 00:00:00', '');
        """);

        // 4) Konten demo hanya bila tabel masih kosong
        if (TableIsEmpty(conn, "AudioTracks"))
        {
            Execute(conn, """
                INSERT INTO "AudioTracks" ("ArtistId", "Title", "AudioUrl", "CoverUrl", "Genre", "DurationSeconds", "ReleaseDate", "CreatedAt") VALUES
                    (1, 'Bersandarlah', '', '', 'Rock', 30, '2023-11-20 00:00:00', '2023-11-20 00:00:00'),
                    (1, 'Menari Resah', '', '', 'Indie Rock', 30, '2023-11-20 00:00:00', '2023-11-20 00:00:00'),
                    (1, 'Atas Nama', '', '', 'Rock', 30, '2022-08-10 00:00:00', '2022-08-10 00:00:00'),
                    (2, 'Menantang Rasi Bintang', '', '', 'Rock', 30, '2014-09-03 00:00:00', '2014-09-03 00:00:00'),
                    (2, 'Ayunan Kapal', '', '', 'Visual Rock', 30, '2014-09-03 00:00:00', '2014-09-03 00:00:00'),
                    (2, 'Sireum Hideung', '', '', 'Rock', 30, '2020-06-16 00:00:00', '2020-06-16 00:00:00');
                """);
        }
        if (TableIsEmpty(conn, "ArtistAlbums"))
        {
            Execute(conn, """
                INSERT INTO "ArtistAlbums" ("ArtistId", "Title", "CoverUrl", "Description", "ReleaseDate", "CreatedAt") VALUES
                    (1, 'Sambutlah', '', 'Album penuh perdana berisi 8 nomor katarsis rock.', '2023-11-20 00:00:00', '2023-11-20 00:00:00'),
                    (2, 'Hits Kitsch', '', 'Album monumental penanda babak baru FSTVLST.', '2014-09-03 00:00:00', '2014-09-03 00:00:00');
                """);
        }
        if (TableIsEmpty(conn, "ArtistPosts"))
        {
            Execute(conn, """
                INSERT INTO "ArtistPosts" ("ArtistId", "Title", "Content", "ImageUrl", "IsPublished", "CreatedAt", "UpdatedAt") VALUES
                    (1, 'Koor massal Bersandarlah!', 'Terima kasih untuk seluruh kawan skena yang bernyanyi bersama kami di panggung festival! 🎸', '', 1, '2026-10-15 00:00:00', '2026-10-15 00:00:00'),
                    (1, 'Menuju Panggung Skena Riuh', 'Sampai jumpa di panggung akbar bersama kawan-kawan FSTVLST bulan ini!', '', 1, '2026-10-18 00:00:00', '2026-10-18 00:00:00'),
                    (2, 'Almost Rock Barely Art di Panggung!', 'Malam yang magis bersama kawan-kawan festivalist dan The Jeblogs di Yogyakarta! 🤘', '', 1, '2026-10-19 00:00:00', '2026-10-19 00:00:00');
                """);
        }
        if (TableIsEmpty(conn, "ArtistMembers"))
        {
            Execute(conn, """
                INSERT INTO "ArtistMembers" ("ArtistId", "Name", "Role", "PhotoUrl", "JoinedAt", "CreatedAt") VALUES
                    (1, 'Amir M.', 'Vokal', '', '2016-08-17 00:00:00', '2016-08-17 00:00:00'),
                    (1, 'Valentino Mahoni', 'Gitar', '', '2016-08-17 00:00:00', '2016-08-17 00:00:00'),
                    (1, 'Febrianto Prima', 'Gitar', '', '2016-08-17 00:00:00', '2016-08-17 00:00:00'),
                    (1, 'Ryan Ramadhan', 'Bass', '', '2016-08-17 00:00:00', '2016-08-17 00:00:00'),
                    (1, 'Dani Ardian', 'Drum', '', '2016-08-17 00:00:00', '2016-08-17 00:00:00'),
                    (2, 'Farid Stevy Asta', 'Vokal / Visual', '', '2011-01-01 00:00:00', '2011-01-01 00:00:00'),
                    (2, 'Roby Setiawan', 'Gitar', '', '2011-01-01 00:00:00', '2011-01-01 00:00:00'),
                    (2, 'Fendry Aryo', 'Bass', '', '2011-01-01 00:00:00', '2011-01-01 00:00:00'),
                    (2, 'Danish Wisnu', 'Drum', '', '2018-05-01 00:00:00', '2018-05-01 00:00:00');
                """);
        }
        if (TableIsEmpty(conn, "ArtistJourneyItems"))
        {
            Execute(conn, """
                INSERT INTO "ArtistJourneyItems" ("ArtistId", "Title", "Description", "ImageUrl", "Category", "Date", "CreatedAt") VALUES
                    (1, 'Band terbentuk di Klaten', 'Bermula dari Karang Taruna Galur Manggala Desa Jeblog.', '', 'Formation', '2016-08-17 00:00:00', '2016-08-17 00:00:00'),
                    (1, 'Rilis EP perdana', 'Direkam swadaya di balai desa.', '', 'Single', '2018-08-17 00:00:00', '2018-08-17 00:00:00'),
                    (1, 'Rilis Album Sambutlah', 'Album penuh perdana meledak di panggung independen nasional.', '', 'Album', '2023-11-20 00:00:00', '2023-11-20 00:00:00'),
                    (2, 'Transformasi dari Jenny', 'Lahir kembali menjadi FSTVLST di kampus ISI Yogyakarta.', '', 'Formation', '2011-01-01 00:00:00', '2011-01-01 00:00:00'),
                    (2, 'Rilis Hits Kitsch', 'Album seminal yang melahirkan lagu kebangsaan Menantang Rasi Bintang.', '', 'Album', '2014-09-03 00:00:00', '2014-09-03 00:00:00');
                """);
        }

        // 5) Follower demo (Admin & EO) — hanya bila belum ada
        Execute(conn, "INSERT OR IGNORE INTO Follows (UserId, ArtistId, CreatedAt) VALUES (1, 1, '2026-01-01 00:00:00');");
        Execute(conn, "INSERT OR IGNORE INTO Follows (UserId, ArtistId, CreatedAt) VALUES (2, 1, '2026-01-01 00:00:00');");
        Execute(conn, "INSERT OR IGNORE INTO Follows (UserId, ArtistId, CreatedAt) VALUES (1, 2, '2026-01-01 00:00:00');");
        Execute(conn, "INSERT OR IGNORE INTO Follows (UserId, ArtistId, CreatedAt) VALUES (4, 2, '2026-01-01 00:00:00');");
    }

    private static bool TableIsEmpty(DbConnection conn, string table)
    {
        using var cmd = conn.CreateCommand();
        cmd.CommandText = $"SELECT COUNT(*) FROM \"{table}\";";
        return Convert.ToInt64(cmd.ExecuteScalar() ?? 0) == 0;
    }

    private static DbParameter CreateParameter(DbConnection conn, string name, object value)
    {
        var param = conn.CreateCommand().CreateParameter();
        param.ParameterName = name;
        param.Value = value;
        return param;
    }

    private static List<string> GetColumns(DbConnection conn, string table)
    {
        var result = new List<string>();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = $"PRAGMA table_info(\"{table}\");";
        using var reader = cmd.ExecuteReader();
        while (reader.Read())
            result.Add(reader.GetString(1));
        return result;
    }

    private static void Execute(DbConnection conn, string sql)
    {
        using var cmd = conn.CreateCommand();
        cmd.CommandText = sql;
        cmd.ExecuteNonQuery();
    }
}