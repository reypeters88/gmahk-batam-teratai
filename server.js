const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Set up SQLite Database
const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        
        // Initialize tables
        db.serialize(() => {
            db.run(`CREATE TABLE IF NOT EXISTS transactions (
                id TEXT PRIMARY KEY,
                receipt_no TEXT,
                type TEXT,
                date TEXT,
                name TEXT,
                category TEXT,
                amount INTEGER,
                alloc_dskt INTEGER,
                alloc_kas INTEGER,
                alloc_pembangunan INTEGER,
                timestamp INTEGER
            )`);
            
            db.run(`CREATE TABLE IF NOT EXISTS donors (
                name TEXT PRIMARY KEY
            )`, (err) => {
                if (!err) {
                    // Seed initial data if empty
                    db.get(`SELECT COUNT(*) as count FROM donors`, (err, row) => {
                        if (!err && row.count === 0) {
                            const defaultDonors = [
                                'Kel. Simanjuntak', 'Kel. Tambunan', 'Kel. Siregar', 
                                'Kel. Panjaitan', 'Kel. Hutapea', 'NN (Tanpa Nama)', 
                                'Kolekte Sabat', 'Bapak Budi', 'Ibu Maria'
                            ];
                            const stmt = db.prepare(`INSERT INTO donors (name) VALUES (?)`);
                            defaultDonors.forEach(name => stmt.run(name));
                            stmt.finalize();
                            console.log('Seeded default donor names.');
                        }
                    });
                }
            });
        });
    }
});

// API Routes

// 1. Get all data (transactions & donors)
app.get('/api/data', (req, res) => {
    const data = { transactions: [], donors: [] };
    
    db.all(`SELECT * FROM transactions ORDER BY timestamp ASC`, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        data.transactions = rows;
        
        db.all(`SELECT * FROM donors ORDER BY name ASC`, [], (err, donorRows) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            data.donors = donorRows.map(row => row.name);
            res.json(data);
        });
    });
});

// 2. Save transactions
app.post('/api/transactions', (req, res) => {
    const { transactions } = req.body;
    
    if (!transactions || !Array.isArray(transactions)) {
        return res.status(400).json({ error: 'Invalid data format' });
    }
    
    const stmt = db.prepare(`INSERT OR REPLACE INTO transactions 
        (id, receipt_no, type, date, name, category, amount, alloc_dskt, alloc_kas, alloc_pembangunan, timestamp) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
        
    db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        transactions.forEach(trx => {
            stmt.run([
                trx.id, 
                trx.receipt_no, 
                trx.type, 
                trx.date, 
                trx.name, 
                trx.category, 
                trx.amount, 
                trx.alloc_dskt, 
                trx.alloc_kas, 
                trx.alloc_pembangunan, 
                trx.timestamp
            ]);
        });
        db.run('COMMIT', (err) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ message: 'Transactions saved successfully' });
        });
    });
    stmt.finalize();
});

// 3. Save donors (bulk or single)
app.post('/api/donors', (req, res) => {
    const { donors } = req.body;
    
    if (!donors || !Array.isArray(donors)) {
        return res.status(400).json({ error: 'Invalid data format' });
    }

    const stmt = db.prepare(`INSERT OR IGNORE INTO donors (name) VALUES (?)`);
    db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        donors.forEach(donor => {
            stmt.run([donor]);
        });
        db.run('COMMIT', (err) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ message: 'Donors saved successfully' });
        });
    });
    stmt.finalize();
});
// 3b. Delete single donor by name
app.delete('/api/donors/:name', (req, res) => {
    const donorName = req.params.name;
    if (!donorName) {
        return res.status(400).json({ error: 'Donor name required' });
    }
    db.run(`DELETE FROM donors WHERE name = ?`, [donorName], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Donor deleted successfully', changes: this.changes });
    });
});

// 3c. Update donor name (juga perbarui nama di tabel transaksi)
app.put('/api/donors/:oldName', (req, res) => {
    const oldName = req.params.oldName;
    const { newName } = req.body;
    if (!oldName || !newName) {
        return res.status(400).json({ error: 'oldName and newName required' });
    }
    db.run(`UPDATE donors SET name = ? WHERE name = ?`, [newName, oldName], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        db.run(`UPDATE transactions SET name = ? WHERE name = ?`, [newName, oldName], function(err2) {
            res.json({ message: 'Donor updated successfully', changes: this.changes });
        });
    });
});

// 3d. Delete single transaction by id
app.delete('/api/transactions/:id', (req, res) => {
    const trxId = req.params.id;
    if (!trxId) {
        return res.status(400).json({ error: 'Transaction id required' });
    }
    db.run(`DELETE FROM transactions WHERE id = ?`, [trxId], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Transaction deleted successfully', changes: this.changes });
    });
});

// 4. Reset Data (Delete all records)
app.delete('/api/data', (req, res) => {
    db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        db.run(`DELETE FROM transactions`);
        db.run(`DELETE FROM donors`);
        db.run('COMMIT', (err) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ message: 'All data deleted successfully' });
        });
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(\`Server is running on http://localhost:\${PORT}\`);
});
