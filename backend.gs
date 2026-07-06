/**
 * ==========================================
 * SISTEM MANAJEMEN KEUANGAN GEREJA DIGITAL
 * ==========================================
 * BACKEND GOOGLE APPS SCRIPT
 * 
 * Cara Penggunaan:
 * 1. Buka Google Spreadsheet baru.
 * 2. Ganti nama Sheet1 menjadi "Transactions".
 * 3. Tambahkan Sheet baru dan beri nama "Donors".
 * 4. Klik menu: Ekstensi > Apps Script.
 * 5. Hapus kode yang ada, lalu paste seluruh kode ini.
 * 6. Klik Simpan (ikon disket).
 * 7. Klik menu: Terapkan (Deploy) > Deployment baru (New deployment).
 * 8. Pilih jenis: Aplikasi Web (Web App).
 * 9. Set "Jalankan sebagai" (Execute as): Saya (Me).
 * 10. Set "Siapa yang memiliki akses" (Who has access): Siapa saja (Anyone).
 * 11. Klik Terapkan (Deploy), berikan otorisasi jika diminta.
 * 12. Salin URL Web App yang dihasilkan dan tempelkan di Pengaturan Aplikasi Web Anda.
 */

const SPREADSHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();
const SHEET_TRANSACTIONS = 'Transactions';
const SHEET_DONORS = 'Donors';

/**
 * Handle HTTP GET Request
 * Mengambil data dari Spreadsheet dan mengirimkannya ke frontend
 */
function doGet(e) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    
    // Ambil Transaksi
    let sheetTrx = ss.getSheetByName(SHEET_TRANSACTIONS);
    if (!sheetTrx) sheetTrx = ss.insertSheet(SHEET_TRANSACTIONS);
    
    const trxData = sheetTrx.getDataRange().getValues();
    const transactions = [];
    
    if (trxData.length > 1) {
      const headers = trxData[0];
      for (let i = 1; i < trxData.length; i++) {
        const row = trxData[i];
        if (!row[0]) continue;
        
        let trx = {};
        headers.forEach((header, index) => {
          trx[header] = row[index];
        });
        
        // Parse kembali array/object JSON stringified
        if (trx.categories && typeof trx.categories === 'string') {
          try { trx.categories = JSON.parse(trx.categories); } catch(e) {}
        }
        
        transactions.push(trx);
      }
    }
    
    // Ambil Donors (Daftar Nama)
    let sheetDonors = ss.getSheetByName(SHEET_DONORS);
    if (!sheetDonors) sheetDonors = ss.insertSheet(SHEET_DONORS);
    
    const donorsData = sheetDonors.getDataRange().getValues();
    const donors = [];
    
    for (let i = 0; i < donorsData.length; i++) {
      if (donorsData[i][0]) {
        donors.push(donorsData[i][0]);
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
 * Handle HTTP POST Request
 * Menerima data dari frontend dan menyimpannya ke Spreadsheet
 */
function doPost(e) {
  try {
    // Apps script membutuhkan text/plain agar tidak terkena CORS preflight, jadi kita parse contents manual
    const postData = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    
    // Proses Transaksi
    if (postData.transactions && Array.isArray(postData.transactions)) {
      let sheetTrx = ss.getSheetByName(SHEET_TRANSACTIONS);
      if (!sheetTrx) sheetTrx = ss.insertSheet(SHEET_TRANSACTIONS);
      
      // Bersihkan sheet lalu tulis ulang (mode sinkronisasi total)
      sheetTrx.clear();
      
      if (postData.transactions.length > 0) {
        // Ambil headers dari properti object transaksi pertama
        const headers = Object.keys(postData.transactions[0]);
        sheetTrx.appendRow(headers);
        
        const rows = postData.transactions.map(trx => {
          return headers.map(header => {
            let val = trx[header];
            // Jika array/object, ubah ke string agar bisa disimpan di sel
            if (typeof val === 'object' && val !== null) {
              return JSON.stringify(val);
            }
            return val;
          });
        });
        
        if (rows.length > 0) {
          // Menulis batch lebih cepat daripada appendRow satu-satu
          sheetTrx.getRange(2, 1, rows.length, headers.length).setValues(rows);
        }
      }
    }
    
    // Proses Donors
    if (postData.donors && Array.isArray(postData.donors)) {
      let sheetDonors = ss.getSheetByName(SHEET_DONORS);
      if (!sheetDonors) sheetDonors = ss.insertSheet(SHEET_DONORS);
      
      sheetDonors.clear();
      
      if (postData.donors.length > 0) {
        const donorRows = postData.donors.map(name => [name]);
        sheetDonors.getRange(1, 1, donorRows.length, 1).setValues(donorRows);
      }
    }
    
    return createJsonResponse({
      status: 'success',
      message: 'Data successfully synchronized.'
    });
    
  } catch (error) {
    return createJsonResponse({
      status: 'error',
      message: error.toString()
    });
  }
}

/**
 * Helper function for returning JSON
 */
function createJsonResponse(responseObject) {
  return ContentService.createTextOutput(JSON.stringify(responseObject))
    .setMimeType(ContentService.MimeType.JSON);
}
