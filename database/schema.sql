
DROP TABLE IF EXISTS opportunity_test_requirements, opportunity_fields, opportunity_countries, opportunity_education_levels,
  student_tests, student_goals, student_documents, opportunities, student_profiles, users CASCADE;

CREATE TABLE users (
  user_id BIGSERIAL PRIMARY KEY,
  first_name VARCHAR(80) NOT NULL,
  last_name VARCHAR(80) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'student' CHECK (role IN ('student','admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE student_profiles (
  profile_id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
  phone VARCHAR(40),
  school_name VARCHAR(200),
  education_level VARCHAR(80),
  field_of_study VARCHAR(160),
  academic_score NUMERIC(8,3),
  academic_scale VARCHAR(30) CHECK (academic_scale IN ('percentage','gpa_4','gpa_5','gpa_10') OR academic_scale IS NULL),
  academic_percent_equivalent NUMERIC(6,3),
  conversion_source_url TEXT,
  expected_graduation_year INTEGER CHECK (expected_graduation_year IS NULL OR expected_graduation_year BETWEEN 2000 AND 2100),
  citizenship VARCHAR(100),
  date_of_birth DATE,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE student_tests (
  test_id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  test_type VARCHAR(60) NOT NULL,
  score NUMERIC(10,3),
  max_score NUMERIC(10,3),
  score_text VARCHAR(100)
);

CREATE TABLE student_goals (
  goal_id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  target_degree VARCHAR(100),
  target_field VARCHAR(160),
  target_countries TEXT[] NOT NULL DEFAULT '{}',
  target_universities TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE student_documents (
  document_id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  document_type VARCHAR(80),
  file_name VARCHAR(255) NOT NULL,
  file_path TEXT,
  status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','verified','rejected')),
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE opportunities (
  opportunity_id BIGSERIAL PRIMARY KEY,
  title VARCHAR(250) NOT NULL,
  provider VARCHAR(200),
  description TEXT,
  category VARCHAR(80) NOT NULL DEFAULT 'Scholarship',
  deadline DATE,
  application_url TEXT,
  min_age INTEGER,
  max_age INTEGER,
  min_academic_percent NUMERIC(6,3),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by BIGINT REFERENCES users(user_id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE opportunity_countries (
  opportunity_id BIGINT NOT NULL REFERENCES opportunities(opportunity_id) ON DELETE CASCADE,
  country_name VARCHAR(120) NOT NULL,
  PRIMARY KEY(opportunity_id,country_name)
);

CREATE TABLE opportunity_fields (
  opportunity_id BIGINT NOT NULL REFERENCES opportunities(opportunity_id) ON DELETE CASCADE,
  field_name VARCHAR(160) NOT NULL,
  PRIMARY KEY(opportunity_id,field_name)
);

CREATE TABLE opportunity_education_levels (
  opportunity_id BIGINT NOT NULL REFERENCES opportunities(opportunity_id) ON DELETE CASCADE,
  education_level VARCHAR(80) NOT NULL,
  PRIMARY KEY(opportunity_id,education_level)
);

CREATE TABLE opportunity_test_requirements (
  requirement_id BIGSERIAL PRIMARY KEY,
  opportunity_id BIGINT NOT NULL REFERENCES opportunities(opportunity_id) ON DELETE CASCADE,
  test_type VARCHAR(60) NOT NULL,
  min_score NUMERIC(10,3) NOT NULL,
  max_score NUMERIC(10,3)
);

CREATE INDEX idx_profiles_user ON student_profiles(user_id);
CREATE INDEX idx_tests_user ON student_tests(user_id);
CREATE INDEX idx_goals_user ON student_goals(user_id);
CREATE INDEX idx_opportunities_active ON opportunities(is_active);
CREATE INDEX idx_opportunity_countries_country ON opportunity_countries(country_name);

-- Useful for local development only. It creates no fake users or passwords.
