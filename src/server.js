import 'dotenv/config';
import app from './app.js';
import { connectDB } from './config/db.js';

const PORT = Number(process.env.PORT) || 5000;

async function start() {
  try {
    await connectDB();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Udaan.AI API running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
