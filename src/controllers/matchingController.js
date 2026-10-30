const pool = require('../config/db');
const { evaluate } = require('../services/matchingService');

async function loadStudent(userId) {
  const profileResult = await pool.query(`
    SELECT p.*, COALESCE((SELECT json_agg(json_build_object('test_type', t.test_type, 'score', t.score, 'max_score', t.max_score, 'score_text', t.score_text) ORDER BY t.test_id DESC)
      FROM student_tests t WHERE t.user_id = p.user_id), '[]'::json) AS tests
    FROM student_profiles p WHERE p.user_id = $1`, [userId]);
  const goalResult = await pool.query('SELECT * FROM student_goals WHERE user_id=$1 ORDER BY goal_id DESC LIMIT 1', [userId]);
  return { profile: profileResult.rows[0] || null, goal: goalResult.rows[0] || null };
}
const OPPORTUNITY_SELECT = `
  SELECT o.*, s.subtype_name, s.category AS subtype_category,
    COALESCE((SELECT json_agg(c.country_name ORDER BY c.country_name) FROM opportunity_countries c WHERE c.opportunity_id=o.opportunity_id), '[]'::json) AS countries,
    COALESCE((SELECT json_agg(d.country_name ORDER BY d.country_name) FROM opportunity_destinations d WHERE d.opportunity_id=o.opportunity_id), '[]'::json) AS destinations,
    COALESCE((SELECT json_agg(f.field_name ORDER BY f.field_name) FROM opportunity_fields f WHERE f.opportunity_id=o.opportunity_id), '[]'::json) AS fields,
    COALESCE((SELECT json_agg(json_build_object('test_type', r.test_type, 'min_score', r.min_score, 'max_score', r.max_score) ORDER BY r.test_type) FROM opportunity_test_requirements r WHERE r.opportunity_id=o.opportunity_id), '[]'::json) AS test_requirements,
    COALESCE((SELECT json_agg(e.education_level ORDER BY e.education_level) FROM opportunity_education_levels e WHERE e.opportunity_id=o.opportunity_id), '[]'::json) AS education_levels
  FROM opportunities o LEFT JOIN opportunity_subtypes s ON o.subtype_id=s.subtype_id`;

function textMatch(value, query) { return String(value ?? '').toLowerCase().includes(String(query ?? '').trim().toLowerCase()); }
function buildResult(opportunity, profile, goal, savedStatus) {
  return { opportunity, ...evaluate(profile || {}, goal, opportunity, savedStatus) };
}
function orderResults(results, sort) {
  const eligibilityRank = { ELIGIBLE: 0, POTENTIALLY_ELIGIBLE: 1, REQUIREMENTS_NOT_MET: 2 };
  results.sort((a, b) => {
    if (sort === 'deadline') return (a.deadline.daysRemaining ?? 999999) - (b.deadline.daysRemaining ?? 999999) || a.opportunity.opportunity_id - b.opportunity.opportunity_id;
    if (sort === 'newest') return new Date(b.opportunity.created_at || 0) - new Date(a.opportunity.created_at || 0) || a.opportunity.opportunity_id - b.opportunity.opportunity_id;
    const eligibility = eligibilityRank[a.eligibility.status] - eligibilityRank[b.eligibility.status];
    if (eligibility) return eligibility;
    const fit = (b.goalFit.score ?? -1) - (a.goalFit.score ?? -1);
    if (fit) return fit;
    const quality = Number(b.dataQuality.isVerified) - Number(a.dataQuality.isVerified);
    if (quality) return quality;
    const deadline = (a.deadline.daysRemaining ?? 999999) - (b.deadline.daysRemaining ?? 999999);
    return deadline || a.opportunity.opportunity_id - b.opportunity.opportunity_id;
  });
  return results;
}
async function savedStatuses(userId) {
  const r = await pool.query('SELECT opportunity_id, status FROM student_saved_opportunities WHERE user_id=$1', [userId]);
  return new Map(r.rows.map(row => [String(row.opportunity_id), row.status]));
}

exports.getMatches = async (req, res) => {
  try {
    const { profile, goal } = await loadStudent(req.user.user_id);
    if (!profile) return res.status(404).json({ success: false, message: 'Create your profile before personalized matching', matches: [] });
    const [opps, saved] = await Promise.all([
      pool.query(`${OPPORTUNITY_SELECT} WHERE o.is_active=true AND (o.deadline IS NULL OR o.deadline >= CURRENT_DATE) AND COALESCE(s.is_active,true)=true`),
      savedStatuses(req.user.user_id)
    ]);
    const matches = orderResults(opps.rows.map(o => buildResult(o, profile, goal, saved.get(String(o.opportunity_id)) || null)));
    res.json({ success: true, profile, goal, matches, sections: {
      eligible: matches.filter(m => m.eligibility.status === 'ELIGIBLE'),
      potentiallyEligible: matches.filter(m => m.eligibility.status === 'POTENTIALLY_ELIGIBLE'),
      requirementsNotMet: matches.filter(m => m.eligibility.status === 'REQUIREMENTS_NOT_MET')
    }});
  } catch (e) { console.error('Matching failed:', e); res.status(500).json({ success: false, message: 'Matching failed' }); }
};

exports.explore = async (req, res) => {
  try {
    const { profile, goal } = await loadStudent(req.user.user_id);
    const q = String(req.query.q || '').trim();
    const expired = req.query.status === 'expired';
    const filters = {
      type: req.query.type, subtype: req.query.subtype, field: req.query.field,
      country: req.query.country, educationLevel: req.query.education_level,
      eligibility: req.query.eligibility, deadline: req.query.deadline
    };
    const [opps, saved] = await Promise.all([
      pool.query(`${OPPORTUNITY_SELECT} WHERE o.is_active=true AND COALESCE(s.is_active,true)=true ORDER BY o.created_at DESC, o.opportunity_id`),
      savedStatuses(req.user.user_id)
    ]);
    let results = opps.rows.map(o => buildResult(o, profile, goal, saved.get(String(o.opportunity_id)) || null));
    results = results.filter(item => expired ? item.deadline.status === 'EXPIRED' : item.deadline.status !== 'EXPIRED');
    if (q) results = results.filter(({ opportunity: o }) => [o.title,o.provider,o.description,o.category,o.subtype_name,...(o.fields||[]),...(o.countries||[]),...(o.destinations||[])].some(v => textMatch(v,q)));
    if (filters.type) results = results.filter(({ opportunity:o }) => textMatch(o.subtype_category || o.category, filters.type));
    if (filters.subtype) results = results.filter(({ opportunity:o }) => normalizeText(o.subtype_name) === normalizeText(filters.subtype));
    if (filters.field) results = results.filter(({ opportunity:o }) => (o.fields||[]).some(v=>textMatch(v,filters.field)));
    if (filters.country) results = results.filter(({ opportunity:o }) => (o.destinations||[]).some(v=>textMatch(v,filters.country))); 
    if (filters.educationLevel) results = results.filter(({ opportunity:o }) => (o.education_levels||[]).some(v=>textMatch(v,filters.educationLevel)));
    if (filters.eligibility) results = results.filter(item => item.eligibility.status === filters.eligibility);
    if (filters.deadline === 'approaching') results = results.filter(item => item.deadline.status === 'APPROACHING');
    if (filters.deadline === 'upcoming') results = results.filter(item => item.deadline.status === 'UPCOMING');
    orderResults(results, req.query.sort);
    res.json({ success: true, goal, profileAvailable: Boolean(profile), total: results.length, opportunities: results });
  } catch (e) { console.error('Explore failed:', e); res.status(500).json({ success: false, message: 'Could not load opportunities' }); }
};
function normalizeText(v) { return String(v ?? '').trim().toLowerCase(); }

exports.getOpportunity = async (req, res) => {
  try {
    const { profile, goal } = await loadStudent(req.user.user_id);
    const [opps, saved] = await Promise.all([
      pool.query(`${OPPORTUNITY_SELECT} WHERE o.opportunity_id=$1 AND o.is_active=true`, [req.params.id]),
      savedStatuses(req.user.user_id)
    ]);
    if (!opps.rowCount) return res.status(404).json({ success: false, message: 'Opportunity not found or no longer active' });
    res.json({ success: true, result: buildResult(opps.rows[0], profile, goal, saved.get(String(req.params.id)) || null) });
  } catch (e) { console.error('Opportunity details failed:', e); res.status(500).json({ success: false, message: 'Could not load opportunity details' }); }
};

exports.listSaved = async (req, res) => {
  try {
    const { profile, goal } = await loadStudent(req.user.user_id);
    const [r, saved] = await Promise.all([
      pool.query(`${OPPORTUNITY_SELECT}
        JOIN student_saved_opportunities so ON so.opportunity_id=o.opportunity_id
        WHERE so.user_id=$1 ORDER BY so.updated_at DESC, o.opportunity_id`, [req.user.user_id]),
      savedStatuses(req.user.user_id)
    ]);
    res.json({ success: true, opportunities: r.rows.map(o => buildResult(o, profile, goal, saved.get(String(o.opportunity_id)) || null)) });
  } catch (e) { console.error('Saved opportunities failed:', e); res.status(500).json({ success: false, message: 'Could not load saved opportunities' }); }
};

exports.saveOpportunity = async (req, res) => {
  const { id } = req.params;
  const status = req.body.status || 'RESEARCHING';
  const allowed = ['RESEARCHING','CONSIDERING','PLANNING_TO_APPLY','APPLIED'];
  if (!allowed.includes(status)) return res.status(400).json({ success: false, message: 'Invalid tracking status' });
  try {
    const exists = await pool.query('SELECT opportunity_id FROM opportunities WHERE opportunity_id=$1 AND is_active=true', [id]);
    if (!exists.rowCount) return res.status(404).json({ success: false, message: 'Opportunity not found or no longer active' });
    const r = await pool.query(`INSERT INTO student_saved_opportunities(user_id,opportunity_id,status)
      VALUES($1,$2,$3) ON CONFLICT(user_id,opportunity_id) DO UPDATE SET status=EXCLUDED.status, updated_at=NOW()
      RETURNING opportunity_id,status,created_at,updated_at`, [req.user.user_id,id,status]);
    res.json({ success: true, saved: r.rows[0] });
  } catch (e) { console.error('Save opportunity failed:', e); res.status(500).json({ success: false, message: 'Could not save opportunity' }); }
};
exports.updateSavedStatus = async (req, res) => {
  const status = req.body.status;
  if (!['RESEARCHING','CONSIDERING','PLANNING_TO_APPLY','APPLIED'].includes(status)) return res.status(400).json({ success: false, message: 'Invalid tracking status' });
  try {
    const r = await pool.query('UPDATE student_saved_opportunities SET status=$1,updated_at=NOW() WHERE user_id=$2 AND opportunity_id=$3 RETURNING *', [status,req.user.user_id,req.params.id]);
    if (!r.rowCount) return res.status(404).json({ success: false, message: 'This opportunity is not in your saved list' });
    res.json({ success: true, saved: r.rows[0] });
  } catch (e) { console.error('Update saved status failed:', e); res.status(500).json({ success: false, message: 'Could not update tracking status' }); }
};
exports.removeSaved = async (req, res) => {
  try {
    const r = await pool.query('DELETE FROM student_saved_opportunities WHERE user_id=$1 AND opportunity_id=$2 RETURNING opportunity_id', [req.user.user_id,req.params.id]);
    if (!r.rowCount) return res.status(404).json({ success: false, message: 'This opportunity is not in your saved list' });
    res.json({ success: true });
  } catch (e) { console.error('Remove saved opportunity failed:', e); res.status(500).json({ success: false, message: 'Could not remove saved opportunity' }); }
};
