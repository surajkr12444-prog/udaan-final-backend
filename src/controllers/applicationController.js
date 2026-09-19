import Application from '../models/Application.js';
import Scheme from '../models/Scheme.js';

export async function listApplications(req, res) {
  const applications = await Application.find({ user: req.user._id })
    .populate('scheme', 'frontendId name shortName slug ministry provider description benefits officialUrl applyUrl amountLabel')
    .sort({ updatedAt: -1 });
  res.json({ success: true, applications });
}

export async function saveApplication(req, res) {
  const { schemeId, frontendId, status = 'saved', notes = '' } = req.body;
  let scheme = null;

  if (schemeId) scheme = await Scheme.findById(schemeId);
  if (!scheme && frontendId) scheme = await Scheme.findOne({ frontendId });
  if (!scheme) return res.status(404).json({ success: false, message: 'Scheme not found' });

  const application = await Application.findOneAndUpdate(
    { user: req.user._id, scheme: scheme._id },
    { $set: { status, notes } },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
  ).populate('scheme', 'frontendId name shortName slug ministry provider amountLabel applyUrl');

  res.json({ success: true, application });
}

export async function updateApplication(req, res) {
  const application = await Application.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { $set: req.body },
    { new: true, runValidators: true }
  ).populate('scheme', 'frontendId name shortName slug ministry provider amountLabel applyUrl');

  if (!application) return res.status(404).json({ success: false, message: 'Application not found' });
  res.json({ success: true, application });
}
