const FIELD_ALIASES = {
  annualIncome: ['annualIncome', 'income', 'yearlyIncome'],
  fundingRequired: ['fundingRequired', 'funding', 'loanAmount', 'amountRequired'],
  businessType: ['businessType', 'business', 'sector'],
  businessStage: ['businessStage', 'stage'],
  category: ['category', 'casteCategory', 'socialCategory'],
  occupation: ['occupation', 'trade'],
  startupRecognized: ['startupRecognized', 'dpiitRecognized'],
  state: ['state'],
  district: ['district'],
  gender: ['gender'],
  age: ['age']
};

function normalizeString(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : value;
}

function normalizeArray(value) {
  return Array.isArray(value) ? value.map(normalizeString) : [normalizeString(value)];
}

function getValue(profile, field) {
  const aliases = FIELD_ALIASES[field] || [field];
  for (const key of aliases) {
    if (profile[key] !== undefined && profile[key] !== null && profile[key] !== '') return profile[key];
  }
  return undefined;
}

function rulePasses(profile, rule) {
  const actual = getValue(profile, rule.field);
  const expected = rule.value;

  if (actual === undefined) return { pass: false, missing: true };

  switch (rule.operator) {
    case 'eq':
      return { pass: normalizeString(actual) === normalizeString(expected) };
    case 'neq':
      return { pass: normalizeString(actual) !== normalizeString(expected) };
    case 'in':
      return { pass: normalizeArray(expected).includes(normalizeString(actual)) };
    case 'notIn':
      return { pass: !normalizeArray(expected).includes(normalizeString(actual)) };
    case 'gte':
      return { pass: Number(actual) >= Number(expected) };
    case 'lte':
      return { pass: Number(actual) <= Number(expected) };
    case 'between': {
      const [min, max] = Array.isArray(expected) ? expected : [];
      return { pass: Number(actual) >= Number(min) && Number(actual) <= Number(max) };
    }
    case 'includesAny': {
      const actualList = normalizeArray(actual);
      const expectedList = normalizeArray(expected);
      return { pass: expectedList.some((item) => actualList.includes(item)) };
    }
    case 'truthy':
      return { pass: Boolean(actual) === true };
    default:
      return { pass: false };
  }
}

function ruleMessage(rule, result) {
  const label = rule.label || rule.field;
  if (result.missing) return `${label}: information not provided`;
  return result.pass ? `${label}: matched` : `${label}: not matched`;
}

function evaluateGroup(profile, group) {
  const details = group.rules.map((rule) => ({ rule, result: rulePasses(profile, rule) }));
  const passed = group.logic === 'any'
    ? details.some((item) => item.result.pass)
    : details.every((item) => item.result.pass);

  return {
    passed,
    hard: group.hard,
    weight: group.weight || 10,
    message: group.label || `Rule group (${group.logic})`,
    details: details.map(({ rule, result }) => ruleMessage(rule, result))
  };
}

export function evaluateScheme(profile, schemeDoc) {
  const scheme = schemeDoc.toObject ? schemeDoc.toObject() : schemeDoc;
  const checks = [];

  for (const rule of scheme.rules || []) {
    const result = rulePasses(profile, rule);
    checks.push({
      passed: result.pass,
      hard: rule.hard,
      weight: rule.weight || 10,
      message: ruleMessage(rule, result),
      details: []
    });
  }

  for (const group of scheme.ruleGroups || []) {
    checks.push(evaluateGroup(profile, group));
  }

  const totalWeight = checks.reduce((sum, c) => sum + c.weight, 0) || 1;
  const matchedWeight = checks.reduce((sum, c) => sum + (c.passed ? c.weight : 0), 0);
  const score = checks.length ? Math.round((matchedWeight / totalWeight) * 100) : 75;
  const eligible = !checks.some((c) => c.hard && !c.passed);

  const reasons = checks.filter((c) => c.passed).map((c) => c.message);
  const blockers = checks.filter((c) => c.hard && !c.passed).map((c) => c.message);
  const missingInformation = checks
    .flatMap((c) => [c.message, ...(c.details || [])])
    .filter((text) => text.includes('information not provided'));

  return {
    id: scheme._id,
    name: scheme.name,
    slug: scheme.slug,
    ministry: scheme.ministry,
    description: scheme.description,
    benefits: scheme.benefits,
    tags: scheme.tags,
    officialUrl: scheme.officialUrl,
    eligible,
    matchScore: score,
    reasons,
    blockers,
    missingInformation,
    sourceNote: scheme.sourceNote
  };
}

export function rankSchemes(profile, schemes) {
  return schemes
    .map((scheme) => evaluateScheme(profile, scheme))
    .sort((a, b) => {
      if (a.eligible !== b.eligible) return a.eligible ? -1 : 1;
      return b.matchScore - a.matchScore;
    });
}
