import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { query } from './db.js';
import matchRoutes from './routes.js';

const app = express();
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directing traffic to our game database routes
app.use('/api', matchRoutes);

const PORT = process.env.PORT || 5000;

// Serve the static frontend layout index directly on the main domain root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
