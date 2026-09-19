import ScholarshipApplication from '../models/ScholarshipApplication.js';
import Scholarship from '../models/Scholarship.js';

export async function listScholarshipApplications(req, res) {
  const applications = await ScholarshipApplication.find({ user: req.user._id })
    .populate('scholarship', 'frontendId name shortName ministry amountLabel applyUrl portalName')
    .sort({ updatedAt: -1 });
  res.json({ success: true, applications });
}

export async function saveScholarshipApplication(req, res) {
  const { scholarshipId, frontendId, status = 'saved', notes = '' } = req.body;
  let scholarship = null;

  if (scholarshipId) scholarship = await Scholarship.findById(scholarshipId);
  if (!scholarship && frontendId) scholarship = await Scholarship.findOne({ frontendId });
  if (!scholarship) return res.status(404).json({ success: false, message: 'Scholarship not found' });

  const application = await ScholarshipApplication.findOneAndUpdate(
    { user: req.user._id, scholarship: scholarship._id },
    { $set: { status, notes } },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
  ).populate('scholarship', 'frontendId name shortName ministry amountLabel applyUrl portalName');

  res.json({ success: true, application });
}

export async function updateScholarshipApplication(req, res) {
  const application = await ScholarshipApplication.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { $set: req.body },
    { new: true, runValidators: true }
  ).populate('scholarship', 'frontendId name shortName ministry amountLabel applyUrl portalName');

  if (!application) return res.status(404).json({ success: false, message: 'Saved scholarship not found' });
  res.json({ success: true, application });
}
