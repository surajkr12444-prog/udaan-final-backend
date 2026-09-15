function normalizeString(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : value;
}

function entrepreneurCategoryScore(user, scheme) {
  const meaningfulUser = (user || []).filter((c) => c !== 'general');
  const schemeOpen = (scheme.categories || []).includes('general');
  const matched = meaningfulUser.filter((c) => (scheme.categories || []).includes(c));

  if (matched.length > 0) {
    if (!schemeOpen) return { score: 1, reason: 'Specifically targets your community' };
    return { score: 0.8, reason: 'Open scheme with priority for your category' };
  }
  if (meaningfulUser.length === 0) {
    return schemeOpen
      ? { score: 0.75, reason: 'Open to all entrepreneurs' }
      : { score: 0.25, reason: 'Targeted scheme — limited fit' };
  }
  return schemeOpen
    ? { score: 0.45, reason: 'Open scheme, no special targeting for you' }
    : { score: 0.1, reason: 'Targets a different community' };
}

function listScore(userVal, list = []) {
  if (list.includes(userVal)) return 1;
  if (list.includes('any')) return 1;
  return 0.3;
}

function fundingScore(userMin, userMax, scheme) {
  const overlap = Math.min(userMax, scheme.loanMax) - Math.max(userMin, scheme.loanMin);
  if (overlap > 0) return 1;
  const gap = userMax < scheme.loanMin ? scheme.loanMin - userMax : userMin - scheme.loanMax;
  return Math.max(0.15, 1 - gap / 40);
}

function publicEntrepreneurScheme(schemeDoc) {
  const s = schemeDoc.toObject ? schemeDoc.toObject() : schemeDoc;
  return {
    id: s.frontendId || s.slug,
    name: s.name,
    shortName: s.shortName || s.name,
    provider: s.provider || s.ministry || '',
    tagline: s.tagline || '',
    description: s.description,
    categories: s.categories || [],
    stages: s.stages || [],
    sectors: s.sectors || [],
    locations: s.locations || [],
    loanMin: s.loanMin ?? 0,
    loanMax: s.loanMax ?? 0,
    amountLabel: s.amountLabel || '',
    interest: s.interest || '',
    benefits: s.benefits || [],
    documents: s.documents || [],
    applyUrl: s.applyUrl || s.officialUrl || '',
    colorTag: s.colorTag || '#0F5257'
  };
}

export function rankSchemes(profile, schemes) {
  // Current Udaan frontend profile shape
  if (Array.isArray(profile.categories) && profile.stage && profile.sector && profile.location) {
    return schemes
      .map((schemeDoc) => {
        const scheme = publicEntrepreneurScheme(schemeDoc);
        const cat = entrepreneurCategoryScore(profile.categories, scheme);
        const stageS = listScore(profile.stage, scheme.stages);
        const sectorS = listScore(profile.sector, scheme.sectors);
        const locS = listScore(profile.location, scheme.locations);
        const fundS = fundingScore(Number(profile.fundingMin || 0), Number(profile.fundingMax || 0), scheme);

        const total = cat.score * 0.35 + stageS * 0.15 + sectorS * 0.15 + locS * 0.1 + fundS * 0.25;
        const reasons = [cat.reason];
        if (stageS === 1) reasons.push('Matches your business stage');
        if (sectorS === 1) reasons.push('Fits your business sector');
        if (fundS === 1) reasons.push('Funding range matches your need');
        if (locS === 1) reasons.push('Available in your location type');
        const score = Math.round(Math.min(0.98, Math.max(0.04, total)) * 100);
        return { scheme, score, matchScore: score, eligible: true, reasons, blockers: [], missingInformation: [] };
      })
      .sort((a, b) => b.score - a.score);
  }

  // Safe generic fallback for older API clients
  return schemes.map((schemeDoc) => {
    const scheme = publicEntrepreneurScheme(schemeDoc);
    return { scheme, score: 75, matchScore: 75, eligible: true, reasons: ['Scheme available for review'], blockers: [], missingInformation: [] };
  }).sort((a, b) => b.score - a.score);
}
