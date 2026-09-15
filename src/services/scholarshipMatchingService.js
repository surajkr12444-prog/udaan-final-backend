function publicScholarship(doc) {
  const s = doc.toObject ? doc.toObject() : doc;
  return {
    id: s.frontendId,
    name: s.name,
    shortName: s.shortName,
    ministry: s.ministry,
    tagline: s.tagline,
    description: s.description,
    educationLevels: s.educationLevels || [],
    categories: s.categories || [],
    gender: s.gender || 'any',
    maxAnnualIncome: s.maxAnnualIncome,
    minPercentage: s.minPercentage,
    amountLabel: s.amountLabel,
    benefits: s.benefits || [],
    documents: s.documents || [],
    applyUrl: s.applyUrl,
    portalName: s.portalName,
    colorTag: s.colorTag,
    deadlineNotice: s.deadlineNotice || ''
  };
}

export function rankScholarships(profile, docs) {
  return docs.map((doc) => {
    const scholarship = publicScholarship(doc);
    const reasons = [];
    let score = 0;
    let eligible = true;

    if (scholarship.gender === 'female') {
      if (profile.gender === 'female') {
        score += 20;
        reasons.push('Dedicated scholarship for female scholars');
      } else {
        return { scholarship, score: 5, reasons: ['Reserved exclusively for female candidates'], eligible: false };
      }
    } else score += 15;

    if (scholarship.educationLevels.includes(profile.educationLevel)) {
      score += 30;
      reasons.push('Matches your current academic stage');
    } else {
      score += 5;
      reasons.push('Intended for a different education level');
      eligible = false;
    }

    const isCategoryMatch =
      scholarship.categories.includes(profile.category) ||
      (profile.category === 'general' && scholarship.categories.includes('general')) ||
      (profile.isSingleGirlChild && scholarship.categories.includes('girl_child')) ||
      (profile.isDisability && scholarship.categories.includes('disability'));

    if (isCategoryMatch) {
      score += 25;
      reasons.push('Matches your reservation / social eligibility criteria');
    } else if (scholarship.categories.includes('general')) {
      score += 15;
      reasons.push('Open to all categories meeting academic & income criteria');
    } else {
      score += 5;
      reasons.push('Targeted for another category, but review for special clauses');
    }

    if (Number(profile.familyIncome) <= Number(scholarship.maxAnnualIncome)) {
      score += 15;
      if (scholarship.maxAnnualIncome < 90) {
        reasons.push(`Family income (₹${profile.familyIncome}L) is within the ₹${scholarship.maxAnnualIncome}L ceiling`);
      } else reasons.push('No family income ceiling restriction');
    } else {
      score = Math.max(10, score - 20);
      reasons.push(`Family income exceeds ₹${scholarship.maxAnnualIncome} Lakh annual ceiling`);
      eligible = false;
    }

    if (Number(profile.marksPercentage) >= Number(scholarship.minPercentage)) {
      score += 10;
      reasons.push(`Your academic score (${profile.marksPercentage}%) meets the required cut-off (${scholarship.minPercentage}%)`);
    } else {
      score = Math.max(10, score - 15);
      reasons.push(`Requires minimum ${scholarship.minPercentage}% in qualifying examination`);
    }

    return { scholarship, score: Math.min(99, Math.max(10, Math.round(score))), reasons, eligible };
  }).sort((a, b) => b.score - a.score);
}
