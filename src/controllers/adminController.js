const pool = require('../config/db');

const OPPORTUNITY_SELECT = `
  SELECT o.*, s.subtype_name, s.category AS subtype_category,
    COALESCE((SELECT json_agg(x.country_name ORDER BY x.country_name) FROM opportunity_countries x WHERE x.opportunity_id=o.opportunity_id), '[]'::json) AS countries,
    COALESCE((SELECT json_agg(x.country_name ORDER BY x.country_name) FROM opportunity_destinations x WHERE x.opportunity_id=o.opportunity_id), '[]'::json) AS destinations,
    COALESCE((SELECT json_agg(x.field_name ORDER BY x.field_name) FROM opportunity_fields x WHERE x.opportunity_id=o.opportunity_id), '[]'::json) AS fields,
    COALESCE((SELECT json_agg(x.education_level ORDER BY x.education_level) FROM opportunity_education_levels x WHERE x.opportunity_id=o.opportunity_id), '[]'::json) AS education_levels,
    COALESCE((SELECT json_agg(json_build_object('test_type',x.test_type,'min_score',x.min_score,'max_score',x.max_score) ORDER BY x.test_type) FROM opportunity_test_requirements x WHERE x.opportunity_id=o.opportunity_id), '[]'::json) AS test_requirements
  FROM opportunities o LEFT JOIN opportunity_subtypes s ON s.subtype_id=o.subtype_id`;

const asList = value => Array.isArray(value) ? [...new Set(value.map(x => String(x).trim()).filter(Boolean))] : String(value || '').split(',').map(x => x.trim()).filter(Boolean);
const nullableNumber = value => value === '' || value === null || value === undefined ? null : Number(value);

async function replaceList(client, table, column, opportunityId, values) {
  await client.query(`DELETE FROM ${table} WHERE opportunity_id=$1`, [opportunityId]);
  for (const value of asList(values)) {
    await client.query(`INSERT INTO ${table}(opportunity_id, ${column}) VALUES($1,$2) ON CONFLICT DO NOTHING`, [opportunityId, value]);
  }
}
async function replaceTests(client, opportunityId, tests) {
  await client.query('DELETE FROM opportunity_test_requirements WHERE opportunity_id=$1', [opportunityId]);
  const rows = Array.isArray(tests) ? tests : [];
  for (const test of rows) {
    if (!test.test_type || test.min_score === '' || test.min_score === null || test.min_score === undefined) continue;
    await client.query('INSERT INTO opportunity_test_requirements(opportunity_id,test_type,min_score,max_score) VALUES($1,$2,$3,$4)',
      [opportunityId, String(test.test_type).trim(), Number(test.min_score), nullableNumber(test.max_score)]);
  }
}

exports.overview = async (req, res) => {
  try {
    const [opportunities, resources] = await Promise.all([
      pool.query(`SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE is_active)::int AS active,
        COUNT(*) FILTER (WHERE NOT is_verified)::int AS unverified,
        COUNT(*) FILTER (WHERE deadline < CURRENT_DATE)::int AS expired FROM opportunities`),
      pool.query('SELECT COUNT(*)::int AS total FROM learning_resources')
    ]);
    res.json({ success: true, opportunities: opportunities.rows[0], resources: resources.rows[0].total });
  } catch (error) { console.error('Admin overview:', error); res.status(500).json({ success: false, message: 'Could not load dashboard overview' }); }
};

exports.listSubtypes = async (req, res) => {
  try {
    const result = await pool.query('SELECT subtype_id,category,subtype_name,description FROM opportunity_subtypes WHERE is_active=true ORDER BY category,subtype_name');
    res.json({ success: true, data: result.rows });
  } catch (error) { console.error('Admin subtypes:', error); res.status(500).json({ success: false, message: 'Could not load opportunity types' }); }
};

exports.list = async (req, res) => {
  try {
    const result = await pool.query(`${OPPORTUNITY_SELECT} ORDER BY o.created_at DESC, o.opportunity_id DESC`);
    res.json({ success: true, data: result.rows });
  } catch (error) { console.error('Admin opportunities:', error); res.status(500).json({ success: false, message: 'Failed to load opportunities' }); }
};

exports.create = async (req, res) => {
  const b = req.body || {};
  if (!String(b.title || '').trim()) return res.status(400).json({ success: false, message: 'Title is required' });
  if (!b.subtype_id) return res.status(400).json({ success: false, message: 'Choose an opportunity subtype' });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const subtype = await client.query('SELECT category FROM opportunity_subtypes WHERE subtype_id=$1 AND is_active=true', [b.subtype_id]);
    if (!subtype.rowCount) throw Object.assign(new Error('Selected subtype is not available'), { status: 400 });
    const result = await client.query(`INSERT INTO opportunities
      (title,provider,description,category,deadline,application_url,min_age,max_age,min_academic_percent,created_by,subtype_id,is_verified,is_active,opportunity_purpose)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING opportunity_id`,
      [String(b.title).trim(), b.provider || null, b.description || null, subtype.rows[0].category === 'SCHOLARSHIP' ? 'Scholarship' : 'Program',
        b.deadline || null, b.application_url || null, nullableNumber(b.min_age), nullableNumber(b.max_age), nullableNumber(b.min_academic_percent),
        req.user.user_id, b.subtype_id, Boolean(b.is_verified), b.is_active !== false, b.opportunity_purpose || null]);
    const id = result.rows[0].opportunity_id;
    await replaceList(client, 'opportunity_countries', 'country_name', id, b.countries);
    await replaceList(client, 'opportunity_destinations', 'country_name', id, b.destinations);
    await replaceList(client, 'opportunity_fields', 'field_name', id, b.fields);
    await replaceList(client, 'opportunity_education_levels', 'education_level', id, b.education_levels);
    await replaceTests(client, id, b.test_requirements);
    await client.query('COMMIT');
    const saved = await pool.query(`${OPPORTUNITY_SELECT} WHERE o.opportunity_id=$1`, [id]);
    res.status(201).json({ success: true, data: saved.rows[0] });
  } catch (error) { await client.query('ROLLBACK'); console.error('Create opportunity:', error); res.status(error.status || 500).json({ success: false, message: error.status ? error.message : 'Failed to create opportunity' }); }
  finally { client.release(); }
};

exports.update = async (req, res) => {
  const id = req.params.id, b = req.body || {};
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    if (b.subtype_id) {
      const subtype = await client.query('SELECT category FROM opportunity_subtypes WHERE subtype_id=$1 AND is_active=true', [b.subtype_id]);
      if (!subtype.rowCount) throw Object.assign(new Error('Selected subtype is not available'), { status: 400 });
      await client.query(`UPDATE opportunities SET title=$1,provider=$2,description=$3,category=$4,deadline=$5,application_url=$6,
        min_age=$7,max_age=$8,min_academic_percent=$9,subtype_id=$10,is_verified=$11,is_active=$12,opportunity_purpose=$13,updated_at=NOW()
        WHERE opportunity_id=$14`, [String(b.title || '').trim(), b.provider || null, b.description || null,
        subtype.rows[0].category === 'SCHOLARSHIP' ? 'Scholarship' : 'Program', b.deadline || null, b.application_url || null,
        nullableNumber(b.min_age), nullableNumber(b.max_age), nullableNumber(b.min_academic_percent), b.subtype_id,
        Boolean(b.is_verified), b.is_active !== false, b.opportunity_purpose || null, id]);
    } else {
      throw Object.assign(new Error('Choose an opportunity subtype'), { status: 400 });
    }
    const exists = await client.query('SELECT opportunity_id FROM opportunities WHERE opportunity_id=$1', [id]);
    if (!exists.rowCount) throw Object.assign(new Error('Opportunity not found'), { status: 404 });
    await replaceList(client, 'opportunity_countries', 'country_name', id, b.countries);
    await replaceList(client, 'opportunity_destinations', 'country_name', id, b.destinations);
    await replaceList(client, 'opportunity_fields', 'field_name', id, b.fields);
    await replaceList(client, 'opportunity_education_levels', 'education_level', id, b.education_levels);
    await replaceTests(client, id, b.test_requirements);
    await client.query('COMMIT');
    const saved = await pool.query(`${OPPORTUNITY_SELECT} WHERE o.opportunity_id=$1`, [id]);
    res.json({ success: true, data: saved.rows[0] });
  } catch (error) { await client.query('ROLLBACK'); console.error('Update opportunity:', error); res.status(error.status || 500).json({ success: false, message: error.status ? error.message : 'Failed to update opportunity' }); }
  finally { client.release(); }
};

exports.remove = async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM opportunities WHERE opportunity_id=$1 RETURNING opportunity_id', [req.params.id]);
    if (!result.rowCount) return res.status(404).json({ success: false, message: 'Opportunity not found' });
    res.json({ success: true });
  } catch (error) { console.error('Delete opportunity:', error); res.status(500).json({ success: false, message: 'Could not delete opportunity. It may be referenced by another record.' }); }
};

exports.setStatus = async (req, res) => {
  try {
    const result = await pool.query('UPDATE opportunities SET is_active=$1,updated_at=NOW() WHERE opportunity_id=$2 RETURNING opportunity_id,is_active', [Boolean(req.body.is_active), req.params.id]);
    if (!result.rowCount) return res.status(404).json({ success: false, message: 'Opportunity not found' });
    res.json({ success: true, data: result.rows[0] });
  } catch (error) { console.error('Opportunity status:', error); res.status(500).json({ success: false, message: 'Could not update opportunity status' }); }
};

exports.listLearningOptions = async (req, res) => {
  try {
    const [levels, topics, lessons] = await Promise.all([
      pool.query('SELECT level_id,title FROM learning_levels ORDER BY display_order,level_id'),
      pool.query('SELECT topic_id,level_id,title FROM learning_topics ORDER BY display_order,topic_id'),
      pool.query(`SELECT l.lesson_id,l.title AS lesson_title,t.title AS topic_title,v.title AS level_title
        FROM learning_lessons l JOIN learning_topics t ON t.topic_id=l.topic_id JOIN learning_levels v ON v.level_id=t.level_id
        ORDER BY v.display_order,t.display_order,l.display_order,l.lesson_id`)
    ]);
    res.json({ success: true, levels: levels.rows, topics: topics.rows, lessons: lessons.rows });
  } catch (error) { console.error('Learning options:', error); res.status(500).json({ success: false, message: 'Could not load lessons' }); }
};

exports.listResources = async (req, res) => {
  try {
    const result = await pool.query(`SELECT r.*,l.title AS lesson_title,t.title AS topic_title,v.title AS level_title
      FROM learning_resources r JOIN learning_lessons l ON l.lesson_id=r.lesson_id
      JOIN learning_topics t ON t.topic_id=l.topic_id JOIN learning_levels v ON v.level_id=t.level_id
      ORDER BY v.display_order,t.display_order,l.display_order,r.display_order,r.resource_id`);
    res.json({ success: true, data: result.rows });
  } catch (error) { console.error('Learning resources:', error); res.status(500).json({ success: false, message: 'Could not load learning resources' }); }
};

exports.createResource = async (req, res) => {
  const b = req.body || {};
  if (!b.lesson_id || !String(b.title || '').trim() || !String(b.url || '').trim() || !b.resource_type)
    return res.status(400).json({ success: false, message: 'Lesson, title, resource type and URL are required' });
  try {
    const result = await pool.query(`INSERT INTO learning_resources(lesson_id,title,resource_type,url,description,is_free,display_order)
      VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *`, [b.lesson_id, String(b.title).trim(), b.resource_type, String(b.url).trim(), b.description || null, b.is_free !== false, Number(b.display_order) || 1]);
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) { console.error('Create learning resource:', error); res.status(500).json({ success: false, message: 'Could not create resource. Check the selected lesson and resource type.' }); }
};

exports.updateResource = async (req, res) => {
  const b = req.body || {};
  if (!b.lesson_id || !String(b.title || '').trim() || !String(b.url || '').trim() || !b.resource_type)
    return res.status(400).json({ success: false, message: 'Lesson, title, resource type and URL are required' });
  try {
    const result = await pool.query(`UPDATE learning_resources SET lesson_id=$1,title=$2,resource_type=$3,url=$4,description=$5,is_free=$6,display_order=$7
      WHERE resource_id=$8 RETURNING *`, [b.lesson_id, String(b.title).trim(), b.resource_type, String(b.url).trim(), b.description || null, b.is_free !== false, Number(b.display_order) || 1, req.params.id]);
    if (!result.rowCount) return res.status(404).json({ success: false, message: 'Resource not found' });
    res.json({ success: true, data: result.rows[0] });
  } catch (error) { console.error('Update learning resource:', error); res.status(500).json({ success: false, message: 'Could not update resource' }); }
};

exports.removeResource = async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM learning_resources WHERE resource_id=$1 RETURNING resource_id', [req.params.id]);
    if (!result.rowCount) return res.status(404).json({ success: false, message: 'Resource not found' });
    res.json({ success: true });
  } catch (error) { console.error('Delete learning resource:', error); res.status(500).json({ success: false, message: 'Could not delete resource' }); }
};
