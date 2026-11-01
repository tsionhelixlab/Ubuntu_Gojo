
const pool = require('../config/db');

const sections = [
  'academic',
  'extracurriculars',
  'essays',
  'tests',
  'requirements',
  'documents'
];

const statuses = ['not_started', 'in_progress', 'completed'];

const isNumericId = value => /^[1-9]\d*$/.test(String(value));

const isUuid = value =>
  typeof value === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

const fail = (res, message, code = 400) =>
  res.status(code).json({ success: false, message });

const handleError = (res, error) => {
  console.error('Preparation database error:', error.message);

  if (error.code === '23503') {
    return fail(res, 'Referenced record does not exist');
  }

  if (error.code === '23505') {
    return fail(res, 'A workspace already exists for this opportunity', 409);
  }

  if (['23514', '23502', '22007', '22P02'].includes(error.code)) {
    return fail(res, 'Invalid or missing field value');
  }

  return fail(res, 'Preparation request failed', 500);
};

const wrap = fn => async (req, res) => {
  try {
    await fn(req, res);
  } catch (error) {
    handleError(res, error);
  }
};

const validText = (value, max = 250) =>
  typeof value === 'string' &&
  value.trim().length > 0 &&
  value.trim().length <= max;

const optionalText = (value, max = 10000) =>
  value === undefined ||
  value === null ||
  (typeof value === 'string' && value.length <= max);

const validDate = value =>
  value === undefined ||
  value === null ||
  (
    typeof value === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(Date.parse(`${value}T00:00:00Z`)) &&
    new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value
  );

// Check ownership of a workspace.
const ownsWorkspace = async (workspaceId, userId) => {
  if (!isNumericId(workspaceId)) return false;

  const result = await pool.query(
    `SELECT workspace_id
     FROM preparation_workspaces
     WHERE workspace_id = $1 AND user_id = $2`,
    [workspaceId, userId]
  );

  return result.rowCount > 0;
};

// --------------------------------------------------
// PREPARATION SECTIONS
// --------------------------------------------------

const sectionDetails = [
  ['academic', 'Academic & Transcript', 'Academic improvement, transcripts and study plans'],
  ['extracurriculars', 'Extracurriculars', 'Activities, leadership and opportunity preparation'],
  ['essays', 'Essay Studio', 'Essay guidance, drafts and revisions'],
  ['tests', 'Test Preparation', 'Test information, practice and study plans'],
  ['requirements', 'Other Requirements', 'Financial aid, CV and recommendations'],
  ['documents', 'Document Center', 'Organize important application documents']
];

exports.getSections = (req, res) => {
  res.json({
    success: true,
    sections: sectionDetails.map(([id, title, description]) => ({
      id,
      title,
      description
    }))
  });
};

exports.getWorkspaces = (req, res) => {
  const section = req.params.section;

  if (!sections.includes(section)) {
    return fail(res, 'Preparation section not found', 404);
  }

  res.json({
    success: true,
    section,
    message: 'Open this section inside a selected preparation workspace'
  });
};

// --------------------------------------------------
// WORKSPACES
// --------------------------------------------------

exports.getMyWorkspaces = wrap(async (req, res) => {
  const result = await pool.query(
    `SELECT
       w.workspace_id,
       w.user_id,
       w.opportunity_id,
       o.title AS opportunity_title,
       w.title,
       w.description,
       w.status,
       w.created_at,
       w.updated_at
     FROM preparation_workspaces w
     JOIN opportunities o
       ON o.opportunity_id = w.opportunity_id
     WHERE w.user_id = $1
     ORDER BY w.created_at DESC`,
    [req.user.user_id]
  );

  res.json({
    success: true,
    workspaces: result.rows
  });
});

exports.createWorkspace = wrap(async (req, res) => {
  const {
    opportunity_id,
    title,
    description = null
  } = req.body || {};

  if (
    !isUuid(opportunity_id) ||
    !validText(title) ||
    !optionalText(description)
  ) {
    return fail(res, 'A valid opportunity ID and title are required');
  }

  const existing = await pool.query(
    `SELECT workspace_id
     FROM preparation_workspaces
     WHERE user_id = $1 AND opportunity_id = $2`,
    [req.user.user_id, opportunity_id]
  );

  if (existing.rowCount) {
    return fail(res, 'You already have a workspace for this opportunity', 409);
  }

  const result = await pool.query(
    `INSERT INTO preparation_workspaces
       (user_id, opportunity_id, title, description)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [
      req.user.user_id,
      opportunity_id,
      title.trim(),
      description
    ]
  );

  res.status(201).json({
    success: true,
    workspace: result.rows[0]
  });
});

exports.updateWorkspace = wrap(async (req, res) => {
  const { title, description, status } = req.body || {};

  if (!isNumericId(req.params.id)) {
    return fail(res, 'Workspace not found', 404);
  }

  if (
    title === undefined &&
    description === undefined &&
    status === undefined
  ) {
    return fail(res, 'No fields to update');
  }

  if (
    (title !== undefined && !validText(title)) ||
    !optionalText(description) ||
    (status !== undefined && !statuses.includes(status))
  ) {
    return fail(res, 'Invalid workspace fields');
  }

  const current = await pool.query(
    `SELECT workspace_id
     FROM preparation_workspaces
     WHERE workspace_id = $1 AND user_id = $2`,
    [req.params.id, req.user.user_id]
  );

  if (!current.rowCount) {
    return fail(res, 'Workspace not found', 404);
  }

  const result = await pool.query(
    `UPDATE preparation_workspaces
     SET
       title = COALESCE($1, title),
       description = CASE WHEN $2 THEN $3 ELSE description END,
       status = COALESCE($4, status),
       updated_at = NOW()
     WHERE workspace_id = $5 AND user_id = $6
     RETURNING *`,
    [
      title?.trim() ?? null,
      description !== undefined,
      description ?? null,
      status ?? null,
      req.params.id,
      req.user.user_id
    ]
  );

  res.json({
    success: true,
    workspace: result.rows[0]
  });
});

exports.deleteWorkspace = wrap(async (req, res) => {
  if (!isNumericId(req.params.id)) {
    return fail(res, 'Workspace not found', 404);
  }

  const result = await pool.query(
    `DELETE FROM preparation_workspaces
     WHERE workspace_id = $1 AND user_id = $2
     RETURNING workspace_id`,
    [req.params.id, req.user.user_id]
  );

  if (!result.rowCount) {
    return fail(res, 'Workspace not found', 404);
  }

  res.json({
    success: true,
    message: 'Workspace and its associated preparation records were deleted'
  });
});

// --------------------------------------------------
// TASKS, ESSAY DRAFTS AND STUDY PLANS
// --------------------------------------------------

const definitions = {
  tasks: {
    table: 'preparation_tasks',
    primaryKey: 'task_id',
    required: ['section', 'title'],
    allowed: ['section', 'title', 'description', 'priority', 'status', 'due_date'],
    enums: {
      section: sections,
      priority: ['low', 'medium', 'high'],
      status: statuses
    },
    strings: {
      title: 250,
      description: 10000
    },
    dates: ['due_date']
  },

  drafts: {
    table: 'preparation_essay_drafts',
    primaryKey: 'draft_id',
    required: ['title'],
    allowed: ['title', 'essay_type', 'prompt', 'content', 'status'],
    enums: {
      status: ['draft', 'revising', 'final']
    },
    strings: {
      title: 250,
      essay_type: 80,
      prompt: 10000,
      content: 100000
    },
    dates: []
  },

  plans: {
    table: 'preparation_study_plans',
    primaryKey: 'plan_id',
    required: ['subject', 'goal'],
    allowed: [
      'section',
      'subject',
      'goal',
      'study_strategy',
      'start_date',
      'target_date',
      'status',
      'progress_notes'
    ],
    enums: {
      section: ['academic', 'tests'],
      status: statuses
    },
    strings: {
      subject: 160,
      goal: 10000,
      study_strategy: 10000,
      progress_notes: 10000
    },
    dates: ['start_date', 'target_date']
  }
};

const singular = {
  tasks: 'task',
  drafts: 'draft',
  plans: 'plan'
};

const validateChild = (definition, body, creating) => {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return 'JSON object required';
  }

  const keys = Object.keys(body);

  if (!keys.length || keys.some(key => !definition.allowed.includes(key))) {
    return 'Unknown or missing fields';
  }

  if (
    creating &&
    definition.required.some(key => !validText(body[key], definition.strings[key]))
  ) {
    return 'Missing required fields';
  }

  for (const [key, value] of Object.entries(body)) {
    if (definition.enums[key] && !definition.enums[key].includes(value)) {
      return `Invalid ${key}`;
    }

    if (
      definition.strings[key] &&
      (
        typeof value !== 'string' ||
        value.length > definition.strings[key] ||
        (definition.required.includes(key) && !value.trim())
      )
    ) {
      return `Invalid ${key}`;
    }

    if (definition.dates.includes(key) && !validDate(value)) {
      return `Invalid ${key} date`;
    }
  }

  return null;
};

exports.listChildren = kind => wrap(async (req, res) => {
  const definition = definitions[kind];

  if (!definition) return fail(res, 'Invalid record type');

  if (!await ownsWorkspace(req.params.workspaceId, req.user.user_id)) {
    return fail(res, 'Workspace not found', 404);
  }

  const result = await pool.query(
    `SELECT *
     FROM ${definition.table}
     WHERE workspace_id = $1
     ORDER BY created_at DESC, ${definition.primaryKey} DESC`,
    [req.params.workspaceId]
  );

  res.json({
    success: true,
    [kind]: result.rows
  });
});

exports.createChild = kind => wrap(async (req, res) => {
  const definition = definitions[kind];

  if (!definition) return fail(res, 'Invalid record type');

  if (!await ownsWorkspace(req.params.workspaceId, req.user.user_id)) {
    return fail(res, 'Workspace not found', 404);
  }

  const issue = validateChild(definition, req.body, true);
  if (issue) return fail(res, issue);

  const keys = Object.keys(req.body);
  const columns = ['workspace_id', ...keys];
  const values = [req.params.workspaceId, ...keys.map(key => req.body[key])];

  const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');

  const result = await pool.query(
    `INSERT INTO ${definition.table} (${columns.join(', ')})
     VALUES (${placeholders})
     RETURNING *`,
    values
  );

  res.status(201).json({
    success: true,
    [singular[kind]]: result.rows[0]
  });
});

exports.updateChild = kind => wrap(async (req, res) => {
  const definition = definitions[kind];

  if (!definition || !isNumericId(req.params.id)) {
    return fail(res, 'Record not found', 404);
  }

  const issue = validateChild(definition, req.body, false);
  if (issue) return fail(res, issue);

  const keys = Object.keys(req.body);
  const values = keys.map(key => req.body[key]);

  const sets = keys.map((key, i) => `${key} = $${i + 1}`);

  if (
    kind === 'tasks' &&
    Object.prototype.hasOwnProperty.call(req.body, 'status')
  ) {
    sets.push(
      `completed_at = ${
        req.body.status === 'completed' ? 'NOW()' : 'NULL'
      }`
    );
  }

  sets.push('updated_at = NOW()');

  const result = await pool.query(
    `UPDATE ${definition.table}
     SET ${sets.join(', ')}
     WHERE ${definition.primaryKey} = $${keys.length + 1}
       AND workspace_id IN (
         SELECT workspace_id
         FROM preparation_workspaces
         WHERE user_id = $${keys.length + 2}
       )
     RETURNING *`,
    [...values, req.params.id, req.user.user_id]
  );

  if (!result.rowCount) return fail(res, 'Record not found', 404);

  res.json({
    success: true,
    [singular[kind]]: result.rows[0]
  });
});

exports.deleteChild = kind => wrap(async (req, res) => {
  const definition = definitions[kind];

  if (!definition || !isNumericId(req.params.id)) {
    return fail(res, 'Record not found', 404);
  }

  const result = await pool.query(
    `DELETE FROM ${definition.table}
     WHERE ${definition.primaryKey} = $1
       AND workspace_id IN (
         SELECT workspace_id
         FROM preparation_workspaces
         WHERE user_id = $2
       )
     RETURNING ${definition.primaryKey}`,
    [req.params.id, req.user.user_id]
  );

  if (!result.rowCount) return fail(res, 'Record not found', 404);

  res.json({
    success: true,
    message: 'Record deleted'
  });
});

// --------------------------------------------------
// PREPARATION RESOURCES
// --------------------------------------------------

exports.listResources = wrap(async (req, res) => {
  const { section, workspace_id } = req.query;

  if (section && !sections.includes(section)) {
    return fail(res, 'Invalid section');
  }

  if (
    workspace_id &&
    !await ownsWorkspace(workspace_id, req.user.user_id)
  ) {
    return fail(res, 'Workspace not found', 404);
  }

  const result = await pool.query(
    `SELECT
       resource_id,
       section,
       workspace_id,
       title,
       description,
       resource_type,
       content,
       resource_url,
       is_free,
       created_at
     FROM preparation_resources
     WHERE ($1::text IS NULL OR section = $1)
       AND (
         workspace_id IS NULL
         OR workspace_id IN (
           SELECT workspace_id
           FROM preparation_workspaces
           WHERE user_id = $2
         )
       )
       AND ($3::bigint IS NULL OR workspace_id IS NULL OR workspace_id = $3)
     ORDER BY created_at DESC, resource_id DESC`,
    [section || null, req.user.user_id, workspace_id || null]
  );

  res.json({
    success: true,
    resources: result.rows
  });
});
