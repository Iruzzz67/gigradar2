# 📚 Dokumentasi Resmi Proyek GigRadar
## *"Menghubungkan Skena, Menemukan Suara Lokal"*

Selamat datang di repositori dokumentasi resmi proyek **GigRadar**. Folder ini memuat spesifikasi produk, cetak biru arsitektur teknis sistem, rekapan fungsionalitas, serta panduan pengembang yang dirancang secara komprehensif dan profesional.

---

## 📂 Struktur & Navigasi Dokumen

Folder `docs/` ini terdiri dari dokumen-dokumen utama berikut:

```text
docs/
├── README.md                   # Indeks dan petunjuk membaca dokumentasi (File ini)
├── PRD.md                      # Product Requirement Document (PRD) komprehensif v2.0
├── GAMBARAN_LENGKAP_APLIKASI.md# Gambaran Lengkap & Arsitektur Teknis Sistem
└── REKAPAN_APLIKASI.md         # Markdown Rekapan Lengkap & Status Implementasi
```

---

## 📖 Ringkasan Dokumen dalam Folder

### 1. [📄 Product Requirement Document (PRD.md)](./PRD.md)
Dokumen standar industri yang menguraikan visi strategis dan kebutuhan fungsional produk:
- **Executive Summary & Problem Statement:** Masalah fragmentasi skena musik independen lokal.
- **Strategic Objectives & Key Results (OKRs / KPIs):** Metrik adopsi pengguna, retensi, dan volume transaksi.
- **User Personas & Journey Maps:** Profil dan perjalanan pengguna untuk User (Penonton), EO (Promotor), Artist (Musisi), dan Admin (Operator).
- **Spesifikasi Kebutuhan Fungsional (FR):** 9 modul fungsional mencakup autentikasi, onboarding, LBS & Radar spasial, mesin tiket berjenjang 3-tahap, dashboard EO, portal musisi, fitur sosial, dan moderasi peran.
- **Kebutuhan Non-Fungsional (NFR):** Kriteria performa, latensi, privasi geolokasi minimal, keandalan, dan aksesibilitas *Dark Zinc*.
- **Release Strategy & Roadmap:** Pembagian fase dari MVP hingga ekspansi kecerdasan buatan (*Machine Learning Recommendation*).

### 2. [🌐 Gambaran Lengkap & Arsitektur Teknis Sistem (GAMBARAN_LENGKAP_APLIKASI.md)](./GAMBARAN_LENGKAP_APLIKASI.md)
Cetak biru rekayasa perangkat lunak dan spesifikasi teknis arsitektur:
- **Filosofi Arsitektur Client-Server:** Pemisahan lapisan presentasi .NET MAUI dan lapisan API ASP.NET Core.
- **Dekomposisi Komponen & Kode:** Struktur modul di `GigRadarApi`, `GigRadarMobile`, dan `GigRadarLauncher`.
- **Dynamic Multi-Role Shell Navigation:** Mekanisme mutasi cangkang navigasi bawah (`UserShell`, `EOShell`, `ArtistShell`, `AdminShell`) via `ShellRouter.cs`.
- **Siklus Hidup Tiket & Validasi Gatekeeper:** Alur transaksi 3 tahap, validasi identitas, pengurangan kuota stok atomik, dan validasi kode QR di pintu masuk.
- **Mesin Spasial LBS & Radar Canvas:** Algoritma Haversine, sudut bearing, dan proyeksi koordinat kutub ke kartesius kanvas `GraphicsView`.
- **Entity-Relationship Blueprint (ERD):** Diagram relasi untuk ke-17 entitas dan mekanisme migrasi skema idempoten `TicketSchemaBootstrap.cs`.
- **Katalog Lengkap REST API:** Dokumentasi 32+ endpoint dari 8 controller.
- **Panduan Lingkungan Build:** Petunjuk kompilasi untuk target Windows Native, Android Emulator, dan macOS.

### 3. [📊 Rekapan Lengkap Aplikasi (REKAPAN_APLIKASI.md)](./REKAPAN_APLIKASI.md)
Ringkasan eksekutif dan status implementasi proyek per Oktober 2026:
- **Kilas Teknologi & Metrik Terkini:** Rangkuman total controller, endpoint, halaman XAML, ViewModel, dan tabel database.
- **Matriks Status Fitur:** Inventarisasi fitur yang telah selesai (75%), tahap simulasi/integrasi (15%), dan backlog mendatang (10%).
- **Role Capability Matrix:** Tabel perbandingan hak akses dan fungsionalitas antar peran (User, Artist, EO, Admin).
- **Akun Uji Coba Bawaan:** Kredensial siap pakai untuk Admin, EO, dan Artist demo.
- **Analisis Deviasi Teknis & Technical Debt:** Evaluasi SQLite vs PostgreSQL, simulasi checkout pembayaran, dan peningkatan visual barcode ke QR matriks 2D.
- **Petunjuk Cepat Menjalankan Sistem (Quickstart):** Cara menjalankan API dan aplikasi dengan shortcut batch maupun CLI.

---

## 🎯 Panduan Membaca Berdasarkan Peran Pemangku Kepentingan

| Peran Anda | Dokumen Rekomendasi yang Wajib Dibaca |
| :--- | :--- |
| **Product Manager / Business Stakeholder** | Awali dengan **[`PRD.md`](./PRD.md)** untuk memahami problem statement, persona, dan KPI bisnis, lalu baca **[`REKAPAN_APLIKASI.md`](./REKAPAN_APLIKASI.md)** untuk melihat status pencapaian fitur. |
| **Backend & Cloud Engineer** | Fokus pada bagian Arsitektur, ERD, dan Katalog API di **[`GAMBARAN_LENGKAP_APLIKASI.md`](./GAMBARAN_LENGKAP_APLIKASI.md)** serta mekanisme `TicketSchemaBootstrap`. |
| **Mobile & Frontend Developer** | Pelajari Dynamic Shell Routing, LocationService, dan RadarDrawable di **[`GAMBARAN_LENGKAP_APLIKASI.md`](./GAMBARAN_LENGKAP_APLIKASI.md)** dan panduan desain di `../GIGRADAR_DESIGN_SYSTEM.md`. |
| **QA / Tester & Reviewer** | Buka **[`REKAPAN_APLIKASI.md`](./REKAPAN_APLIKASI.md)** untuk melihat akun demo pengujian, matriks kapabilitas role, dan alur validasi tiket. |

---
*Dokumentasi ini dikelola secara terpusat untuk memastikan konsistensi antara visi produk dan implementasi kode nyata di repository GigRadar.*
