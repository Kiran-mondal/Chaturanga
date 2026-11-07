const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');
const http = require('http'); 
const { Server } = require("socket.io"); 

const app = express();
const server = http.createServer(app); 

const corsOptions = {
  origin: "https://chaturanga.quarry.dpdns.org", // আপনার Vercel ফ্রন্টএন্ড লিংক
  methods: ["GET", "POST"]
};

const io = new Server(server, {
  cors: corsOptions
});

// 🛡️ Sentinel: Enforce strict CORS policy for all Express routes to prevent unauthorized cross-origin requests
app.use(cors(corsOptions));
app.use(express.json());

// Database connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: true }
});

pool.query(`CREATE TABLE IF NOT EXISTS strategy_traps (id SERIAL PRIMARY KEY, move TEXT NOT NULL);`)
    .then(() => console.log("Database tables synchronized successfully"))
    .catch(err => console.error("Database sync error:", err));

app.post('/api/save-strategy', async (req, res) => {
    try {
        const { move } = req.body;
        if (!move || typeof move !== 'string' || move.length > 500) return res.status(400).json({ success: false, message: "Invalid move provided" });
        await pool.query('INSERT INTO strategy_traps (move) VALUES ($1)', [move]);
        res.json({ success: true });
    } catch (err) {
        console.error("Database error in /api/save-strategy:", err.message); // Prevent leaking full database error/stack trace in logs
        res.status(500).json({ success: false, error: "Internal server error" });
    }
});

app.get('/api/get-strategies', async (req, res) => {
    try {
        const result = await pool.query('SELECT move FROM strategy_traps ORDER BY id DESC LIMIT 50');
        res.json({ traps: result.rows.map(r => r.move) });
    } catch (err) {
        res.json({ traps: [] });
    }
});

// Socket.IO Logic
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('playerMove', (moveData) => {
        // 🛡️ Sentinel: Validate Socket.IO payload to prevent broadcasting malformed or malicious data
        if (moveData && typeof moveData.from === 'string' && typeof moveData.to === 'string' && typeof moveData.nextTurn === 'boolean' && moveData.from.length <= 10 && moveData.to.length <= 10) {
            socket.broadcast.emit('updateBoard', {
                from: moveData.from,
                to: moveData.to,
                nextTurn: moveData.nextTurn
            });
        } else {
            console.warn(`Invalid playerMove payload from ${socket.id}`);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server with Socket.IO is running on port ${PORT}`);
});
  
