import express from 'express';
import path from 'path';
import cors from 'cors';
import pkg from 'pg';
import { fileURLToPath } from 'url';

// ⚠️ লোকাল ফাইলের নামের শেষে অবশ্যই .js এক্সটেনশন থাকতে হবে ES Module-এ
import './routes.js'; 
import './rules.js';

const { Pool } = pkg;
const app = express();
const PORT = process.env.PORT || 5000;

// 📁 ES Module-এ __dirname তৈরি করার আধুনিক নিয়ম
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🔐 Middleware Configuration
app.use(cors());
app.use(express.json());

// 📁 Serve Static Files (গুগল ভেরিফিকেশন এবং অন্যান্য ফাইলের জন্য)
app.use(express.static(__dirname));

// 🏛️ PostgreSQL Database Connection Setup
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/chaturanga_db",
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

// 🔍 Database Initialization Query
const initDb = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS strategy_logs (
                id SERIAL PRIMARY KEY,
                winning_move TEXT NOT NULL,
                recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("Database Matrix: Strategy tables synchronized successfully.");
    } catch (err) {
        console.error("Database Matrix Error:", err.message);
    }
};
initDb();

// 🌐 ------------------ API ROUTES ------------------ 🌐

// 📥 Save Dynamic Strategic Traps
app.post('/api/save-strategy', async (req, res) => {
    const { move } = req.body;
    if (!move) return res.status(400).json({ error: "Invalid move structure provided." });

    try {
        await pool.query('INSERT INTO strategy_logs (winning_move) VALUES ($1)', [move]);
        res.status(200).json({ success: true, message: "Strategy recorded in global memory." });
    } catch (err) {
        res.status(500).json({ error: "Internal Database Exception", details: err.message });
    }
});

// 📤 Fetch Prior Tactical Combat Patterns
app.get('/api/get-strategies', async (req, res) => {
    try {
        const result = await pool.query('SELECT winning_move FROM strategy_logs ORDER BY recorded_at DESC LIMIT 50');
        const traps = result.rows.map(row => row.winning_move);
        res.status(200).json({ traps });
    } catch (err) {
        res.status(500).json({ error: "Internal Database Exception", details: err.message });
    }
});

// 🚀 Special Route for Google Search Console Verification
app.get('/google711bc6cd9e996d83.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'google711bc6cd9e996d83.html'));
});

// 🎮 Serve Main Frontend Application (Fallback Rule)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ⚡ Activate Server Instance
app.listen(PORT, () => {
    console.log(`Chaturanga Engine Active on Core Port: ${PORT}`);
});
