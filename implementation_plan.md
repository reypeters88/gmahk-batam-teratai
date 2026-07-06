# Goal Description
Membuat backend untuk aplikasi SIAK GMAHK dan menghubungkan frontend agar menggunakan database yang persisten, alih-alih `localStorage` pada browser.

## Proposed Changes

Kita akan menggunakan **Node.js** dengan framework **Express** untuk membuat REST API yang ringan, dan **SQLite** sebagai database karena mudah dikelola dalam satu file (cocok untuk aplikasi skala kecil - menengah).

### 1. Inisialisasi Backend (Node.js & Express)
- Inisialisasi file `package.json` menggunakan npm.
- Menginstal dependensi yang dibutuhkan: `express`, `cors` (agar frontend dapat mengakses backend), dan `sqlite3` (driver database).

### 2. Pembuatan Database & API Server
#### [NEW] `server.js`
Membuat server Node.js yang akan:
- Menyiapkan koneksi ke database SQLite (`database.sqlite`).
- Membuat tabel `transactions` dan `donors` jika belum ada.
- Menyediakan Endpoint API:
  - `GET /api/data` : Mengambil semua transaksi dan master nama pemberi.
  - `POST /api/transactions` : Menyimpan daftar transaksi baru.
  - `POST /api/donors` : Menyimpan nama pemberi baru ke database master.
  - `DELETE /api/data` : Mereset seluruh data (menghapus isi database jika diinginkan).

### 3. Pembaruan Frontend
#### [MODIFY] `index.html`
Mengubah fungsi-fungsi JavaScript agar berkomunikasi dengan API backend menggunakan `fetch`:
- `loadData()` : Memanggil `GET /api/data` alih-alih membaca `localStorage`.
- Form Submit (Pemasukan & Pengeluaran) : Mengirim array data menggunakan `POST /api/transactions` dan `POST /api/donors`.
- `resetData()` : Memanggil `DELETE /api/data` dan memuat ulang UI.
- Penyesuaian notifikasi dan loading overlay agar sinkron dengan aktivitas jaringan (network request).

## User Review Required
> [!IMPORTANT]
> **Prasyarat Sistem**: Backend ini membutuhkan instalasi Node.js pada komputer Anda (atau server tempat aplikasi ini dijalankan). Jika Anda belum menginstal Node.js, Anda perlu menginstalnya terlebih dahulu (bisa diunduh di nodejs.org).

## Open Questions
- Apakah Anda setuju dengan penggunaan **Node.js** dan **SQLite**? Kombinasi ini sangat ringan dan ideal jika aplikasi akan dijalankan secara lokal di PC bendahara gereja, maupun jika di-host di cloud/VPS nantinya.
- Saat ini `index.html` berjalan tanpa server (langsung double-click). Dengan adanya backend, kita akan menjalankan aplikasinya di atas server lokal (misalnya di `http://localhost:3000`). Apakah skenario ini dapat diterima?

## Verification Plan
1. Menjalankan perintah `npm start` (atau `node server.js`).
2. Mengakses `http://localhost:3000` di browser.
3. Menambahkan transaksi percobaan (masuk dan keluar) lalu merefresh halaman untuk memastikan data disimpan secara persisten di database `SQLite` alih-alih `localStorage`.
4. Menguji tombol "Reset" untuk memastikan reset database berfungsi dengan baik.
