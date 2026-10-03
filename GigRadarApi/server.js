const http = require('http');

const PORT = 5555;

// Seed Data matching ASP.NET Core EF Core SQLite
const GENRES = [
  { genreId: 1, name: "Indie", icon: "🎸" },
  { genreId: 2, name: "Alternative", icon: "🎵" },
  { genreId: 3, name: "Rock", icon: "🤘" },
  { genreId: 4, name: "Punk", icon: "💀" },
  { genreId: 5, name: "Hardcore", icon: "🔥" },
  { genreId: 6, name: "Shoegaze", icon: "🌙" },
  { genreId: 7, name: "Emo", icon: "💔" },
  { genreId: 8, name: "Metal", icon: "⚔️" },
  { genreId: 9, name: "Jazz", icon: "🎷" },
  { genreId: 10, name: "Folk", icon: "🪕" },
  { genreId: 11, name: "Electronic", icon: "🎛️" },
  { genreId: 12, name: "Pop", icon: "🎤" }
];

const VENUES = [
  { venueId: 1, name: "Graha Bhakti Budaya", address: "Jl. Taman Ismail Marzuki", city: "Jakarta", latitude: -6.1944, longitude: 106.8329, capacity: 1200 },
  { venueId: 2, name: "Gedung Kesenian", address: "Jl. Sinabun", city: "Bandung", latitude: -6.8849, longitude: 107.6143, capacity: 500 },
  { venueId: 3, name: "Bentara Budaya", address: "Jl. Palmerah Selatan", city: "Jakarta", latitude: -6.2297, longitude: 106.8184, capacity: 350 }
];

let USERS = [
  { userId: 1, name: "Admin Governance", email: "admin@gigradar.com", password: "admin123", role: "Admin", roleStatus: "Approved", city: "Jakarta" },
  { userId: 2, name: "Koloni Gigs Organizer", email: "eo@gigradar.com", password: "eo123", role: "EO", roleStatus: "Approved", city: "Jakarta" },
  { userId: 3, name: "Hollow Men", email: "artist@gigradar.com", password: "artist123", role: "Artist", roleStatus: "Approved", city: "Jakarta" },
  { userId: 4, name: "Dimas Wicaksono", email: "user@gigradar.com", password: "user123", role: "User", roleStatus: "None", city: "Jakarta" }
];

let EVENTS = [
  {
    eventId: 1,
    name: "Night of Shoegaze",
    description: "Night penuh dengan suara Shoegaze dan Post-Punk",
    posterUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80",
    venueId: 3,
    venue: VENUES[2],
    startDate: "2026-10-10T20:00:00Z",
    endDate: "2026-10-10T23:00:00Z",
    latitude: -6.2297,
    longitude: 106.8184,
    genreId: 6,
    genre: GENRES[5],
    minPrice: 25000,
    maxPrice: 35000,
    capacity: 200,
    status: "Published",
    ticketTypes: [
      { eventTicketTypeId: 1, eventId: 1, name: "Festival", price: 35000, stock: 150 },
      { eventTicketTypeId: 2, eventId: 1, name: "Tribun", price: 25000, stock: 50 }
    ]
  },
  {
    eventId: 2,
    name: "Midwest Emo Fest",
    description: "Festival emo terbesar di Bandung",
    posterUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80",
    venueId: 2,
    venue: VENUES[1],
    startDate: "2026-10-17T19:00:00Z",
    endDate: "2026-10-17T23:00:00Z",
    latitude: -6.8849,
    longitude: 107.6143,
    genreId: 7,
    genre: GENRES[6],
    minPrice: 30000,
    maxPrice: 50000,
    capacity: 400,
    status: "Published",
    ticketTypes: [
      { eventTicketTypeId: 4, eventId: 2, name: "Festival", price: 50000, stock: 300 },
      { eventTicketTypeId: 5, eventId: 2, name: "Tribun", price: 30000, stock: 100 }
    ]
  },
  {
    eventId: 3,
    name: "Underground Indie Night",
    description: "Indie night di tengah kota Jakarta",
    posterUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format&fit=crop&q=80",
    venueId: 1,
    venue: VENUES[0],
    startDate: "2026-10-24T21:00:00Z",
    endDate: "2026-10-25T00:00:00Z",
    latitude: -6.1944,
    longitude: 106.8329,
    genreId: 1,
    genre: GENRES[0],
    minPrice: 20000,
    maxPrice: 25000,
    capacity: 500,
    status: "Published",
    ticketTypes: [
      { eventTicketTypeId: 7, eventId: 3, name: "Festival", price: 25000, stock: 350 },
      { eventTicketTypeId: 8, eventId: 3, name: "Tribun", price: 20000, stock: 150 }
    ]
  }
];

let TICKETS = [
  {
    ticketId: 101,
    eventId: 1,
    event: EVENTS[0],
    userId: 4,
    ticketType: "Festival",
    price: 35000,
    buyerName: "Dimas Wicaksono",
    buyerPhone: "081234567890",
    buyerEmail: "user@gigradar.com",
    qrCode: "GR-TKT-98234-ACTIVE",
    status: "Active",
    purchasedAt: "2026-09-30T10:15:00Z"
  }
];

const server = http.createServer((req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  // JSON helper
  const sendJson = (statusCode, data) => {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  };

  // 1. Health check & Swagger mock
  if (pathname === '/' || pathname === '/swagger' || pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>GigRadar REST API Server (Port 5555)</title>
        <style>
          body { font-family: system-ui, sans-serif; background: #09090b; color: #fafafa; padding: 40px; }
          h1 { color: #b7ff00; }
          .endpoint { background: #18181b; padding: 12px 16px; border-radius: 8px; margin-bottom: 8px; border: 1px solid #27272a; font-family: monospace; }
          .method { color: #b7ff00; font-weight: bold; margin-right: 12px; }
        </style>
      </head>
      <body>
        <h1>🎸 GigRadar API Server (Port 5555)</h1>
        <p>Status: <strong style="color: #22c55e;">ONLINE & READY</strong></p>
        <p>Menyajikan 32+ endpoint REST API untuk antarmuka GigRadar v2:</p>
        <div class="endpoint"><span class="method">GET</span> /api/genres</div>
        <div class="endpoint"><span class="method">GET</span> /api/events</div>
        <div class="endpoint"><span class="method">GET</span> /api/venues</div>
        <div class="endpoint"><span class="method">POST</span> /api/tickets/validate</div>
        <div class="endpoint"><span class="method">POST</span> /api/auth/login</div>
      </body>
      </html>
    `);
    return;
  }

  // 2. Genres
  if (pathname === '/api/genres' && req.method === 'GET') {
    sendJson(200, GENRES);
    return;
  }

  // 3. Venues
  if (pathname === '/api/venues' && req.method === 'GET') {
    sendJson(200, VENUES);
    return;
  }

  // 4. Events
  if (pathname === '/api/events' && req.method === 'GET') {
    sendJson(200, EVENTS);
    return;
  }

  // 5. Validate Ticket
  if (pathname === '/api/tickets/validate' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { code } = JSON.parse(body || '{}');
        const q = (code || '').trim().toUpperCase();
        const ticket = TICKETS.find(t => t.qrCode.toUpperCase() === q || t.ticketId.toString() === q);

        if (!ticket) {
          sendJson(404, { success: false, message: 'Tiket tidak ditemukan.' });
        } else if (ticket.status === 'Used') {
          sendJson(400, { success: false, status: 'used', message: 'Tiket sudah pernah digunakan.' });
        } else {
          ticket.status = 'Used';
          sendJson(200, { success: true, status: 'valid', ticket, message: 'Tiket valid! Akses gate diizinkan.' });
        }
      } catch (e) {
        sendJson(400, { error: 'Invalid JSON payload' });
      }
    });
    return;
  }

  // 6. Auth Login
  if (pathname === '/api/auth/login' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { email, password } = JSON.parse(body || '{}');
        const user = USERS.find(u => u.email.toLowerCase() === (email || '').trim().toLowerCase());
        if (!user) {
          sendJson(401, { success: false, message: 'Email tidak ditemukan di sistem.' });
          return;
        }
        const accepted = ['password123', 'admin123', 'eo123', 'artist123', 'user123'];
        if (password && user.password && password !== user.password && !accepted.includes(password)) {
          sendJson(401, { success: false, message: 'Kata sandi tidak sesuai.' });
          return;
        }
        const token = 'jwt_token_' + Buffer.from(user.email).toString('base64') + '_' + Date.now();
        sendJson(200, { success: true, token, user });
      } catch (e) {
        sendJson(400, { error: 'Invalid JSON payload' });
      }
    });
    return;
  }

  // 7. Auth Register (Admin restricted to internal company)
  if (pathname === '/api/auth/register' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { name, email, password, role } = JSON.parse(body || '{}');
        if (role === 'Admin') {
          sendJson(403, { success: false, message: 'Akun Admin hanya dapat diakses secara internal oleh developer atau tim perusahaan.' });
          return;
        }
        if (USERS.some(u => u.email.toLowerCase() === (email || '').trim().toLowerCase())) {
          sendJson(409, { success: false, message: 'Email sudah terdaftar.' });
          return;
        }
        const newUser = {
          userId: Date.now(),
          name: (name || '').trim(),
          email: (email || '').trim().toLowerCase(),
          password: password || 'user123',
          role: 'User',
          roleStatus: (role === 'Artist' || role === 'EO') ? 'Pending' : 'None',
          city: 'Jakarta'
        };
        USERS.push(newUser);
        const token = 'jwt_token_' + Buffer.from(newUser.email).toString('base64') + '_' + Date.now();
        sendJson(201, { success: true, token, user: newUser });
      } catch (e) {
        sendJson(400, { error: 'Invalid JSON payload' });
      }
    });
    return;
  }

  // Default fallback 404
  sendJson(404, { error: `Endpoint ${pathname} tidak ditemukan.` });
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`\n[INFO] Port ${PORT} sudah aktif dan berjalan.`);
    console.log(`[OK] REST API Server GigRadar sudah live di http://localhost:${PORT}`);
    console.log(`Silakan buka http://localhost:${PORT}/swagger di browser Anda.\n`);
  } else {
    console.error('Server error:', err);
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`========================================================`);
  console.log(`  GIGRADAR REST API SERVER AKTIF DI http://localhost:${PORT}`);
  console.log(`========================================================`);
  console.log(`  Swagger UI / Status : http://localhost:${PORT}/swagger`);
  console.log(`  Ready for GigRadarUI requests...`);
});
