
-- =====================================================
-- UBUNTU GOJO - COMPLETE PREPARATION MODULE
-- Database: scholarship_db
-- Sections:
-- Academic, Extracurriculars, Essays, Tests,
-- Requirements, Documents
-- =====================================================

BEGIN;

-- =====================================================
-- 1. PREPARATION WORKSPACES
-- One workspace per student per opportunity
-- =====================================================

CREATE TABLE IF NOT EXISTS preparation_workspaces (
    workspace_id BIGSERIAL PRIMARY KEY,

    user_id UUID NOT NULL
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    opportunity_id UUID NOT NULL
        REFERENCES opportunities(opportunity_id)
        ON DELETE CASCADE,

    title VARCHAR(250) NOT NULL,

    description TEXT,

    status VARCHAR(30) NOT NULL DEFAULT 'not_started'
        CHECK (
            status IN (
                'not_started',
                'in_progress',
                'completed'
            )
        ),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT unique_student_opportunity_workspace
        UNIQUE (user_id, opportunity_id)
);

CREATE INDEX IF NOT EXISTS idx_preparation_workspaces_user
ON preparation_workspaces(user_id);

CREATE INDEX IF NOT EXISTS idx_preparation_workspaces_opportunity
ON preparation_workspaces(opportunity_id);


-- =====================================================
-- 2. PREPARATION TASKS
-- Tasks can belong to any of the six sections
-- =====================================================

CREATE TABLE IF NOT EXISTS preparation_tasks (
    task_id BIGSERIAL PRIMARY KEY,

    workspace_id BIGINT NOT NULL
        REFERENCES preparation_workspaces(workspace_id)
        ON DELETE CASCADE,

    section VARCHAR(40) NOT NULL
        CHECK (
            section IN (
                'academic',
                'extracurriculars',
                'essays',
                'tests',
                'requirements',
                'documents'
            )
        ),

    title VARCHAR(250) NOT NULL,

    description TEXT,

    priority VARCHAR(20) NOT NULL DEFAULT 'medium'
        CHECK (
            priority IN ('low', 'medium', 'high')
        ),

    status VARCHAR(30) NOT NULL DEFAULT 'not_started'
        CHECK (
            status IN (
                'not_started',
                'in_progress',
                'completed'
            )
        ),

    due_date DATE,

    completed_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_preparation_tasks_workspace
ON preparation_tasks(workspace_id);

CREATE INDEX IF NOT EXISTS idx_preparation_tasks_section
ON preparation_tasks(section);


-- =====================================================
-- 3. ESSAY DRAFTS
-- =====================================================

CREATE TABLE IF NOT EXISTS preparation_essay_drafts (
    draft_id BIGSERIAL PRIMARY KEY,

    workspace_id BIGINT NOT NULL
        REFERENCES preparation_workspaces(workspace_id)
        ON DELETE CASCADE,

    title VARCHAR(250) NOT NULL,

    essay_type VARCHAR(80) NOT NULL DEFAULT 'other',

    prompt TEXT,

    content TEXT NOT NULL DEFAULT '',

    status VARCHAR(30) NOT NULL DEFAULT 'draft'
        CHECK (
            status IN ('draft', 'revising', 'final')
        ),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_preparation_essay_drafts_workspace
ON preparation_essay_drafts(workspace_id);


-- =====================================================
-- 4. STUDY PLANS
-- Supports Academic and Tests sections
-- =====================================================

CREATE TABLE IF NOT EXISTS preparation_study_plans (
    plan_id BIGSERIAL PRIMARY KEY,

    workspace_id BIGINT NOT NULL
        REFERENCES preparation_workspaces(workspace_id)
        ON DELETE CASCADE,

    section VARCHAR(40) NOT NULL DEFAULT 'academic'
        CHECK (
            section IN ('academic', 'tests')
        ),

    subject VARCHAR(160) NOT NULL,

    goal TEXT NOT NULL,

    study_strategy TEXT,

    start_date DATE,

    target_date DATE,

    status VARCHAR(30) NOT NULL DEFAULT 'not_started'
        CHECK (
            status IN (
                'not_started',
                'in_progress',
                'completed'
            )
        ),

    progress_notes TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT valid_study_plan_dates
        CHECK (
            start_date IS NULL
            OR target_date IS NULL
            OR target_date >= start_date
        )
);

CREATE INDEX IF NOT EXISTS idx_preparation_study_plans_workspace
ON preparation_study_plans(workspace_id);


-- =====================================================
-- 5. PREPARATION RESOURCES
-- Resources can be shared or workspace-specific
-- =====================================================

CREATE TABLE IF NOT EXISTS preparation_resources (
    resource_id BIGSERIAL PRIMARY KEY,

    section VARCHAR(40) NOT NULL
        CHECK (
            section IN (
                'academic',
                'extracurriculars',
                'essays',
                'tests',
                'requirements',
                'documents'
            )
        ),

    workspace_id BIGINT
        REFERENCES preparation_workspaces(workspace_id)
        ON DELETE CASCADE,

    title VARCHAR(250) NOT NULL,

    description TEXT,

    resource_type VARCHAR(30) NOT NULL
        CHECK (
            resource_type IN (
                'article',
                'video',
                'guide',
                'sample',
                'practice',
                'website'
            )
        ),

    content TEXT,

    resource_url TEXT,

    is_free BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_preparation_resources_section
ON preparation_resources(section);

CREATE INDEX IF NOT EXISTS idx_preparation_resources_workspace
ON preparation_resources(workspace_id);


-- =====================================================
-- FINISH
-- =====================================================

COMMIT;
