import mongoose from 'mongoose';

const scholarshipApplicationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    scholarship: { type: mongoose.Schema.Types.ObjectId, ref: 'Scholarship', required: true },
    status: {
      type: String,
      enum: ['saved', 'applied', 'under_review', 'approved', 'rejected'],
      default: 'saved'
    },
    notes: { type: String, default: '' }
  },
  { timestamps: true }
);

scholarshipApplicationSchema.index({ user: 1, scholarship: 1 }, { unique: true });

export default mongoose.model('ScholarshipApplication', scholarshipApplicationSchema);
