import Scholarship from '../models/Scholarship.js';
import { rankScholarships } from '../services/scholarshipMatchingService.js';

export async function listScholarships(req, res) {
  const scholarships = await Scholarship.find({ active: true }).sort({ name: 1 });
  res.json({ success: true, count: scholarships.length, scholarships });
}

export async function getScholarship(req, res) {
  const scholarship = await Scholarship.findOne({ frontendId: req.params.id, active: true });
  if (!scholarship) return res.status(404).json({ success: false, message: 'Scholarship not found' });
  res.json({ success: true, scholarship });
}

export async function matchScholarships(req, res) {
  const profile = req.body.profile || req.body;
  if (!profile || typeof profile !== 'object' || Array.isArray(profile)) {
    return res.status(400).json({ success: false, message: 'Student profile data is required' });
  }
  const required = ['educationLevel', 'category', 'gender', 'familyIncome', 'marksPercentage'];
  const missing = required.filter((key) => profile[key] === undefined || profile[key] === null || profile[key] === '');
  if (missing.length) {
    return res.status(400).json({ success: false, message: `Missing fields: ${missing.join(', ')}` });
  }
  const scholarships = await Scholarship.find({ active: true });
  const matches = rankScholarships(profile, scholarships);
  res.json({
    success: true,
    count: matches.length,
    eligibleCount: matches.filter((m) => m.eligible).length,
    matches
  });
}
