import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    scheme: { type: mongoose.Schema.Types.ObjectId, ref: 'Scheme', required: true },
    status: {
      type: String,
      enum: ['saved', 'applied', 'under_review', 'approved', 'rejected'],
      default: 'saved'
    },
    notes: { type: String, default: '' }
  },
  { timestamps: true }
);

applicationSchema.index({ user: 1, scheme: 1 }, { unique: true });

export default mongoose.model('Application', applicationSchema);
