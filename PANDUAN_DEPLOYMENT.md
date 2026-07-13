# 🚀 Panduan Lengkap Deployment & Penggunaan
**Sistem Informasi Arus Kas (SIAK) - GMAHK Teratai**

Aplikasi **SIAK GMAHK Teratai** dirancang sangat fleksibel dan dapat dijalankan dalam 3 (tiga) mode deployment sesuai dengan kebutuhan, skala penggunaan, dan infrastruktur yang tersedia di gereja Anda:

---

## 📋 Daftar Isi
1. [Opsi 1: Mode Offline / Lokal (Termudah & Tanpa Server)](#1-opsi-1-mode-offline--lokal-termudah--tanpa-server)
2. [Opsi 2: Mode Cloud Sync dengan Google Sheets (Rekomendasi Utama)](#2-opsi-2-mode-cloud-sync-dengan-google-sheets-rekomendasi-utama)
   - [A. Persiapan Google Sheets & Apps Script](#a-persiapan-google-sheets--apps-script)
   - [B. Menghubungkan Aplikasi ke Cloud Sync](#b-menghubungkan-aplikasi-ke-cloud-sync)
   - [C. Cara Hosting Gratis agar Bisa Diakses dari HP/Tablet](#c-cara-hosting-gratis-agar-bisa-diakses-dari-hptablet)
3. [Opsi 3: Mode Server Lokal (Node.js & SQLite)](#3-opsi-3-mode-server-lokal-nodejs--sqlite)
4. [💡 Tips Backup & Keamanan Data](#4--tips-backup--keamanan-data)
5. [❓ Troubleshooting (Solusi Masalah Umum)](#5--troubleshooting-solusi-masalah-umum)

---

## 1. Opsi 1: Mode Offline / Lokal (Termudah & Tanpa Server)

Mode ini sangat cocok jika aplikasi hanya digunakan oleh **satu orang bendahara** pada satu komputer/laptop utama tanpa memerlukan koneksi internet.

### 🛠️ Cara Menjalankan:
1. Buka folder proyek **GMAHK Teratai** di komputer Anda.
2. Cari file `index.html`.
3. **Klik ganda (Double-click)** file `index.html` tersebut. Aplikasi akan langsung terbuka di browser web default Anda (Google Chrome, Microsoft Edge, Mozilla Firefox, atau Safari).
4. Aplikasi siap digunakan! Semua data transaksi dan template nama pemberi akan disimpan secara otomatis di **Local Storage (memori browser)** komputer tersebut.

> [!WARNING]
> **Perhatian Mode Offline:**
> Karena data disimpan di dalam memori browser lokal, **jangan membersihkan cache/data browser (Clear Browsing Data)** sebelum melakukan export laporan atau backup. Sangat disarankan untuk rutin mengunduh laporan dalam format **Excel (.xlsx)** atau **PDF** melalui menu **Laporan**.

---

## 2. Opsi 2: Mode Cloud Sync dengan Google Sheets (Rekomendasi Utama)

Mode ini adalah **pilihan terbaik dan paling direkomendasikan** karena 100% gratis, data tersimpan aman di cloud (Google Drive gereja), dan dapat sinkronisasi secara real-time apabila diakses dari beberapa perangkat berbeda (PC Bendahara, Tablet, atau HP).

### A. Persiapan Google Sheets & Apps Script
1. Buka [Google Sheets](https://sheets.google.com) dan buat spreadsheet baru. Beri nama, misalnya: `Database Keuangan GMAHK Teratai`.
2. *(Opsional)* Anda tidak perlu membuat sheet secara manual karena **`backend.gs` v2.0 otomatis membuat 3 Sheet terpisah** saat sinkronisasi:
   - **`Pemasukan`** (Untuk mencatat seluruh transaksi kas masuk dengan header biru formal)
   - **`Pengeluaran`** (Untuk mencatat seluruh transaksi kas keluar dengan header merah formal)
   - **`Donors`** (Untuk daftar master nama pemberi)
3. Pada menu di bagian atas Google Sheets, klik: **Ekstensi > Apps Script**.
5. Di jendela Apps Script yang terbuka, hapus seluruh kode default yang ada di dalam editor.
6. Buka file `backend.gs` dari folder proyek ini, **salin (copy) seluruh isinya**, lalu **tempel (paste)** ke editor Apps Script tersebut.
7. Klik ikon **Simpan (Save / ikon disket)** di bagian atas.
8. Klik tombol biru di pojok kanan atas: **Terapkan (Deploy) > Deployment baru (New deployment)**.
9. Pada kolom **Pilih jenis (Select type)** di sebelah kiri (ikon gerigi), pilih **Aplikasi Web (Web App)**.
10. Atur konfigurasi berikut:
    - **Deskripsi:** `SIAK Backend v1`
    - **Jalankan sebagai (Execute as):** **Saya (Me / Email Anda)**
    - **Siapa yang memiliki akses (Who has access):** **Siapa saja (Anyone)** *(Penting agar aplikasi bisa membaca/menulis data tanpa error login)*
11. Klik **Terapkan (Deploy)**.
12. Jika muncul jendela otorisasi:
    - Klik **Beri akses (Authorize access)**.
    - Pilih akun Google Anda.
    - Klik **Advanced (Lanjutan)** > pilih **Go to ... (unsafe) / Buka ... (tidak aman)**.
    - Klik **Allow (Izinkan)**.
13. Setelah selesai, salin **URL Web App** yang generated (dimulai dengan `https://script.google.com/macros/s/.../exec`).

### B. Menghubungkan Aplikasi ke Cloud Sync
1. Buka aplikasi SIAK GMAHK Teratai (`index.html`) di browser.
2. Pada halaman utama (Beranda/Dashboard), klik tombol **Pengaturan Cloud Sync** (ikon awan/cloud).
3. Tempelkan (paste) **URL Web App** dari Google Apps Script tadi ke dalam kolom yang tersedia.
4. Klik tombol **Simpan**.
5. Aplikasi otomatis terhubung ke Google Sheets! Setiap kali Anda memasukkan transaksi baru atau menambahkan template nama, data akan disinkronkan ke Google Spreadsheet tersebut.

### C. Cara Hosting Gratis agar Bisa Diakses dari HP/Tablet
Agar admin atau bendahara bisa membuka aplikasi dari HP tanpa harus menyalin file `index.html` satu per satu, Anda bisa meng-hosting file HTML ini secara gratis melalui **GitHub Pages**, **Vercel**, atau **Netlify**:

#### Cara Tercepat dengan Vercel / Netlify Drop:
1. Buka situs [Netlify Drop](https://app.netlify.com/drop).
2. Tarik dan lepas (drag & drop) folder proyek **GMAHK Teratai** ke halaman tersebut.
3. Dalam beberapa detik, Netlify akan memberikan tautan web (link URL gratis, misal: `https://gmahk-teratai.netlify.app`).
4. Bagikan link tersebut kepada bendahara atau admin gereja. Saat dibuka di HP, cukup masukkan URL Google Apps Script di menu Cloud Sync, dan aplikasi langsung tersinkronisasi!

---

## 3. Opsi 3: Mode Server Lokal (Node.js & SQLite)

Jika Anda memiliki komputer server khusus, VPS (Virtual Private Server), atau ingin menjalankan backend lokal yang independen menggunakan database **SQLite**, Anda dapat memanfaatkan file `server.js` yang sudah disiapkan.

### 🛠️ Persiapan & Cara Menjalankan:
1. Pastikan **Node.js** sudah terinstal di komputer Anda (unduh di [nodejs.org](https://nodejs.org)).
2. Buka **Command Prompt (CMD)** atau **PowerShell** / Terminal, lalu arahkan ke folder proyek:
   ```bash
   cd "g:\My Drive\Projek\GMAHK Teratai"
   ```
3. Install dependensi library yang dibutuhkan (`express`, `cors`, `sqlite3`) dengan menjalankan perintah:
   ```bash
   npm install
   ```
4. Setelah instalasi selesai, jalankan server API dengan perintah:
   ```bash
   npm start
   ```
   *(Atau bisa juga menggunakan perintah `node server.js`)*
5. Server akan berjalan pada port **3000** dengan pesan di terminal:
   `Connected to the SQLite database.`
   `Server is running on http://localhost:3000`
6. Database SQLite secara otomatis akan dibuat di dalam folder dengan nama file `database.sqlite` beserta data awal template nama pemberi.
7. **Integrasi Frontend:** Anda dapat mengarahkan aplikasi atau melakukan request API dari frontend ke endpoint berikut:
   - `GET http://localhost:3000/api/data` : Mengambil semua data transaksi dan nama pemberi.
   - `POST http://localhost:3000/api/transactions` : Menyimpan transaksi baru.
   - `POST http://localhost:3000/api/donors` : Menyimpan master nama pemberi.
   - `DELETE http://localhost:3000/api/data` : Mereset/menghapus seluruh data di database.

---

## 4. 💡 Tips Backup & Keamanan Data

1. **Rutin Export Laporan Bulanan:**
   Biasakan setiap akhir bulan setelah tutup buku, lakukan export laporan bulanan lengkap baik dalam format **PDF** (untuk arsip cetak/laporan ke majelis jemaat) maupun format **Excel (.xlsx)** (untuk cadangan data mentah).
2. **Backup Spreadsheet (Jika menggunakan Opsi 2):**
   Karena Google Sheets menyimpan seluruh riwayat, data sangat aman dari kehilangan. Anda bisa secara berkala mengunduh salinan spreadsheet tersebut melalui menu **File > Download > Microsoft Excel (.xlsx)** di Google Sheets.
3. **Pencadangan File Database SQLite (Jika menggunakan Opsi 3):**
   Jika menggunakan server lokal Node.js, cukup salin (copy) file `database.sqlite` secara berkala ke flashdisk atau Google Drive sebagai arsip cadangan.

---

## 5. ❓ Troubleshooting (Solusi Masalah Umum)

| Masalah | Penyebab Umum | Solusi |
| :--- | :--- | :--- |
| **Data hilang saat browser ditutup / direfresh (Mode Offline)** | Cache atau Local Storage browser tidak sengaja terhapus, atau membuka aplikasi dalam mode *Incognito/Private Window*. | Gunakan mode browser biasa (bukan Incognito). Sangat disarankan mengaktifkan **Opsi 2 (Google Apps Script)** agar data tersimpan permanen di cloud. |
| **Muncul pesan error CORS atau data tidak masuk ke Google Sheets** | Setting izin akses (Who has access) pada saat deployment di Google Apps Script belum diset ke **"Anyone" (Siapa saja)**. | Buka kembali Google Apps Script, klik **Terapkan (Deploy) > Kelola deployment (Manage deployments)**, edit deployment, dan pastikan **Siapa saja (Anyone)** terpilih, lalu simpan. |
| **Nomor kwitansi loncat / tidak reset saat ganti bulan** | Tanggal transaksi pada form belum disesuaikan dengan bulan yang diinginkan. | Pastikan memilih tanggal transaksi terlebih dahulu di kolom input tanggal. Sistem akan otomatis menghitung nomor urut TRT berdasarkan bulan dan tahun yang dipilih. |
| **Error `Address already in use :::3000` saat menjalankan Node.js** | Port 3000 sedang digunakan oleh aplikasi lain di komputer Anda. | Tutup aplikasi lain yang menggunakan port 3000, atau ubah nomor port pada file `server.js` di baris `const PORT = process.env.PORT || 3000;` menjadi `3030` atau `8000`. |

---

## 6. 📱 Cara Menginstal Aplikasi ke Hand Phone & Tablet (Progressive Web App)

Aplikasi **GMAHK Teratai** kini dilengkapi dengan teknologi **Progressive Web App (PWA)** sehingga dapat diinstal secara langsung ke **Hand Phone (Android & iPhone)** serta **Tablet (Android Tablet & iPad)** layaknya aplikasi natif:

### Keunggulan Instalasi di HP & Tablet:
- **Tampilan Layar Penuh (Fullscreen):** Berjalan tanpa bilah alamat browser sehingga layar lebih luas & rapi.
- **Akses 1x Klik dari Homescreen:** Ikon aplikasi langsung muncul di layar utama perangkat Anda.
- **Mendukung Mode Offline (Service Worker):** Aset aplikasi otomatis tersimpan di cache sehingga dapat dibuka dengan sangat cepat meskipun koneksi internet sedang lemah.

### A. Panduan Instal di HP & Tablet Android (Google Chrome / Edge)
1. Buka aplikasi **GMAHK Teratai** di browser Google Chrome atau Microsoft Edge pada HP/Tablet Android Anda.
2. Klik tombol emas **"Instal Aplikasi"** di bagian atas layar atau banner yang muncul di bawah.
3. Jika muncul prompt otomatis, klik **"Instal Sekarang"**.
4. Alternatif manual: Ketuk ikon **Menu Tiga Titik (⋮)** di pojok kanan atas browser -> pilih **"Tambahkan ke Layar Utama" (Add to Home Screen / Install App)**.

### B. Panduan Instal di iPhone & iPad (Apple iOS Safari)
1. Buka aplikasi **GMAHK Teratai** menggunakan browser **Safari** bawaan Apple.
2. Ketuk ikon **Bagikan (Share ⎋)** di tengah bawah layar (iPhone) atau atas kanan (iPad).
3. Gulir ke bawah dan ketuk opsi **"Tambahkan ke Layar Utama" (Add to Home Screen)**.
4. Ketuk tombol **"Tambah" (Add)** di pojok kanan atas. Ikon **GMAHK TERATAI** akan langsung muncul di halaman utama iPhone/iPad Anda!

---
*Dibuat untuk pelayanan Sistem Keuangan GMAHK Jemaat Teratai - Batam.*
