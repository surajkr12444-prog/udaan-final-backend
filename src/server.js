import 'dotenv/config';
import app from './app.js';
import { connectDB } from './config/db.js';
import { ensureSeedData } from './services/seedService.js';

const PORT = Number(process.env.PORT) || 5000;

async function start() {
  try {
    await connectDB();
    await ensureSeedData();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Udaan.AI API running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
