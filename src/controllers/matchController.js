import Scheme from '../models/Scheme.js';
import MatchHistory from '../models/MatchHistory.js';
import Profile from '../models/Profile.js';
import { rankSchemes } from '../services/matchingService.js';

const PROFILE_FIELDS = [
  'fullName', 'age', 'gender', 'state', 'district', 'category', 'annualIncome',
  'businessType', 'businessStage', 'fundingRequired', 'occupation',
  'startupRecognized', 'rural', 'disability', 'minority', 'education'
];

function profileForStorage(profile) {
  const data = { answers: profile };
  for (const key of PROFILE_FIELDS) {
    if (profile[key] !== undefined) data[key] = profile[key];
  }
  return data;
}

export async function matchSchemes(req, res) {
  const profile = req.body.profile || req.body;
  if (!profile || typeof profile !== 'object' || Array.isArray(profile)) {
    return res.status(400).json({ success: false, message: 'Profile data is required' });
  }

  const schemes = await Scheme.find({ active: true });
  const matches = rankSchemes(profile, schemes);

  if (req.user && req.body.saveProfile === true) {
    await Profile.findOneAndUpdate(
      { user: req.user._id },
      { $set: profileForStorage(profile), $setOnInsert: { user: req.user._id } },
      { upsert: true, new: true, runValidators: true }
    );
  }

  let historyId = null;
  if (req.user) {
    const history = await MatchHistory.create({
      user: req.user._id,
      profileSnapshot: profile,
      results: matches
    });
    historyId = history._id;
  }

  res.json({
    success: true,
    count: matches.length,
    eligibleCount: matches.filter((m) => m.eligible).length,
    historyId,
    matches
  });
}

export async function getMatchHistory(req, res) {
  const history = await MatchHistory.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(20);
  res.json({ success: true, history });
}
