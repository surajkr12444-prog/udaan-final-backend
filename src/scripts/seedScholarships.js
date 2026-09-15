import 'dotenv/config';
import { connectDB } from '../config/db.js';
import Scholarship from '../models/Scholarship.js';
import { SCHOLARSHIPS } from '../data/scholarships.js';

try {
  await connectDB();
  for (const s of SCHOLARSHIPS) {
    await Scholarship.findOneAndUpdate(
      { frontendId: s.id },
      { $set: { ...s, frontendId: s.id, active: true } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }
  console.log(`Seeded ${SCHOLARSHIPS.length} scholarships.`);
  process.exit(0);
} catch (err) {
  console.error(err);
  process.exit(1);
}
