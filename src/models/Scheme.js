import mongoose from 'mongoose';

const ruleSchema = new mongoose.Schema(
  {
    field: { type: String, required: true },
    operator: {
      type: String,
      required: true,
      enum: ['eq', 'neq', 'in', 'notIn', 'gte', 'lte', 'between', 'includesAny', 'truthy']
    },
    value: mongoose.Schema.Types.Mixed,
    weight: { type: Number, default: 10 },
    label: { type: String, default: '' },
    hard: { type: Boolean, default: true }
  },
  { _id: false }
);

const groupSchema = new mongoose.Schema(
  {
    logic: { type: String, enum: ['all', 'any'], default: 'all' },
    label: { type: String, default: '' },
    hard: { type: Boolean, default: true },
    weight: { type: Number, default: 10 },
    rules: { type: [ruleSchema], default: [] }
  },
  { _id: false }
);

const schemeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    ministry: { type: String, default: '' },
    description: { type: String, required: true },
    benefits: { type: [String], default: [] },
    tags: { type: [String], default: [] },
    officialUrl: { type: String, default: '' },
    active: { type: Boolean, default: true },
    rules: { type: [ruleSchema], default: [] },
    ruleGroups: { type: [groupSchema], default: [] },
    sourceNote: { type: String, default: 'Eligibility data should be verified against the official scheme source before production use.' }
  },
  { timestamps: true }
);

export default mongoose.model('Scheme', schemeSchema);
