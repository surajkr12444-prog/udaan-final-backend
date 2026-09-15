import mongoose from 'mongoose';

const scholarshipSchema = new mongoose.Schema(
  {
    frontendId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    shortName: { type: String, default: '' },
    ministry: { type: String, default: '' },
    tagline: { type: String, default: '' },
    description: { type: String, required: true },
    educationLevels: { type: [String], default: [] },
    categories: { type: [String], default: [] },
    gender: { type: String, default: 'any' },
    maxAnnualIncome: { type: Number, default: 99 },
    minPercentage: { type: Number, default: 0 },
    amountLabel: { type: String, default: '' },
    benefits: { type: [String], default: [] },
    documents: { type: [String], default: [] },
    applyUrl: { type: String, default: '' },
    portalName: { type: String, default: '' },
    colorTag: { type: String, default: '' },
    deadlineNotice: { type: String, default: '' },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model('Scholarship', scholarshipSchema);
