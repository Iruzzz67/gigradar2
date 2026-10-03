# 🎸 GigRadar v2 — Underground Music & Spatial Gig Radar

> **Menghubungkan Skena, Menemukan Suara Lokal.**  
> Implementasi total UI/UX Rebuild berbasis **[UI_UX_REBUILD_SPEC.md](file:///C:/Users/aldii/gigradar2/UI_UX_REBUILD_SPEC.md)** dengan ekosistem modern: **React 19 + TypeScript + Vite + Tailwind CSS + Three.js (WebGL)**, di-host oleh **.NET MAUI WebView & Native Bridge**, serta didukung **ASP.NET Core Web API 8 + SQLite**.

---

## 🌟 1. Arsitektur 3-Layer

```text
┌───────────────────────────────────────────────────────────┐
│              GIGRADAR UI (Vite + React 19 + Three.js)     │
│                                                           │
│  • Visual Identity: Dark Zinc (#09090b) & Signal Lime     │
│  • Signature Radar: 3D WebGL (Three.js) & 2D Canvas 60FPS │
│  • Dynamic Role Navigation (User, Artist, EO, Admin)      │
│  • 3-Step Checkout, E-Tiket QR Matrix & Gate Scanner      │
│  • Multi-device Responsive (Mobile Sheet, Desktop Shell)  │
└─────────────────────────────┬─────────────────────────────┘
                              │
                    MAUI WEBVIEW / BRIDGE
                              │
┌─────────────────────────────▼─────────────────────────────┐
│          NATIVE HOST LAYER (C# .NET MAUI)                 │
│                                                           │
│  • Native Device Permissions (Location GPS & Camera)      │
│  • MauiBridgeHandler (IPC Communication)                  │
│  • Haptic Feedback & Native Share                         │
│  • Offline Asset Packaging (Resources/Raw/wwwroot)        │
└─────────────────────────────┬─────────────────────────────┘
                              │
                    REST HTTPS / JWT BEARER
                              │
┌─────────────────────────────▼─────────────────────────────┐
│         BACKEND AUTHORITY (ASP.NET Core Web API 8)        │
│                                                           │
│  • JWT Bearer Authentication & BCrypt Password Hash       │
│  • Atomic Stock Validation & Ticket Generation            │
│  • SQLite + EF Core 8 (12 DbSets, 7 Controllers)          │
│  • Role-Based Access Control (RBAC)                       │
└───────────────────────────────────────────────────────────┘
```

---

## 🚀 2. Fitur Utama yang Telah Diimplementasikan

### 📡 A. Signature Spatial Radar
- **Dual Rendering Engine**:
  - **3D Spatial Mode (Three.js WebGL)**: Bidang kisi konsentris 3D, sorot sapuan radar (*sweep cone*), orb melayang dengan kode warna genre, dan interaksi *raycasting* saat node disentuh.
  - **2D Canvas Mode (High-Performance 60 FPS)**: Render vektor mulus dengan konsumsi daya baterai minimal, ideal untuk perangkat mobile.
  - **Accessible List Fallback**: Tampilan daftar terurut jarak sesuai pedoman aksesibilitas non-visual (Bagian 54).
- **Quick Preview Sheet**: Menampilkan poster, nama gig, venue, jarak, dan tombol aksi cepat 1-tap saat node disentuh.
- **Sensor GPS Cerdas**: Mengambil koordinat perangkat fisik via Native Bridge MAUI / Geolocation API, dengan fallback otomatis ke pusat skena musik Jakarta & Bandung.

### 🎫 B. Alur Tiket & Gate Validator (3-Stage Flow)
1. **01 Pilih Kategori Tiket**: Pilihan tiket (VIP, Regular, Presale, Bundling) dengan perhitungan sisa stok dinamis (*atomic decrement*).
2. **02 Data Pengunjung**: Validasi ketat nama lengkap (min 3 huruf), nomor telepon (min 9 digit), email sah, dan batas usia min 17 tahun.
3. **03 E-Tiket Terverifikasi**: Menghasilkan kartu pass digital dengan **QR matrix visual** beresolusi tinggi dan kode verifikasi unik.
4. **Gate Validator (EO & Admin)**: Pemindai tiket dengan status langsung berlatar warna kontras tinggi untuk kondisi venue minim cahaya (*VALID TICKET* [Hijau], *ALREADY USED* [Kuning/Amber], *INVALID TICKET* [Merah]).

### 🎵 C. Artist Hub (Band & Musisi)
- **Audio Preview Player**: Pemutar cuplikan trek 30 detik dilengkapi *waveform scrubber* dan kontrol putar/jeda.
- **7 Modul Lengkap**: Bio/About, Trek Lagu, Diskografi Album, Kabar/Update Band, Timeline Perjalanan Karir (*Journey*), dan Personil Band.

### 🎪 D. Promotor & Event Organizer (EO Console)
- **Wizard Buat Gig 5 Langkah**: Info Dasar, Lokasi Venue, Kurasi Lineup Band, Tipe Tiket & Kuota, hingga Publikasi.
- **Analitik Penjualan**: Grafik persentase okupansi venue, metrik Gross Revenue (GMV), dan tiket terjual.

### 🛡️ E. Admin Governance & Control Center
- **Antrian Permohonan Role**: Menyetujui atau menolak pendaftaran akun Artist dan EO secara *real-time*.
- **Direktori Pengguna Global**: Pencarian dan filter akun berdasarkan peran.
- **Audit & Moderasi Acara**: Meninjau kelayakan publikasi gig di seluruh sistem.

### ⚡ F. Fast Role Switcher
- Terdapat tombol pintas peran di bilah atas (*Header*) yang memungkinkan evaluasi instan antarmuka untuk keempat role: **User**, **Artist**, **EO**, dan **Admin** tanpa perlu repot logout-login berulang kali.

---

## 💻 3. Cara Menjalankan Proyek

### A. Menjalankan Antarmuka Web (GigRadarUI)
Pastikan Node.js terpasang pada sistem Anda:
```bash
# Opsi 1: Menjalankan langsung via script batch
Double-click: StartUI.bat

# Opsi 2: Via terminal
cd GigRadarUI
npm run dev
```
Buka browser di **`http://localhost:3333`** atau alamat yang ditampilkan terminal.

### B. Membangun Aset untuk Host MAUI
Untuk menyinkronkan hasil build web ke dalam aset lokal aplikasi mobile:
```bash
Double-click: BuildUI.bat
```
Script ini akan mengompilasi TypeScript, Tailwind CSS, dan Three.js, lalu otomatis menyalin bundel ke folder `GigRadarMobile/Resources/Raw/wwwroot`.

### C. Menjalankan Backend API
```bash
Double-click: StartApi.bat
```
Backend akan aktif di `http://localhost:5555/api` dan Swagger UI di `http://localhost:5555/swagger`.
*(Catatan: GigRadarUI memiliki sistem repository reaktif lokal bawaan, sehingga antarmuka tetap dapat beroperasi 100% mulus dengan data demo seeded meskipun backend sedang tidak menyala).*

---

## 📂 4. Struktur Direktori Proyek

```text
gigradar2/
├── GigRadarUI/                 # Frontend Modern (React 19 + TypeScript + Tailwind + Three.js)
│   ├── src/
│   │   ├── components/         # Komponen UI, Event, Artist, Radar, Ticket, Layout, Forms
│   │   ├── context/            # AuthContext (Role & Session), LocationContext (GPS & Bearing)
│   │   ├── services/           # ApiClient, LocalStorage Repository, NativeBridge
│   │   ├── views/              # Layar Auth, User, Artist, EO, Admin
│   │   └── types/              # Definisi interface TypeScript
│   └── vite.config.ts          # Konfigurasi Vite & Tailwind CSS v4
│
├── GigRadarMobile/             # Host Aplikasi Native (.NET MAUI)
│   ├── Bridge/                 # MauiBridgeHandler (C# Native Interop)
│   └── Resources/Raw/wwwroot/  # Bundel aset web yang siap disajikan oleh WebView
│
├── GigRadarApi/                # Backend REST API (ASP.NET Core 8 Web API + SQLite)
│   ├── Controllers/            # 7 API Controllers
│   ├── Data/                   # AppDbContext & SQLite Database (GigRadar.db)
│   └── Models/                 # Entitas C# (User, Event, Ticket, Artist, dll.)
│
├── StartUI.bat                 # Script peluncur instan frontend
├── BuildUI.bat                 # Script kompilasi & sinkronisasi aset
├── StartApi.bat                # Script peluncur backend
└── README.md
```

---
*Dikembangkan dengan dedikasi penuh untuk skena musik independen.*
