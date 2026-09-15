import Profile from '../models/Profile.js';

const PROFILE_FIELDS = [
  'fullName', 'age', 'gender', 'state', 'district', 'category', 'annualIncome',
  'businessType', 'businessStage', 'fundingRequired', 'occupation',
  'startupRecognized', 'rural', 'disability', 'minority', 'education', 'answers'
];

function pickProfile(body) {
  const data = {};
  for (const key of PROFILE_FIELDS) {
    if (body[key] !== undefined) data[key] = body[key];
  }
  return data;
}

export async function getProfile(req, res) {
  const profile = await Profile.findOne({ user: req.user._id });
  res.json({ success: true, profile });
}

export async function upsertProfile(req, res) {
  const data = pickProfile(req.body);
  const profile = await Profile.findOneAndUpdate(
    { user: req.user._id },
    { $set: data, $setOnInsert: { user: req.user._id } },
    { new: true, upsert: true, runValidators: true }
  );
  res.status(200).json({ success: true, profile });
}
