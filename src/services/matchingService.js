
const DAY_MS = 24 * 60 * 60 * 1000;

const normalize = value =>
  String(value ?? '').trim().toLocaleLowerCase();

const nonEmpty = value =>
  value !== null &&
  value !== undefined &&
  String(value).trim() !== '';


  
function ageFromDob(dob, today = new Date()) {
  if (!dob) return null;

  let year;
  let month;
  let day;

  if (dob instanceof Date) {
    // Handle JavaScript Date objects
    year = dob.getUTCFullYear();
    month = dob.getUTCMonth() + 1;
    day = dob.getUTCDate();
  } else {
    // Handle PostgreSQL date strings: YYYY-MM-DD
    const match = String(dob).trim().match(
      /^(\d{4})-(\d{2})-(\d{2})/
    );

    if (!match) return null;

    year = Number(match[1]);
    month = Number(match[2]);
    day = Number(match[3]);
  }

  // Validate the actual calendar date
  const birthDate = new Date(
    Date.UTC(year, month - 1, day)
  );

  if (
    birthDate.getUTCFullYear() !== year ||
    birthDate.getUTCMonth() !== month - 1 ||
    birthDate.getUTCDate() !== day
  ) {
    return null;
  }

  let age = today.getFullYear() - year;

  const birthdayNotReached =
    today.getMonth() + 1 < month ||
    (
      today.getMonth() + 1 === month &&
      today.getDate() < day
    );

  if (birthdayNotReached) age--;

  return age >= 0 && age < 130 ? age : null;
}


function check(
  requirement,
  state,
  studentValue,
  required,
  explanation
) {
  return {
    requirement,
    state,
    studentValue: studentValue ?? null,
    required: required ?? null,
    explanation
  };
}

function listIncludes(list, value) {
  return (
    Array.isArray(list) &&
    list.some(item => normalize(item) === normalize(value))
  );
}

function assessRequirement(
  checks,
  requirement,
  studentValue,
  required,
  known,
  meets,
  explanation
) {
  const state = !known
    ? 'UNKNOWN'
    : meets
      ? 'MET'
      : 'NOT_MET';

  checks.push(
    check(
      requirement,
      state,
      studentValue,
      required,
      explanation
    )
  );
}

// Normalize common degree names without confusing them
// with opportunity subtypes such as internships.
function normalizeEducationLevel(value) {
  const v = normalize(value).replace(/[_-]/g, ' ');

  const aliases = {
    'high school': 'highschool',
    'high school student': 'highschool',
    'secondary school': 'highschool',
    'bachelor': 'undergraduate',
    "bachelor's": 'undergraduate',
    'bachelors': 'undergraduate',
    'bachelor degree': 'undergraduate',
    "bachelor's degree": 'undergraduate',
    'undergraduate degree': 'undergraduate',
    'master': 'postgraduate',
    "master's": 'postgraduate',
    'masters': 'postgraduate',
    "master's degree": 'postgraduate',
    'doctoral': 'phd',
    'doctorate': 'phd',
    'phd': 'phd'
  };

  return aliases[v] || v;
}

function evaluateEligibility(profile = {}, opportunity = {}) {
  const checks = [];

  const age = ageFromDob(profile.date_of_birth);

  // Age
  if (
    opportunity.min_age != null ||
    opportunity.max_age != null
  ) {
    const known = age !== null;

    const meets =
      known &&
      age >= (opportunity.min_age ?? 0) &&
      age <= (opportunity.max_age ?? 130);

    assessRequirement(
      checks,
      'Age',
      age,
      {
        min: opportunity.min_age,
        max: opportunity.max_age
      },
      known,
      meets,
      known
        ? meets
          ? 'Your age is within the stated range.'
          : 'Your age is outside the stated range.'
        : 'Add your date of birth to assess this requirement.'
    );
  }

  // Citizenship
  if (
    Array.isArray(opportunity.countries) &&
    opportunity.countries.length
  ) {
    const citizenship = profile.citizenship;
    const known = nonEmpty(citizenship);

    assessRequirement(
      checks,
      'Eligible citizenship / country',
      citizenship,
      opportunity.countries,
      known,
      listIncludes(opportunity.countries, citizenship),
      known
        ? 'Compared your citizenship with the listed countries.'
        : 'Add your citizenship to assess this restriction.'
    );
  }

  // Education level
  if (
    Array.isArray(opportunity.education_levels) &&
    opportunity.education_levels.length
  ) {
    const studentLevel = profile.education_level;
    const known = nonEmpty(studentLevel);

    const studentNormalized =
      normalizeEducationLevel(studentLevel);

    const allowedLevels =
      opportunity.education_levels.map(normalizeEducationLevel);

    const meets =
      known && allowedLevels.includes(studentNormalized);

    assessRequirement(
      checks,
      'Education level',
      studentLevel,
      opportunity.education_levels,
      known,
      meets,
      known
        ? 'Compared your education level with the stated eligible levels.'
        : 'Add your education level to assess this requirement.'
    );
  }

  // Academic percentage
  if (opportunity.min_academic_percent != null) {
    const value =
      profile.academic_scale === 'percentage'
        ? profile.academic_score
        : profile.academic_percent_equivalent;

    const known =
      value !== null &&
      value !== undefined &&
      Number.isFinite(Number(value));

    const numericValue = known ? Number(value) : null;

    assessRequirement(
      checks,
      'Academic performance',
      numericValue,
      `At least ${opportunity.min_academic_percent}%`,
      known,
      known &&
        numericValue >= Number(opportunity.min_academic_percent),
      known
        ? 'Compared using a compatible percentage scale or approved conversion.'
        : 'Your academic score cannot be compared reliably with this percentage requirement.'
    );
  }

  // Standardized tests
  const tests = Array.isArray(profile.tests)
    ? profile.tests
    : [];

  for (const req of opportunity.test_requirements || []) {
    const studentTest = tests.find(
      t => normalize(t.test_type) === normalize(req.test_type)
    );

    const score =
      studentTest && studentTest.score != null
        ? Number(studentTest.score)
        : null;

    // A test requirement without a published minimum score
    // cannot be reliably evaluated.
    const requirementKnown =
      req.min_score !== null &&
      req.min_score !== undefined &&
      Number.isFinite(Number(req.min_score));

    const studentScoreKnown =
      score !== null && Number.isFinite(score);

    const known = requirementKnown && studentScoreKnown;

    const meets =
      known &&
      score >= Number(req.min_score) &&
      (
        req.max_score == null ||
        score <= Number(req.max_score)
      );

    assessRequirement(
      checks,
      req.test_type,
      score,
      {
        min: requirementKnown ? Number(req.min_score) : null,
        max: req.max_score == null
          ? null
          : Number(req.max_score)
      },
      known,
      meets,
      !requirementKnown
        ? 'The opportunity test requirement needs verification.'
        : studentScoreKnown
          ? 'Compared your recorded score with the stated test requirement.'
          : `Add your ${req.test_type} result to assess this requirement.`
    );
  }

  const notMet = checks.some(c => c.state === 'NOT_MET');
  const unknown = checks.some(c => c.state === 'UNKNOWN');

  const metCount = checks.filter(
    c => c.state === 'MET'
  ).length;

  let status;

  if (notMet) {
    status = 'REQUIREMENTS_NOT_MET';
  } else if (
    checks.length === 0 ||
    unknown ||
    opportunity.is_verified !== true
  ) {
    // Do not claim eligibility when there is insufficient evidence.
    status = metCount > 0
      ? 'POTENTIAL_MATCH'
      : 'INSUFFICIENT_INFORMATION';
  } else {
    status = 'ELIGIBLE';
  }

  return {
    status,
    checks,
    gaps: checks.filter(c => c.state !== 'MET'),
    metCount,
    unknownCount: checks.filter(c => c.state === 'UNKNOWN').length,
    notMetCount: checks.filter(c => c.state === 'NOT_MET').length
  };
}

function evaluateGoalFit(goal, opportunity) {
  const dimensions = [];

  if (
    !goal ||
    (
      !goal.target_field &&
      !(goal.target_countries || []).length &&
      !goal.target_degree
    )
  ) {
    return {
      status: 'NOT_PERSONALIZED',
      score: null,
      alignmentScore: null,
      coverage: 0,
      assessedCount: 0,
      totalDimensions: 0,
      dimensions: [],
      explanation:
        'Not personalized yet. You can still explore all opportunities.'
    };
  }

  // Field alignment
  if (goal.target_field) {
    const known =
      Array.isArray(opportunity.fields) &&
      opportunity.fields.length > 0;

    dimensions.push({
      dimension: 'field',
      target: goal.target_field,
      state: !known
        ? 'UNKNOWN'
        : listIncludes(opportunity.fields, goal.target_field)
          ? 'ALIGNS'
          : 'DIFFERS',
      opportunityValues: opportunity.fields || []
    });
  }

  // Destination-country alignment
  if ((goal.target_countries || []).length) {
    const known =
      Array.isArray(opportunity.destinations) &&
      opportunity.destinations.length > 0;

    const aligns =
      known &&
      goal.target_countries.some(country =>
        listIncludes(opportunity.destinations, country)
      );

    dimensions.push({
      dimension: 'country',
      target: goal.target_countries,
      state: !known
        ? 'UNKNOWN'
        : aligns
          ? 'ALIGNS'
          : 'DIFFERS',
      opportunityValues: opportunity.destinations || []
    });
  }

  // Degree/pathway alignment.
  // IMPORTANT: Do not compare subtype_name or category here.
  if (goal.target_degree) {
    const degreeValues = Array.isArray(opportunity.education_levels)
      ? opportunity.education_levels
      : [];

    const known = degreeValues.length > 0;

    const target = normalizeEducationLevel(goal.target_degree);

    const aligns =
      known &&
      degreeValues.some(
        value => normalizeEducationLevel(value) === target
      );

    dimensions.push({
      dimension: 'degree_or_pathway',
      target: goal.target_degree,
      state: !known
        ? 'UNKNOWN'
        : aligns
          ? 'ALIGNS'
          : 'DIFFERS',
      opportunityValues: degreeValues
    });
  }

  const applicable = dimensions.filter(
    d => d.state !== 'UNKNOWN'
  );

  const priorities = Array.isArray(goal.priority_dimensions)
    ? goal.priority_dimensions
    : [];

  const weight = d =>
    priorities.includes(d.dimension) ? 2 : 1;

  const totalWeight = applicable.reduce(
    (sum, d) => sum + weight(d),
    0
  );

  const alignedWeight = applicable
    .filter(d => d.state === 'ALIGNS')
    .reduce((sum, d) => sum + weight(d), 0);

  const alignmentScore = totalWeight
    ? Math.round((alignedWeight / totalWeight) * 100)
    : null;

  const assessedCount = applicable.length;
  const totalDimensions = dimensions.length;

  const coverage = totalDimensions
    ? Math.round((assessedCount / totalDimensions) * 100)
    : 0;

  // Only show a final goal-fit score when every requested
  // dimension has enough opportunity data to be assessed.
  const score =
    assessedCount === totalDimensions
      ? alignmentScore
      : null;

  let status;

  if (score === null) {
    status = 'INSUFFICIENT_DATA';
  } else if (score >= 67) {
    status = 'STRONG_FIT';
  } else if (score > 0) {
    status = 'PARTIAL_FIT';
  } else {
    status = 'LOW_FIT';
  }

  return {
    status,
    score,
    alignmentScore,
    coverage,
    assessedCount,
    totalDimensions,
    dimensions,
    priorityDimensions: priorities,
    explanation:
      score === null
        ? `Only ${assessedCount} of ${totalDimensions} goal dimensions could be assessed. More opportunity information is needed.`
        : `${dimensions.filter(d => d.state === 'ALIGNS').length} of ${totalDimensions} goal dimensions align.`
  };
}

function opportunityClassification(opportunity) {
  const subtype = normalize(opportunity.subtype_name);

  const category = normalize(
    opportunity.subtype_category || opportunity.category
  );

  const scholarshipLike =
    category === 'scholarship' ||
    category === 'scholarships' ||
    subtype.includes('scholarship');

  const degreeLike =
    subtype.includes('undergraduate_scholarship') ||
    subtype.includes('graduate_scholarship') ||
    subtype.includes('school_level_scholarship');

  if (scholarshipLike && degreeLike) {
    return {
      type: 'DIRECT_OPPORTUNITY',
      label: 'Direct educational funding',
      explanation:
        'This is classified as a scholarship for an educational level; check its details for the exact funding scope.'
    };
  }

  if (scholarshipLike) {
    return {
      type: 'DIRECT_OR_SPECIALIZED_FUNDING',
      label: 'Specialized scholarship',
      explanation:
        'This scholarship may support a specific subject or need; verify what it funds.'
    };
  }

  if (
    [
      'summer_program',
      'academic_enrichment',
      'science_or_technology_camp',
      'language_learning',
      'mentorship',
      'leadership_program',
      'research_program',
      'student_exchange',
      'online_learning_program',
      'competition',
      'conference_or_workshop',
      'internship',
      'volunteering'
    ].some(x => subtype.includes(x))
  ) {
    return {
      type: 'PREPARATION_OPPORTUNITY',
      label: 'Preparation or enrichment',
      explanation:
        'This opportunity may help build experience or skills; it is not automatically a degree scholarship.'
    };
  }

  return {
    type: 'UNCONFIRMED_PURPOSE',
    label: 'Purpose needs confirmation',
    explanation:
      'The available subtype is not enough to confidently classify this opportunity.'
  };
}

function dataQuality(opportunity) {
  const warnings = [];

  if (opportunity.is_verified !== true) {
    warnings.push(
      'Opportunity details have not been marked as verified by an administrator.'
    );
  }

  if (!nonEmpty(opportunity.description)) {
    warnings.push('Description is missing.');
  }

  if (!nonEmpty(opportunity.application_url)) {
    warnings.push('Official information/application link is missing.');
  }

  if (!opportunity.deadline) {
    warnings.push('Deadline not provided.');
  }

  if (
    !Array.isArray(opportunity.destinations) ||
    !opportunity.destinations.length
  ) {
    warnings.push('Destination or location information is missing.');
  }

  if (
    !Array.isArray(opportunity.education_levels) ||
    !opportunity.education_levels.length
  ) {
    warnings.push('Education-level information is missing.');
  }

  if (
    !Array.isArray(opportunity.fields) ||
    !opportunity.fields.length
  ) {
    warnings.push('Relevant fields are missing.');
  }

  if (
    !Array.isArray(opportunity.countries) ||
    !opportunity.countries.length
  ) {
    warnings.push(
      'Eligible citizenship information is missing or not confirmed.'
    );
  }

  if (!opportunity.subtype_name) {
    warnings.push('Opportunity subtype is missing.');
  }

  return {
    isVerified: Boolean(opportunity.is_verified),
    warnings,
    needsReview: warnings.length > 0
  };
}

function deadlineInfo(deadline, now = new Date()) {
  if (!deadline) {
    return {
      status: 'NOT_PROVIDED',
      daysRemaining: null,
      label: 'Deadline not provided'
    };
  }

  const raw = String(deadline).slice(0, 10).split('-').map(Number);

  if (
    raw.length !== 3 ||
    raw.some(Number.isNaN)
  ) {
    return {
      status: 'INVALID',
      daysRemaining: null,
      label: 'Deadline needs verification'
    };
  }

  const target = Date.UTC(raw[0], raw[1] - 1, raw[2]);

  const current = Date.UTC(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  const daysRemaining = Math.round(
    (target - current) / DAY_MS
  );

  if (daysRemaining < 0) {
    return {
      status: 'EXPIRED',
      daysRemaining,
      label: 'Deadline passed'
    };
  }

  if (daysRemaining <= 14) {
    return {
      status: 'APPROACHING',
      daysRemaining,
      label:
        daysRemaining === 0
          ? 'Deadline today'
          : `${daysRemaining} day${daysRemaining === 1 ? '' : 's'} left`
    };
  }

  return {
    status: 'UPCOMING',
    daysRemaining,
    label: String(deadline).slice(0, 10)
  };
}

function evaluate(
  profile,
  goal,
  opportunity,
  savedStatus = null
) {
  const eligibility = evaluateEligibility(
    profile || {},
    opportunity
  );

  const goalFit = evaluateGoalFit(
    goal,
    opportunity
  );

  const deadline = deadlineInfo(opportunity.deadline);

  const classification = opportunityClassification(
    opportunity
  );

  const quality = dataQuality(opportunity);

  const nextSteps = [];

  for (const gap of eligibility.gaps) {
    if (gap.state === 'UNKNOWN') {
      nextSteps.push({
        type: 'PROFILE_OR_VERIFY',
        action:
          gap.requirement === 'Age'
            ? 'Add your date of birth to your profile.'
            : gap.requirement === 'Academic performance'
              ? 'Add your academic score and scale, or an approved percentage conversion.'
              : `Add or verify your ${gap.requirement} information.`
      });
    } else {
      nextSteps.push({
        type: 'REQUIREMENT_GAP',
        action:
          `Review the ${gap.requirement} requirement on the official opportunity page before deciding whether to apply.`
      });
    }
  }

  if (quality.warnings.length) {
    nextSteps.push({
      type: 'VERIFY_INFORMATION',
      action:
        'Some opportunity information is missing or unverified. Review the official provider information before relying on this result.'
    });
  }

  if (opportunity.application_url) {
    nextSteps.push({
      type: 'OFFICIAL_LINK',
      action:
        'Read the official opportunity page for complete criteria and application instructions.'
    });
  }

  return {
    eligibility,
    goalFit,
    classification,
    dataQuality: quality,
    deadline,
    nextSteps,
    savedStatus
  };
}

module.exports = {
  evaluate,
  evaluateEligibility,
  evaluateGoalFit,
  opportunityClassification,
  dataQuality,
  deadlineInfo,
  ageFromDob,
  normalizeEducationLevel
};
