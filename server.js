import express from 'express';
import { query } from './db.js';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5000;

// গেমটি লাইভ হয়েছে কিনা তা চেক করার মূল রুট
app.get('/', (req, res) => {
  res.send('👑 চতুরঙ্গ (Chaturanga) গেম সার্ভার সফলভাবে লাইভ হয়েছে!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
