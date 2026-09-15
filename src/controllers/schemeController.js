import mongoose from 'mongoose';
import Scheme from '../models/Scheme.js';

export async function listSchemes(req, res) {
  const { q, tag } = req.query;
  const filter = { active: true };

  if (q) {
    filter.$or = [
      { name: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
      { tags: { $regex: q, $options: 'i' } }
    ];
  }
  if (tag) filter.tags = { $in: [new RegExp(tag, 'i')] };

  const schemes = await Scheme.find(filter).sort({ name: 1 });
  res.json({ success: true, count: schemes.length, schemes });
}

export async function getScheme(req, res) {
  const key = req.params.id;
  const filter = mongoose.isValidObjectId(key)
    ? { _id: key, active: true }
    : { slug: key.toLowerCase(), active: true };

  const scheme = await Scheme.findOne(filter);
  if (!scheme) return res.status(404).json({ success: false, message: 'Scheme not found' });
  res.json({ success: true, scheme });
}
