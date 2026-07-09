import express from 'express';
import { query } from './db.js';
import matchRoutes from './routes.js';

const app = express();
app.use(express.json());

// Directing traffic to our game database routes
app.use('/api', matchRoutes);

const PORT = process.env.PORT || 5000;

// Default web root confirmation message
app.get('/', (req, res) => {
  res.send('👑 Chaturanga Game Server is successfully live and running globally!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
