import 'dotenv/config';
import { connectDB } from '../config/db.js';
import Scheme from '../models/Scheme.js';

const artisanTrades = [
  'carpenter', 'boat maker', 'armourer', 'blacksmith', 'hammer and tool kit maker',
  'locksmith', 'goldsmith', 'potter', 'sculptor', 'stone breaker', 'cobbler',
  'mason', 'basket maker', 'mat maker', 'broom maker', 'doll maker', 'toy maker',
  'barber', 'garland maker', 'washerman', 'tailor', 'fishing net maker'
];

const schemes = [
  {
    name: 'Prime Minister Employment Generation Programme (PMEGP)',
    slug: 'pmegp',
    ministry: 'Ministry of Micro, Small and Medium Enterprises',
    description: 'Credit-linked support for setting up new micro-enterprises and generating employment.',
    benefits: ['Credit-linked financial assistance', 'Support for new micro-enterprises'],
    tags: ['entrepreneurship', 'micro-enterprise', 'credit'],
    rules: [
      { field: 'age', operator: 'gte', value: 18, weight: 20, label: 'Minimum age requirement', hard: true }
    ]
  },
  {
    name: 'Pradhan Mantri MUDRA Yojana (PMMY)',
    slug: 'mudra',
    ministry: 'Ministry of Finance',
    description: 'Loan support for eligible micro and small non-corporate enterprises.',
    benefits: ['Business loan support', 'Useful for micro and small enterprise financing'],
    tags: ['loan', 'micro-enterprise', 'small-business'],
    rules: []
  },
  {
    name: 'Stand-Up India',
    slug: 'stand-up-india',
    ministry: 'Department of Financial Services, Ministry of Finance',
    description: 'Bank loan support focused on women and SC/ST entrepreneurs for eligible greenfield enterprises.',
    benefits: ['Bank loan support', 'Entrepreneurship support for target groups'],
    tags: ['women', 'sc', 'st', 'greenfield', 'loan'],
    ruleGroups: [
      {
        logic: 'any',
        label: 'Target entrepreneur category',
        hard: true,
        weight: 30,
        rules: [
          { field: 'gender', operator: 'eq', value: 'female', label: 'Woman entrepreneur' },
          { field: 'category', operator: 'eq', value: 'SC', label: 'SC entrepreneur' },
          { field: 'category', operator: 'eq', value: 'ST', label: 'ST entrepreneur' }
        ]
      }
    ]
  },
  {
    name: 'PM Vishwakarma',
    slug: 'pm-vishwakarma',
    ministry: 'Ministry of Micro, Small and Medium Enterprises',
    description: 'Support package for eligible traditional artisans and craftspeople in notified trades.',
    benefits: ['Skill support', 'Toolkit incentive', 'Credit and marketing support'],
    tags: ['artisan', 'craft', 'skill', 'credit'],
    rules: [
      { field: 'occupation', operator: 'in', value: artisanTrades, weight: 35, label: 'Eligible traditional trade', hard: true }
    ]
  },
  {
    name: 'Startup India Seed Fund Scheme',
    slug: 'startup-india-seed-fund',
    ministry: 'Department for Promotion of Industry and Internal Trade',
    description: 'Seed funding support routed through approved incubators for eligible DPIIT-recognised startups.',
    benefits: ['Seed support through incubators', 'Prototype and market-entry support'],
    tags: ['startup', 'seed-fund', 'innovation'],
    rules: [
      { field: 'startupRecognized', operator: 'truthy', value: true, weight: 40, label: 'Startup recognition', hard: true }
    ]
  }
];

try {
  await connectDB();
  for (const scheme of schemes) {
    await Scheme.findOneAndUpdate(
      { slug: scheme.slug },
      { $set: scheme },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }
  console.log(`Seeded ${schemes.length} schemes.`);
  process.exit(0);
} catch (err) {
  console.error(err);
  process.exit(1);
}
