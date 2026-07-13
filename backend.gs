/**
 * ==========================================
 * SISTEM MANAJEMEN KEUANGAN GEREJA DIGITAL
 * ==========================================
 * BACKEND GOOGLE APPS SCRIPT (v2.0 - Multi-Sheet: Pemasukan & Pengeluaran Terpisah)
 * 
 * Cara Penggunaan:
 * 1. Buka Google Spreadsheet baru (atau yang sudah ada).
 * 2. Klik menu: Ekstensi > Apps Script.
 * 3. Hapus kode yang lama, lalu paste seluruh kode ini.
 * 4. Klik Simpan (ikon disket).
 * 5. Klik menu: Terapkan (Deploy) > Kelola deployment (Manage deployments) > Edit (ikon pensil) > Versi baru (New version) > Terapkan.
 *    (Atau jika baru pertama kali: Terapkan > Deployment baru > Aplikasi Web > Akses: Siapa saja / Anyone).
 * 6. Aplikasi secara otomatis akan membuat dan menata 3 Sheet terpisah:
 *    - "Pemasukan" (Semua data transaksi masuk / type = 'in')
 *    - "Pengeluaran" (Semua data transaksi keluar / type = 'out')
 *    - "Donors" (Daftar master nama pemberi)
 */

const SPREADSHEET_ID = SpreadsheetApp.getActiveSpreadsheet() ? SpreadsheetApp.getActiveSpreadsheet().getId() : '';
const SHEET_PEMASUKAN = 'Pemasukan';
const SHEET_PENGELUARAN = 'Pengeluaran';
const SHEET_DONORS = 'Donors';
const SHEET_LEGACY = 'Transactions'; // Dukungan kompatibilitas sheet lama

const STANDARD_HEADERS = [
  'id', 'receipt_no', 'type', 'date', 'name', 'category',
  'amount', 'alloc_dskt', 'alloc_kas', 'alloc_pembangunan', 'timestamp'
];

/**
 * FUNGSI SETUP & UJI COBA (Jalankan fungsi ini di Google Apps Script Editor untuk menguji koneksi & membuat Sheet awal)
 */
function setupSpreadsheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    Logger.log("❌ Error: Spreadsheet tidak aktif/ditemukan.");
    return;
  }
  const sheets = [SHEET_PEMASUKAN, SHEET_PENGELUARAN, SHEET_DONORS];
  sheets.forEach(name => {
    let sheet = ss.getSheetByName(name);
    if (!sheet) {
      sheet = ss.insertSheet(name);
      Logger.log("✅ Berhasil membuat Sheet baru: " + name);
    } else {
      Logger.log("ℹ️ Sheet sudah ada: " + name);
    }
  });
  Logger.log("🚀 Setup Spreadsheet Selesai! SPREADSHEET_ID: " + ss.getId());
}

/**
 * Handle HTTP GET Request
 * Mengambil data dari Sheet Pemasukan & Pengeluaran (serta Sheet lama jika ada) dan mengirimkannya ke frontend
 */
function doGet(e) {
  try {
    const ss = SPREADSHEET_ID ? SpreadsheetApp.openById(SPREADSHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
    const transactionsMap = new Map();

    // 1. Baca Sheet Pemasukan
    readSheetTransactions(ss, SHEET_PEMASUKAN, transactionsMap);

    // 2. Baca Sheet Pengeluaran
    readSheetTransactions(ss, SHEET_PENGELUARAN, transactionsMap);

    // 3. Fallback kompatibilitas: Baca Sheet 'Transactions' lama jika ada data yang belum bermigrasi
    readSheetTransactions(ss, SHEET_LEGACY, transactionsMap);

    // Ubah ke array dan urutkan secara kronologis berdasarkan tanggal & timestamp
    const transactions = Array.from(transactionsMap.values()).sort((a, b) => {
      const dateA = a.date || '';
      const dateB = b.date || '';
      if (dateA !== dateB) return dateA.localeCompare(dateB);
      return (Number(a.timestamp) || 0) - (Number(b.timestamp) || 0);
    });

    // 4. Baca Donors (Daftar Nama Pemberi)
    let sheetDonors = ss.getSheetByName(SHEET_DONORS);
    if (!sheetDonors) sheetDonors = ss.insertSheet(SHEET_DONORS);

    const donorsData = sheetDonors.getDataRange().getValues();
    const donors = [];
    for (let i = 0; i < donorsData.length; i++) {
      const cellVal = donorsData[i][0];
      if (cellVal && i > 0 || (i === 0 && cellVal !== 'Nama Pemberi')) {
        donors.push(String(cellVal).trim());
      }
    }

    return createJsonResponse({
      status: 'success',
      data: {
        transactions: transactions,
        donors: donors
      }
    });

  } catch (error) {
    return createJsonResponse({
      status: 'error',
      message: error.toString()
    });
  }
}

/**
 * Fungsi helper untuk membaca transaksi dari suatu Sheet
 */
function readSheetTransactions(ss, sheetName, mapObj) {
  if (!ss) {
    ss = SpreadsheetApp.getActiveSpreadsheet();
  }
  if (!ss || !sheetName || !mapObj) return;

  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return;

  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return;

  const headers = data[0];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[0]) continue; // Lewati baris kosong

    let trx = {};
    headers.forEach((header, index) => {
      let val = row[index];
      if (header === 'amount' || header === 'alloc_dskt' || header === 'alloc_kas' || header === 'alloc_pembangunan' || header === 'timestamp') {
        val = Number(val) || 0;
      }
      trx[header] = val;
    });

    // Parse kembali array/object JSON stringified jika ada
    if (trx.categories && typeof trx.categories === 'string') {
      try { trx.categories = JSON.parse(trx.categories); } catch (e) { }
    }

    if (trx.id) {
      mapObj.set(String(trx.id), trx);
    }
  }
}

/**
 * Handle HTTP POST Request
 * Menerima data dari frontend dan menyimpannya secara terpisah ke Sheet Pemasukan, Pengeluaran & Donors
 */
function doPost(e) {
  try {
    const postData = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

    // Proses Transaksi (Pisahkan Pemasukan & Pengeluaran)
    if (postData.transactions && Array.isArray(postData.transactions)) {
      const allTrx = postData.transactions;

      // Filter data berdasarkan tipe
      const pemasukanList = allTrx.filter(t => t.type === 'in');
      const pengeluaranList = allTrx.filter(t => t.type === 'out');

      // Tentukan semua kolom header yang diperlukan
      let allHeaderKeys = [...STANDARD_HEADERS];
      allTrx.forEach(t => {
        Object.keys(t).forEach(k => {
          if (!allHeaderKeys.includes(k)) allHeaderKeys.push(k);
        });
      });

      // 1. Simpan ke Sheet Pemasukan
      writeTransactionsToSheet(ss, SHEET_PEMASUKAN, pemasukanList, allHeaderKeys, '#1e3a8a', 'PEMASUKAN KAS GEREJA');

      // 2. Simpan ke Sheet Pengeluaran
      writeTransactionsToSheet(ss, SHEET_PENGELUARAN, pengeluaranList, allHeaderKeys, '#991b1b', 'PENGELUARAN KAS GEREJA');
    }

    // Proses Donors (Master Nama Pemberi)
    if (postData.donors && Array.isArray(postData.donors)) {
      let sheetDonors = ss.getSheetByName(SHEET_DONORS);
      if (!sheetDonors) {
        sheetDonors = ss.insertSheet(SHEET_DONORS);
      }

      sheetDonors.clearContents();

      const donorRows = [['Nama Pemberi'], ...postData.donors.map(name => [name])];
      sheetDonors.getRange(1, 1, donorRows.length, 1).setValues(donorRows);

      // Styling Header Donors
      formatHeaderRow(sheetDonors, 1, '#0f172a');
    }

    return createJsonResponse({
      status: 'success',
      message: 'Data successfully synchronized into separate Pemasukan & Pengeluaran sheets.'
    });

  } catch (error) {
    return createJsonResponse({
      status: 'error',
      message: error.toString()
    });
  }
}

/**
 * Menulis array transaksi ke sheet tertentu dengan styling profesional
 */
function writeTransactionsToSheet(ss, sheetName, trxList, headers, headerColor, titleLabel) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }

  sheet.clearContents();

  // Siapkan data baris
  const rows = trxList.map(trx => {
    return headers.map(header => {
      let val = trx[header];
      if (val === undefined || val === null) return '';
      if (typeof val === 'object') return JSON.stringify(val);
      return val;
    });
  });

  const allData = [headers, ...rows];
  const range = sheet.getRange(1, 1, allData.length, headers.length);
  range.setValues(allData);

  // Format Header Row
  formatHeaderRow(sheet, headers.length, headerColor);
}

/**
 * Styling tampilan baris header agar rapi dan mudah dibaca di Google Sheets
 */
function formatHeaderRow(sheet, colCount, bgColor) {
  try {
    const headerRange = sheet.getRange(1, 1, 1, colCount);
    headerRange.setFontWeight('bold');
    headerRange.setBackground(bgColor);
    headerRange.setFontColor('#ffffff');
    sheet.setFrozenRows(1);
  } catch (err) {
    // Abaikan error formatting minor
  }
}

/**
 * Helper function for returning JSON response
 */
function createJsonResponse(responseObject) {
  return ContentService.createTextOutput(JSON.stringify(responseObject))
    .setMimeType(ContentService.MimeType.JSON);
}
