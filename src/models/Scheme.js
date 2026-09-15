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
    // Shared / API fields
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    ministry: { type: String, default: '' },
    description: { type: String, required: true },
    benefits: { type: [String], default: [] },
    tags: { type: [String], default: [] },
    officialUrl: { type: String, default: '' },
    active: { type: Boolean, default: true },

    // Frontend-compatible entrepreneur scheme fields
    frontendId: { type: String, index: true },
    shortName: { type: String, default: '' },
    provider: { type: String, default: '' },
    tagline: { type: String, default: '' },
    categories: { type: [String], default: [] },
    stages: { type: [String], default: [] },
    sectors: { type: [String], default: [] },
    locations: { type: [String], default: [] },
    loanMin: { type: Number, default: 0 },
    loanMax: { type: Number, default: 0 },
    amountLabel: { type: String, default: '' },
    interest: { type: String, default: '' },
    documents: { type: [String], default: [] },
    applyUrl: { type: String, default: '' },
    colorTag: { type: String, default: '' },

    // Generic rule engine retained for future admin-configured schemes
    rules: { type: [ruleSchema], default: [] },
    ruleGroups: { type: [groupSchema], default: [] },
    sourceNote: { type: String, default: 'Eligibility data should be verified against the official scheme source before production use.' }
  },
  { timestamps: true }
);

export default mongoose.model('Scheme', schemeSchema);
