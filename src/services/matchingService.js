const DAY_MS = 24 * 60 * 60 * 1000;
const normalize = value => String(value ?? '').trim().toLocaleLowerCase();
const nonEmpty = value => value !== null && value !== undefined && String(value).trim() !== '';

// DATE columns are date-only values; parse their YYYY-MM-DD parts without UTC shifts.
function ageFromDob(dob, today = new Date()) {
  if (!dob) return null;
  const raw = String(dob).slice(0, 10);
  const parts = raw.split('-').map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return null;
  const [year, month, day] = parts;
  const ageDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  let age = ageDate.getFullYear() - year;
  if (ageDate.getMonth() + 1 < month || (ageDate.getMonth() + 1 === month && ageDate.getDate() < day)) age--;
  return age >= 0 && age < 130 ? age : null;
}
function check(requirement, state, studentValue, required, explanation) {
  return { requirement, state, studentValue: studentValue ?? null, required: required ?? null, explanation };
}
function listIncludes(list, value) {
  return Array.isArray(list) && list.some(item => normalize(item) === normalize(value));
}
function assessRequirement(checks, requirement, studentValue, required, known, meets, explanation) {
  const state = !known ? 'UNKNOWN' : meets ? 'MET' : 'NOT_MET';
  checks.push(check(requirement, state, studentValue, required, explanation));
}
function evaluateEligibility(profile = {}, opportunity = {}) {
  const checks = [];
  const age = ageFromDob(profile.date_of_birth);
  if (opportunity.min_age != null || opportunity.max_age != null) {
    const known = age != null;
    const meets = known && age >= (opportunity.min_age ?? 0) && age <= (opportunity.max_age ?? 130);
    assessRequirement(checks, 'Age', age, { min: opportunity.min_age, max: opportunity.max_age }, known, meets,
      known ? (meets ? 'Your age is within the stated range.' : 'Your age is outside the stated range.') : 'Add your date of birth to assess this requirement.');
  }
  // Country/field/education lists are treated as eligibility restrictions only when present.
  // Empty lists mean the opportunity data does not state a restriction, not that any value is required.
  if (Array.isArray(opportunity.countries) && opportunity.countries.length) {
    const citizenship = profile.citizenship;
    assessRequirement(checks, 'Eligible citizenship / country', citizenship, opportunity.countries, nonEmpty(citizenship),
      listIncludes(opportunity.countries, citizenship), nonEmpty(citizenship) ? 'Compared your citizenship with the listed countries.' : 'Add your citizenship to assess this restriction.');
  }
  if (Array.isArray(opportunity.education_levels) && opportunity.education_levels.length) {
    assessRequirement(checks, 'Education level', profile.education_level, opportunity.education_levels, nonEmpty(profile.education_level),
      listIncludes(opportunity.education_levels, profile.education_level), nonEmpty(profile.education_level) ? 'Compared your education level with the stated levels.' : 'Add your education level to assess this requirement.');
  }
  if (opportunity.min_academic_percent != null) {
    const value = profile.academic_scale === 'percentage' ? profile.academic_score : profile.academic_percent_equivalent;
    const known = value != null && Number.isFinite(Number(value));
    assessRequirement(checks, 'Academic performance', known ? Number(value) : null, `At least ${opportunity.min_academic_percent}%`, known,
      known && Number(value) >= Number(opportunity.min_academic_percent), known ? 'Compared using a compatible percentage scale or a stored approved conversion.' : 'Your academic score cannot be compared reliably with this percentage requirement. Add a percentage score or an approved conversion.');
  }
  const tests = Array.isArray(profile.tests) ? profile.tests : [];
  for (const req of (opportunity.test_requirements || [])) {
    const studentTest = tests.find(t => normalize(t.test_type) === normalize(req.test_type));
    const score = studentTest && studentTest.score != null ? Number(studentTest.score) : null;
    const known = score != null && Number.isFinite(score);
    const meets = known && score >= Number(req.min_score) && (req.max_score == null || score <= Number(req.max_score));
    assessRequirement(checks, req.test_type, score, { min: Number(req.min_score), max: req.max_score == null ? null : Number(req.max_score) }, known, meets,
      known ? 'Compared your recorded score with the stated test requirement.' : `Add your ${req.test_type} result to assess this requirement.`);
  }
  const notMet = checks.some(c => c.state === 'NOT_MET');
  const unknown = checks.some(c => c.state === 'UNKNOWN');
  const status = notMet ? 'REQUIREMENTS_NOT_MET' : (unknown || checks.length === 0 || opportunity.is_verified !== true) ? 'POTENTIALLY_ELIGIBLE' : 'ELIGIBLE';
  return { status, checks, gaps: checks.filter(c => c.state !== 'MET'), metCount: checks.filter(c => c.state === 'MET').length };
}
function evaluateGoalFit(goal, opportunity) {
  const dimensions = [];
  if (!goal || (!goal.target_field && !(goal.target_countries || []).length && !goal.target_degree)) {
    return { status: 'NOT_PERSONALIZED', score: null, dimensions: [], explanation: 'Not personalized yet. You can still explore all opportunities.' };
  }
  if (goal.target_field) {
    const known = Array.isArray(opportunity.fields) && opportunity.fields.length > 0;
    dimensions.push({ dimension: 'field', target: goal.target_field, state: !known ? 'UNKNOWN' : listIncludes(opportunity.fields, goal.target_field) ? 'ALIGNS' : 'DIFFERS', opportunityValues: opportunity.fields || [] });
  }
  if ((goal.target_countries || []).length) {
    const known = Array.isArray(opportunity.destinations) && opportunity.destinations.length > 0;
    const aligns = known && goal.target_countries.some(country => listIncludes(opportunity.destinations, country));
    dimensions.push({ dimension: 'country', target: goal.target_countries, state: !known ? 'UNKNOWN' : aligns ? 'ALIGNS' : 'DIFFERS', opportunityValues: opportunity.destinations || [] });
  }
  if (goal.target_degree) {
    const degreeValues = [...(opportunity.education_levels || []), opportunity.subtype_name || '', opportunity.category || ''];
    const known = degreeValues.some(nonEmpty);
    const target = normalize(goal.target_degree);
    const aligns = known && degreeValues.some(v => normalize(v).includes(target) || target.includes(normalize(v)));
    dimensions.push({ dimension: 'degree_or_pathway', target: goal.target_degree, state: !known ? 'UNKNOWN' : aligns ? 'ALIGNS' : 'DIFFERS', opportunityValues: degreeValues.filter(nonEmpty) });
  }
  const applicable = dimensions.filter(d => d.state !== 'UNKNOWN');
  const priorities = Array.isArray(goal.priority_dimensions) ? goal.priority_dimensions : [];
  const weight = d => priorities.includes(d.dimension) ? 2 : 1;
  const totalWeight = applicable.reduce((sum,d)=>sum+weight(d),0);
  const alignedWeight = applicable.filter(d=>d.state==='ALIGNS').reduce((sum,d)=>sum+weight(d),0);
  const score = totalWeight ? Math.round(alignedWeight / totalWeight * 100) : null;
  return { status: score == null ? 'INSUFFICIENT_DATA' : score >= 67 ? 'STRONG_FIT' : score > 0 ? 'PARTIAL_FIT' : 'LOW_FIT', score, dimensions, priorityDimensions: priorities,
    explanation: score == null ? 'There is not enough opportunity information to assess goal fit.' : priorities.length ? `Goal fit is weighted toward your selected priorities; ${applicable.filter(d=>d.state==='ALIGNS').length} of ${applicable.length} assessable dimensions align.` : `${applicable.filter(d => d.state === 'ALIGNS').length} of ${applicable.length} assessable goal dimensions align.` };
}
function opportunityClassification(opportunity) {
  const subtype = normalize(opportunity.subtype_name);
  const category = normalize(opportunity.subtype_category || opportunity.category);
  const scholarshipLike = category === 'scholarship' || category === 'scholarships' || subtype.includes('scholarship');
  const degreeLike = subtype.includes('undergraduate_scholarship') || subtype.includes('graduate_scholarship') || subtype.includes('school_level_scholarship');
  if (scholarshipLike && degreeLike) return { type: 'DIRECT_OPPORTUNITY', label: 'Direct educational funding', explanation: 'This is classified as a scholarship for an educational level; check its details for the exact funding scope.' };
  if (scholarshipLike) return { type: 'DIRECT_OR_SPECIALIZED_FUNDING', label: 'Specialized scholarship', explanation: 'This scholarship may support a specific subject or need; verify what it funds.' };
  if (['summer_program','academic_enrichment','science_or_technology_camp','language_learning','mentorship','leadership_program','research_program','student_exchange','online_learning_program','competition','conference_or_workshop','internship','volunteering'].some(x => subtype.includes(x)))
    return { type: 'PREPARATION_OPPORTUNITY', label: 'Preparation or enrichment', explanation: 'This opportunity may help build experience or skills; it is not automatically a degree scholarship.' };
  return { type: 'UNCONFIRMED_PURPOSE', label: 'Purpose needs confirmation', explanation: 'The available subtype is not enough to confidently classify this opportunity.' };
}
function dataQuality(opportunity) {
  const warnings = [];
  if (!opportunity.is_verified) warnings.push('Opportunity details have not been marked as verified by an administrator.');
  if (!nonEmpty(opportunity.description)) warnings.push('Description is missing.');
  if (!nonEmpty(opportunity.application_url)) warnings.push('Official information/application link is missing.');
  if (!opportunity.deadline) warnings.push('Deadline not provided.');
  if (!Array.isArray(opportunity.destinations) || !opportunity.destinations.length) warnings.push('Destination or location information is missing.');
  if (!Array.isArray(opportunity.education_levels) || !opportunity.education_levels.length) warnings.push('Education-level information is missing.');
  if (!opportunity.subtype_name) warnings.push('Opportunity subtype is missing.');
  return { isVerified: Boolean(opportunity.is_verified), warnings, needsReview: warnings.length > 0 };
}
function deadlineInfo(deadline, now = new Date()) {
  if (!deadline) return { status: 'NOT_PROVIDED', daysRemaining: null, label: 'Deadline not provided' };
  const raw = String(deadline).slice(0, 10).split('-').map(Number);
  const target = Date.UTC(raw[0], raw[1] - 1, raw[2]);
  const current = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const daysRemaining = Math.round((target - current) / DAY_MS);
  if (daysRemaining < 0) return { status: 'EXPIRED', daysRemaining, label: 'Deadline passed' };
  if (daysRemaining <= 14) return { status: 'APPROACHING', daysRemaining, label: daysRemaining === 0 ? 'Deadline today' : `${daysRemaining} day${daysRemaining === 1 ? '' : 's'} left` };
  return { status: 'UPCOMING', daysRemaining, label: String(deadline).slice(0, 10) };
}
function evaluate(profile, goal, opportunity, savedStatus = null) {
  const eligibility = evaluateEligibility(profile, opportunity);
  const goalFit = evaluateGoalFit(goal, opportunity);
  const deadline = deadlineInfo(opportunity.deadline);
  const classification = opportunityClassification(opportunity);
  const quality = dataQuality(opportunity);
  const nextSteps = [];
  for (const gap of eligibility.gaps) {
    if (gap.state === 'UNKNOWN') nextSteps.push({ type: 'PROFILE_OR_VERIFY', action: gap.requirement === 'Age' ? 'Add your date of birth to your profile.' : gap.requirement === 'Academic performance' ? 'Add your academic score and scale, or an approved percentage conversion.' : `Add or verify your ${gap.requirement} information.` });
    else nextSteps.push({ type: 'REQUIREMENT_GAP', action: `Review the ${gap.requirement} requirement on the official opportunity page before deciding whether to apply.` });
  }
  if (quality.warnings.length) nextSteps.push({ type: 'VERIFY_INFORMATION', action: 'Review the official opportunity information and treat unverified details cautiously.' });
  if (opportunity.application_url) nextSteps.push({ type: 'OFFICIAL_LINK', action: 'Read the official opportunity page for complete criteria and application instructions.' });
  return { eligibility, goalFit, classification, dataQuality: quality, deadline, nextSteps, savedStatus };
}
module.exports = { evaluate, evaluateEligibility, evaluateGoalFit, opportunityClassification, dataQuality, deadlineInfo, ageFromDob };
