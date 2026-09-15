import Scheme from '../models/Scheme.js';
import Scholarship from '../models/Scholarship.js';
import { ENTREPRENEUR_SCHEMES } from '../data/entrepreneurSchemes.js';
import { SCHOLARSHIPS } from '../data/scholarships.js';

export async function ensureSeedData() {
  for (const s of ENTREPRENEUR_SCHEMES) {
    const doc = {
      name: s.name,
      slug: s.id,
      frontendId: s.id,
      ministry: s.provider || '',
      provider: s.provider || '',
      shortName: s.shortName || s.name,
      tagline: s.tagline || '',
      description: s.description,
      categories: s.categories || [],
      stages: s.stages || [],
      sectors: s.sectors || [],
      locations: s.locations || [],
      loanMin: s.loanMin || 0,
      loanMax: s.loanMax || 0,
      amountLabel: s.amountLabel || '',
      interest: s.interest || '',
      benefits: s.benefits || [],
      documents: s.documents || [],
      applyUrl: s.applyUrl || '',
      officialUrl: s.applyUrl || '',
      colorTag: s.colorTag || '#0F5257',
      tags: [...new Set([...(s.categories || []), ...(s.sectors || []), ...(s.stages || [])])],
      active: true,
      rules: [],
      ruleGroups: []
    };
    await Scheme.findOneAndUpdate({ slug: s.id }, { $set: doc }, { upsert: true, new: true, setDefaultsOnInsert: true });
  }

  for (const s of SCHOLARSHIPS) {
    await Scholarship.findOneAndUpdate(
      { frontendId: s.id },
      { $set: { ...s, frontendId: s.id, active: true } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  console.log(`Seed data ready: ${ENTREPRENEUR_SCHEMES.length} schemes, ${SCHOLARSHIPS.length} scholarships.`);
}
