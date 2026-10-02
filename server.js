const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');
const http = require('http'); // HTTP মডিউল যোগ করা হলো
const { Server } = require("socket.io"); // Socket.IO যোগ করা হলো

const app = express();
const server = http.createServer(app); // Socket.IO এর জন্য সার্ভার তৈরি
const io = new Server(server, {
  cors: {
    origin: "https://chaturanga.quarry.dpdns.org", // আপনার লাইভ ওয়েবসাইটের লিংক
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Database connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: process.env.NODE_ENV === 'production' ? true : false }
});

// Sync database tables
pool.query(`CREATE TABLE IF NOT EXISTS strategy_traps (id SERIAL PRIMARY KEY, move TEXT NOT NULL);`)
    .then(() => console.log("Database tables synchronized successfully"))
    .catch(err => console.error("Database sync error:", err));

// APIs
app.post('/api/save-strategy', async (req, res) => {
    try {
        const { move } = req.body;
        if (!move || typeof move !== 'string' || move.length > 500) return res.status(400).json({ success: false, message: "Invalid move provided" });
        await pool.query('INSERT INTO strategy_traps (move) VALUES ($1)', [move]);
        res.json({ success: true });
    } catch (err) {
        console.error("Database error in /api/save-strategy:", err);
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

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Socket.IO লজিক
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // যখন কোনো প্লেয়ার মুভ করবে
    socket.on('playerMove', (moveData) => {
        // মুভমেন্টের ডাটা অন্য প্লেয়ারদের কাছে পাঠিয়ে দেওয়া হবে
        socket.broadcast.emit('updateBoard', moveData); 
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});


const PORT = process.env.PORT || 3000;
// app.listen এর পরিবর্তে server.listen ব্যবহার করা হলো
server.listen(PORT, () => {
    console.log(`Server with Socket.IO is running on port ${PORT}`);
});

module.exports = app;
