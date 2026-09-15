import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    fullName: { type: String, trim: true },
    age: Number,
    gender: String,
    state: String,
    district: String,
    category: String,
    annualIncome: Number,
    businessType: String,
    businessStage: String,
    fundingRequired: Number,
    occupation: String,
    startupRecognized: Boolean,
    rural: Boolean,
    disability: Boolean,
    minority: Boolean,
    education: String,
    answers: { type: mongoose.Schema.Types.Mixed, default: {} }
  },
  { timestamps: true, minimize: false }
);

export default mongoose.model('Profile', profileSchema);
