--
-- PostgreSQL database dump
--

\restrict TYdDSb9f2UWbKeOzCxHICUPhnAVrqJp6TwpM0YyGOFZCjhhgzLdmAFIbAesdPKv

-- Dumped from database version 18.6
-- Dumped by pg_dump version 18.6

-- Started on 2026-10-31 14:25:26

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 260 (class 1259 OID 17064)
-- Name: learning_activities; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.learning_activities (
    activity_id bigint NOT NULL,
    lesson_id bigint NOT NULL,
    title character varying(250) NOT NULL,
    instructions text NOT NULL,
    activity_type character varying(30) NOT NULL,
    estimated_minutes integer,
    display_order integer DEFAULT 1 NOT NULL,
    CONSTRAINT learning_activities_activity_type_check CHECK (((activity_type)::text = ANY ((ARRAY['reflection'::character varying, 'writing'::character varying, 'research'::character varying, 'checklist'::character varying, 'project'::character varying, 'practice'::character varying])::text[]))),
    CONSTRAINT learning_activities_estimated_minutes_check CHECK (((estimated_minutes IS NULL) OR (estimated_minutes > 0)))
);


ALTER TABLE public.learning_activities OWNER TO postgres;

--
-- TOC entry 259 (class 1259 OID 17063)
-- Name: learning_activities_activity_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.learning_activities_activity_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.learning_activities_activity_id_seq OWNER TO postgres;

--
-- TOC entry 5313 (class 0 OID 0)
-- Dependencies: 259
-- Name: learning_activities_activity_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.learning_activities_activity_id_seq OWNED BY public.learning_activities.activity_id;


--
-- TOC entry 262 (class 1259 OID 17089)
-- Name: learning_activity_submissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.learning_activity_submissions (
    submission_id bigint NOT NULL,
    activity_id bigint NOT NULL,
    user_id bigint NOT NULL,
    response_text text,
    status character varying(20) DEFAULT 'in_progress'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT learning_activity_submissions_status_check CHECK (((status)::text = ANY ((ARRAY['in_progress'::character varying, 'submitted'::character varying])::text[])))
);


ALTER TABLE public.learning_activity_submissions OWNER TO postgres;

--
-- TOC entry 261 (class 1259 OID 17088)
-- Name: learning_activity_submissions_submission_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.learning_activity_submissions_submission_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.learning_activity_submissions_submission_id_seq OWNER TO postgres;

--
-- TOC entry 5314 (class 0 OID 0)
-- Dependencies: 261
-- Name: learning_activity_submissions_submission_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.learning_activity_submissions_submission_id_seq OWNED BY public.learning_activity_submissions.submission_id;


--
-- TOC entry 252 (class 1259 OID 16964)
-- Name: learning_answer_options; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.learning_answer_options (
    option_id bigint NOT NULL,
    question_id bigint NOT NULL,
    option_text text NOT NULL,
    is_correct boolean DEFAULT false NOT NULL
);


ALTER TABLE public.learning_answer_options OWNER TO postgres;

--
-- TOC entry 251 (class 1259 OID 16963)
-- Name: learning_answer_options_option_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.learning_answer_options_option_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.learning_answer_options_option_id_seq OWNER TO postgres;

--
-- TOC entry 5315 (class 0 OID 0)
-- Dependencies: 251
-- Name: learning_answer_options_option_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.learning_answer_options_option_id_seq OWNED BY public.learning_answer_options.option_id;


--
-- TOC entry 256 (class 1259 OID 17001)
-- Name: learning_assessment_answers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.learning_assessment_answers (
    answer_id bigint NOT NULL,
    assessment_id bigint NOT NULL,
    question_id bigint NOT NULL,
    option_id bigint NOT NULL
);


ALTER TABLE public.learning_assessment_answers OWNER TO postgres;

--
-- TOC entry 255 (class 1259 OID 17000)
-- Name: learning_assessment_answers_answer_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.learning_assessment_answers_answer_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.learning_assessment_answers_answer_id_seq OWNER TO postgres;

--
-- TOC entry 5316 (class 0 OID 0)
-- Dependencies: 255
-- Name: learning_assessment_answers_answer_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.learning_assessment_answers_answer_id_seq OWNED BY public.learning_assessment_answers.answer_id;


--
-- TOC entry 254 (class 1259 OID 16983)
-- Name: learning_assessments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.learning_assessments (
    assessment_id bigint NOT NULL,
    user_id bigint NOT NULL,
    assessment_type character varying(30) NOT NULL,
    score numeric(5,2),
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    completed_at timestamp with time zone,
    CONSTRAINT learning_assessments_assessment_type_check CHECK (((assessment_type)::text = ANY ((ARRAY['initial'::character varying, 'lesson'::character varying, 'level'::character varying, 'final'::character varying])::text[])))
);


ALTER TABLE public.learning_assessments OWNER TO postgres;

--
-- TOC entry 253 (class 1259 OID 16982)
-- Name: learning_assessments_assessment_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.learning_assessments_assessment_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.learning_assessments_assessment_id_seq OWNER TO postgres;

--
-- TOC entry 5317 (class 0 OID 0)
-- Dependencies: 253
-- Name: learning_assessments_assessment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.learning_assessments_assessment_id_seq OWNED BY public.learning_assessments.assessment_id;


--
-- TOC entry 264 (class 1259 OID 17120)
-- Name: learning_image_hotspots; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.learning_image_hotspots (
    hotspot_id bigint NOT NULL,
    resource_id bigint NOT NULL,
    label character varying(150) NOT NULL,
    explanation text NOT NULL,
    x_percent numeric(5,2) NOT NULL,
    y_percent numeric(5,2) NOT NULL,
    display_order integer DEFAULT 1 NOT NULL,
    CONSTRAINT learning_image_hotspots_x_percent_check CHECK (((x_percent >= (0)::numeric) AND (x_percent <= (100)::numeric))),
    CONSTRAINT learning_image_hotspots_y_percent_check CHECK (((y_percent >= (0)::numeric) AND (y_percent <= (100)::numeric)))
);


ALTER TABLE public.learning_image_hotspots OWNER TO postgres;

--
-- TOC entry 263 (class 1259 OID 17119)
-- Name: learning_image_hotspots_hotspot_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.learning_image_hotspots_hotspot_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.learning_image_hotspots_hotspot_id_seq OWNER TO postgres;

--
-- TOC entry 5318 (class 0 OID 0)
-- Dependencies: 263
-- Name: learning_image_hotspots_hotspot_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.learning_image_hotspots_hotspot_id_seq OWNED BY public.learning_image_hotspots.hotspot_id;


--
-- TOC entry 246 (class 1259 OID 16893)
-- Name: learning_lessons; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.learning_lessons (
    lesson_id bigint NOT NULL,
    topic_id bigint NOT NULL,
    title character varying(200) NOT NULL,
    content text NOT NULL,
    key_points text,
    practical_example text,
    common_mistakes text,
    display_order integer DEFAULT 1 NOT NULL,
    learning_objectives text,
    estimated_minutes integer
);


ALTER TABLE public.learning_lessons OWNER TO postgres;

--
-- TOC entry 245 (class 1259 OID 16892)
-- Name: learning_lessons_lesson_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.learning_lessons_lesson_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.learning_lessons_lesson_id_seq OWNER TO postgres;

--
-- TOC entry 5319 (class 0 OID 0)
-- Dependencies: 245
-- Name: learning_lessons_lesson_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.learning_lessons_lesson_id_seq OWNED BY public.learning_lessons.lesson_id;


--
-- TOC entry 242 (class 1259 OID 16856)
-- Name: learning_levels; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.learning_levels (
    level_id bigint NOT NULL,
    title character varying(100) NOT NULL,
    description text,
    display_order integer NOT NULL
);


ALTER TABLE public.learning_levels OWNER TO postgres;

--
-- TOC entry 241 (class 1259 OID 16855)
-- Name: learning_levels_level_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.learning_levels_level_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.learning_levels_level_id_seq OWNER TO postgres;

--
-- TOC entry 5320 (class 0 OID 0)
-- Dependencies: 241
-- Name: learning_levels_level_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.learning_levels_level_id_seq OWNED BY public.learning_levels.level_id;


--
-- TOC entry 258 (class 1259 OID 17029)
-- Name: learning_progress; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.learning_progress (
    progress_id bigint NOT NULL,
    user_id bigint NOT NULL,
    lesson_id bigint NOT NULL,
    status character varying(20) DEFAULT 'not_started'::character varying NOT NULL,
    completed_at timestamp with time zone,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT learning_progress_status_check CHECK (((status)::text = ANY ((ARRAY['not_started'::character varying, 'in_progress'::character varying, 'completed'::character varying])::text[])))
);


ALTER TABLE public.learning_progress OWNER TO postgres;

--
-- TOC entry 257 (class 1259 OID 17028)
-- Name: learning_progress_progress_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.learning_progress_progress_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.learning_progress_progress_id_seq OWNER TO postgres;

--
-- TOC entry 5321 (class 0 OID 0)
-- Dependencies: 257
-- Name: learning_progress_progress_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.learning_progress_progress_id_seq OWNED BY public.learning_progress.progress_id;


--
-- TOC entry 250 (class 1259 OID 16935)
-- Name: learning_questions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.learning_questions (
    question_id bigint NOT NULL,
    topic_id bigint NOT NULL,
    lesson_id bigint,
    question_text text NOT NULL,
    question_type character varying(30) NOT NULL,
    assessment_type character varying(30) NOT NULL,
    difficulty character varying(20) DEFAULT 'easy'::character varying NOT NULL,
    explanation text,
    CONSTRAINT learning_questions_assessment_type_check CHECK (((assessment_type)::text = ANY ((ARRAY['initial'::character varying, 'lesson'::character varying, 'level'::character varying, 'final'::character varying])::text[]))),
    CONSTRAINT learning_questions_difficulty_check CHECK (((difficulty)::text = ANY ((ARRAY['easy'::character varying, 'medium'::character varying, 'hard'::character varying])::text[]))),
    CONSTRAINT learning_questions_question_type_check CHECK (((question_type)::text = ANY ((ARRAY['single_choice'::character varying, 'multiple_choice'::character varying, 'true_false'::character varying])::text[])))
);


ALTER TABLE public.learning_questions OWNER TO postgres;

--
-- TOC entry 249 (class 1259 OID 16934)
-- Name: learning_questions_question_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.learning_questions_question_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.learning_questions_question_id_seq OWNER TO postgres;

--
-- TOC entry 5322 (class 0 OID 0)
-- Dependencies: 249
-- Name: learning_questions_question_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.learning_questions_question_id_seq OWNED BY public.learning_questions.question_id;


--
-- TOC entry 248 (class 1259 OID 16913)
-- Name: learning_resources; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.learning_resources (
    resource_id bigint NOT NULL,
    lesson_id bigint NOT NULL,
    title character varying(250) NOT NULL,
    resource_type character varying(30) NOT NULL,
    url text NOT NULL,
    description text,
    is_free boolean DEFAULT true NOT NULL,
    display_order integer DEFAULT 1 NOT NULL,
    CONSTRAINT learning_resources_resource_type_check CHECK (((resource_type)::text = ANY ((ARRAY['video'::character varying, 'article'::character varying, 'guide'::character varying, 'template'::character varying, 'website'::character varying, 'image'::character varying, 'pdf'::character varying, 'diagram'::character varying])::text[])))
);


ALTER TABLE public.learning_resources OWNER TO postgres;

--
-- TOC entry 247 (class 1259 OID 16912)
-- Name: learning_resources_resource_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.learning_resources_resource_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.learning_resources_resource_id_seq OWNER TO postgres;

--
-- TOC entry 5323 (class 0 OID 0)
-- Dependencies: 247
-- Name: learning_resources_resource_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.learning_resources_resource_id_seq OWNED BY public.learning_resources.resource_id;


--
-- TOC entry 244 (class 1259 OID 16872)
-- Name: learning_topics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.learning_topics (
    topic_id bigint NOT NULL,
    level_id bigint NOT NULL,
    title character varying(200) NOT NULL,
    description text,
    display_order integer DEFAULT 1 NOT NULL
);


ALTER TABLE public.learning_topics OWNER TO postgres;

--
-- TOC entry 243 (class 1259 OID 16871)
-- Name: learning_topics_topic_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.learning_topics_topic_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.learning_topics_topic_id_seq OWNER TO postgres;

--
-- TOC entry 5324 (class 0 OID 0)
-- Dependencies: 243
-- Name: learning_topics_topic_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.learning_topics_topic_id_seq OWNED BY public.learning_topics.topic_id;


--
-- TOC entry 230 (class 1259 OID 16492)
-- Name: opportunities; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.opportunities (
    opportunity_id bigint NOT NULL,
    title character varying(250) NOT NULL,
    provider character varying(200),
    description text,
    category character varying(80) DEFAULT 'Scholarship'::character varying NOT NULL,
    deadline date,
    application_url text,
    min_age integer,
    max_age integer,
    min_academic_percent numeric(6,3),
    is_active boolean DEFAULT true NOT NULL,
    created_by bigint,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    subtype_id bigint NOT NULL,
    is_verified boolean DEFAULT false NOT NULL,
    opportunity_purpose character varying(40)
);


ALTER TABLE public.opportunities OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 16491)
-- Name: opportunities_opportunity_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.opportunities_opportunity_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.opportunities_opportunity_id_seq OWNER TO postgres;

--
-- TOC entry 5325 (class 0 OID 0)
-- Dependencies: 229
-- Name: opportunities_opportunity_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.opportunities_opportunity_id_seq OWNED BY public.opportunities.opportunity_id;


--
-- TOC entry 231 (class 1259 OID 16515)
-- Name: opportunity_countries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.opportunity_countries (
    opportunity_id bigint NOT NULL,
    country_name character varying(120) NOT NULL
);


ALTER TABLE public.opportunity_countries OWNER TO postgres;

--
-- TOC entry 238 (class 1259 OID 16599)
-- Name: opportunity_destinations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.opportunity_destinations (
    opportunity_id bigint NOT NULL,
    country_name character varying(120) NOT NULL
);


ALTER TABLE public.opportunity_destinations OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 16539)
-- Name: opportunity_education_levels; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.opportunity_education_levels (
    opportunity_id bigint NOT NULL,
    education_level character varying(80) NOT NULL
);


ALTER TABLE public.opportunity_education_levels OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 16527)
-- Name: opportunity_fields; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.opportunity_fields (
    opportunity_id bigint NOT NULL,
    field_name character varying(160) NOT NULL
);


ALTER TABLE public.opportunity_fields OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 16573)
-- Name: opportunity_subtypes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.opportunity_subtypes (
    subtype_id bigint NOT NULL,
    category character varying(20) NOT NULL,
    subtype_name character varying(80) NOT NULL,
    description text,
    is_active boolean DEFAULT true NOT NULL,
    CONSTRAINT opportunity_subtypes_category_check CHECK (((category)::text = ANY ((ARRAY['SCHOLARSHIP'::character varying, 'PROGRAM'::character varying])::text[])))
);


ALTER TABLE public.opportunity_subtypes OWNER TO postgres;

--
-- TOC entry 236 (class 1259 OID 16572)
-- Name: opportunity_subtypes_subtype_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.opportunity_subtypes_subtype_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.opportunity_subtypes_subtype_id_seq OWNER TO postgres;

--
-- TOC entry 5326 (class 0 OID 0)
-- Dependencies: 236
-- Name: opportunity_subtypes_subtype_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.opportunity_subtypes_subtype_id_seq OWNED BY public.opportunity_subtypes.subtype_id;


--
-- TOC entry 235 (class 1259 OID 16552)
-- Name: opportunity_test_requirements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.opportunity_test_requirements (
    requirement_id bigint NOT NULL,
    opportunity_id bigint NOT NULL,
    test_type character varying(60) NOT NULL,
    min_score numeric(10,3) NOT NULL,
    max_score numeric(10,3)
);


ALTER TABLE public.opportunity_test_requirements OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 16551)
-- Name: opportunity_test_requirements_requirement_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.opportunity_test_requirements_requirement_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.opportunity_test_requirements_requirement_id_seq OWNER TO postgres;

--
-- TOC entry 5327 (class 0 OID 0)
-- Dependencies: 234
-- Name: opportunity_test_requirements_requirement_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.opportunity_test_requirements_requirement_id_seq OWNED BY public.opportunity_test_requirements.requirement_id;


--
-- TOC entry 228 (class 1259 OID 16470)
-- Name: student_documents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.student_documents (
    document_id bigint NOT NULL,
    user_id bigint NOT NULL,
    document_type character varying(80),
    file_name character varying(255) NOT NULL,
    file_path text,
    status character varying(30) DEFAULT 'pending'::character varying NOT NULL,
    uploaded_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT student_documents_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'verified'::character varying, 'rejected'::character varying])::text[])))
);


ALTER TABLE public.student_documents OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 16469)
-- Name: student_documents_document_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.student_documents_document_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.student_documents_document_id_seq OWNER TO postgres;

--
-- TOC entry 5328 (class 0 OID 0)
-- Dependencies: 227
-- Name: student_documents_document_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.student_documents_document_id_seq OWNED BY public.student_documents.document_id;


--
-- TOC entry 226 (class 1259 OID 16448)
-- Name: student_goals; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.student_goals (
    goal_id bigint NOT NULL,
    user_id bigint NOT NULL,
    target_degree character varying(100),
    target_field character varying(160),
    target_countries text[] DEFAULT '{}'::text[] NOT NULL,
    target_universities text[] DEFAULT '{}'::text[] NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    priority_dimensions text[] DEFAULT '{}'::text[] NOT NULL
);


ALTER TABLE public.student_goals OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 16447)
-- Name: student_goals_goal_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.student_goals_goal_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.student_goals_goal_id_seq OWNER TO postgres;

--
-- TOC entry 5329 (class 0 OID 0)
-- Dependencies: 225
-- Name: student_goals_goal_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.student_goals_goal_id_seq OWNED BY public.student_goals.goal_id;


--
-- TOC entry 222 (class 1259 OID 16409)
-- Name: student_profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.student_profiles (
    profile_id bigint NOT NULL,
    user_id bigint NOT NULL,
    phone character varying(40),
    school_name character varying(200),
    education_level character varying(80),
    field_of_study character varying(160),
    academic_score numeric(8,3),
    academic_scale character varying(30),
    academic_percent_equivalent numeric(6,3),
    conversion_source_url text,
    expected_graduation_year integer,
    citizenship character varying(100),
    date_of_birth date,
    bio text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT student_profiles_academic_scale_check CHECK ((((academic_scale)::text = ANY ((ARRAY['percentage'::character varying, 'gpa_4'::character varying, 'gpa_5'::character varying, 'gpa_10'::character varying])::text[])) OR (academic_scale IS NULL))),
    CONSTRAINT student_profiles_expected_graduation_year_check CHECK (((expected_graduation_year IS NULL) OR ((expected_graduation_year >= 2000) AND (expected_graduation_year <= 2100))))
);


ALTER TABLE public.student_profiles OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16408)
-- Name: student_profiles_profile_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.student_profiles_profile_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.student_profiles_profile_id_seq OWNER TO postgres;

--
-- TOC entry 5330 (class 0 OID 0)
-- Dependencies: 221
-- Name: student_profiles_profile_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.student_profiles_profile_id_seq OWNED BY public.student_profiles.profile_id;


--
-- TOC entry 240 (class 1259 OID 16613)
-- Name: student_saved_opportunities; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.student_saved_opportunities (
    saved_opportunity_id bigint NOT NULL,
    user_id bigint NOT NULL,
    opportunity_id bigint NOT NULL,
    status character varying(30) DEFAULT 'RESEARCHING'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT student_saved_opportunities_status_check CHECK (((status)::text = ANY ((ARRAY['RESEARCHING'::character varying, 'CONSIDERING'::character varying, 'PLANNING_TO_APPLY'::character varying, 'APPLIED'::character varying])::text[])))
);


ALTER TABLE public.student_saved_opportunities OWNER TO postgres;

--
-- TOC entry 239 (class 1259 OID 16612)
-- Name: student_saved_opportunities_saved_opportunity_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.student_saved_opportunities_saved_opportunity_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.student_saved_opportunities_saved_opportunity_id_seq OWNER TO postgres;

--
-- TOC entry 5331 (class 0 OID 0)
-- Dependencies: 239
-- Name: student_saved_opportunities_saved_opportunity_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.student_saved_opportunities_saved_opportunity_id_seq OWNED BY public.student_saved_opportunities.saved_opportunity_id;


--
-- TOC entry 224 (class 1259 OID 16433)
-- Name: student_tests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.student_tests (
    test_id bigint NOT NULL,
    user_id bigint NOT NULL,
    test_type character varying(60) NOT NULL,
    score numeric(10,3),
    max_score numeric(10,3),
    score_text character varying(100)
);


ALTER TABLE public.student_tests OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16432)
-- Name: student_tests_test_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.student_tests_test_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.student_tests_test_id_seq OWNER TO postgres;

--
-- TOC entry 5332 (class 0 OID 0)
-- Dependencies: 223
-- Name: student_tests_test_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.student_tests_test_id_seq OWNED BY public.student_tests.test_id;


--
-- TOC entry 220 (class 1259 OID 16386)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    user_id bigint NOT NULL,
    first_name character varying(80) NOT NULL,
    last_name character varying(80) NOT NULL,
    email character varying(255) NOT NULL,
    password_hash text NOT NULL,
    role character varying(20) DEFAULT 'student'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['student'::character varying, 'admin'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16385)
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_user_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_user_id_seq OWNER TO postgres;

--
-- TOC entry 5333 (class 0 OID 0)
-- Dependencies: 219
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_user_id_seq OWNED BY public.users.user_id;


--
-- TOC entry 4973 (class 2604 OID 17067)
-- Name: learning_activities activity_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.learning_activities ALTER COLUMN activity_id SET DEFAULT nextval('public.learning_activities_activity_id_seq'::regclass);


--
-- TOC entry 4975 (class 2604 OID 17092)
-- Name: learning_activity_submissions submission_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.learning_activity_submissions ALTER COLUMN submission_id SET DEFAULT nextval('public.learning_activity_submissions_submission_id_seq'::regclass);


--
-- TOC entry 4965 (class 2604 OID 16967)
-- Name: learning_answer_options option_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.learning_answer_options ALTER COLUMN option_id SET DEFAULT nextval('public.learning_answer_options_option_id_seq'::regclass);


--
-- TOC entry 4969 (class 2604 OID 17004)
-- Name: learning_assessment_answers answer_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.learning_assessment_answers ALTER COLUMN answer_id SET DEFAULT nextval('public.learning_assessment_answers_answer_id_seq'::regclass);


--
-- TOC entry 4967 (class 2604 OID 16986)
-- Name: learning_assessments assessment_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.learning_assessments ALTER COLUMN assessment_id SET DEFAULT nextval('public.learning_assessments_assessment_id_seq'::regclass);


--
-- TOC entry 4979 (class 2604 OID 17123)
-- Name: learning_image_hotspots hotspot_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.learning_image_hotspots ALTER COLUMN hotspot_id SET DEFAULT nextval('public.learning_image_hotspots_hotspot_id_seq'::regclass);


--
-- TOC entry 4958 (class 2604 OID 16896)
-- Name: learning_lessons lesson_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.learning_lessons ALTER COLUMN lesson_id SET DEFAULT nextval('public.learning_lessons_lesson_id_seq'::regclass);


--
-- TOC entry 4955 (class 2604 OID 16859)
-- Name: learning_levels level_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.learning_levels ALTER COLUMN level_id SET DEFAULT nextval('public.learning_levels_level_id_seq'::regclass);


--
-- TOC entry 4970 (class 2604 OID 17032)
-- Name: learning_progress progress_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.learning_progress ALTER COLUMN progress_id SET DEFAULT nextval('public.learning_progress_progress_id_seq'::regclass);


--
-- TOC entry 4963 (class 2604 OID 16938)
-- Name: learning_questions question_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.learning_questions ALTER COLUMN question_id SET DEFAULT nextval('public.learning_questions_question_id_seq'::regclass);


--
-- TOC entry 4960 (class 2604 OID 16916)
-- Name: learning_resources resource_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.learning_resources ALTER COLUMN resource_id SET DEFAULT nextval('public.learning_resources_resource_id_seq'::regclass);


--
-- TOC entry 4956 (class 2604 OID 16875)
-- Name: learning_topics topic_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.learning_topics ALTER COLUMN topic_id SET DEFAULT nextval('public.learning_topics_topic_id_seq'::regclass);


--
-- TOC entry 4942 (class 2604 OID 16495)
-- Name: opportunities opportunity_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.opportunities ALTER COLUMN opportunity_id SET DEFAULT nextval('public.opportunities_opportunity_id_seq'::regclass);


--
-- TOC entry 4949 (class 2604 OID 16576)
-- Name: opportunity_subtypes subtype_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.opportunity_subtypes ALTER COLUMN subtype_id SET DEFAULT nextval('public.opportunity_subtypes_subtype_id_seq'::regclass);


--
-- TOC entry 4948 (class 2604 OID 16555)
-- Name: opportunity_test_requirements requirement_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.opportunity_test_requirements ALTER COLUMN requirement_id SET DEFAULT nextval('public.opportunity_test_requirements_requirement_id_seq'::regclass);


--
-- TOC entry 4939 (class 2604 OID 16473)
-- Name: student_documents document_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_documents ALTER COLUMN document_id SET DEFAULT nextval('public.student_documents_document_id_seq'::regclass);


--
-- TOC entry 4934 (class 2604 OID 16451)
-- Name: student_goals goal_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_goals ALTER COLUMN goal_id SET DEFAULT nextval('public.student_goals_goal_id_seq'::regclass);


--
-- TOC entry 4930 (class 2604 OID 16412)
-- Name: student_profiles profile_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_profiles ALTER COLUMN profile_id SET DEFAULT nextval('public.student_profiles_profile_id_seq'::regclass);


--
-- TOC entry 4951 (class 2604 OID 16616)
-- Name: student_saved_opportunities saved_opportunity_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_saved_opportunities ALTER COLUMN saved_opportunity_id SET DEFAULT nextval('public.student_saved_opportunities_saved_opportunity_id_seq'::regclass);


--
-- TOC entry 4933 (class 2604 OID 16436)
-- Name: student_tests test_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_tests ALTER COLUMN test_id SET DEFAULT nextval('public.student_tests_test_id_seq'::regclass);


--
-- TOC entry 4926 (class 2604 OID 16389)
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);


--
-- TOC entry 5303 (class 0 OID 17064)
-- Dependencies: 260
-- Data for Name: learning_activities; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.learning_activities (activity_id, lesson_id, title, instructions, activity_type, estimated_minutes, display_order) FROM stdin;
1	3	Eligibility Practice	Compare a fictional student profile with a sample scholarship description.	practice	20	1
2	5	Create Your University Shortlist	Identify three universities and record relevant programs and requirements.	research	25	1
3	8	Funding Checklist	List tuition, housing, meals, travel and other possible expenses.	checklist	15	1
4	9	Compare Two Scholarships	Write three differences between two hypothetical scholarship offers.	research	15	1
5	10	Recommendation Request Practice	Draft a respectful message requesting a recommendation.	writing	20	1
6	11	Draft Your CV	Organize your education, activities, projects and relevant skills.	writing	30	1
7	12	Personal Essay Practice	Write 150 words about a meaningful experience and what you learned.	writing	30	1
8	14	Community Project Idea	Identify a local problem and outline a realistic response.	project	30	1
9	15	Activity Discovery	Identify activities available in your school or community.	research	20	1
10	18	Academic Goal Setting	Write three academic goals and one practical action for each.	reflection	20	1
11	20	Application Tracker Practice	Prepare a checklist showing the status of each application requirement.	checklist	20	1
12	21	Build an Application Calendar	Create a timeline with document and submission milestones.	project	25	1
13	23	Interview Reflection	Prepare an authentic response explaining your academic interests.	practice	20	1
14	26	Opportunity Comparison	Compare two opportunities using eligibility, funding and deadlines.	research	25	1
\.


--
-- TOC entry 5305 (class 0 OID 17089)
-- Dependencies: 262
-- Data for Name: learning_activity_submissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.learning_activity_submissions (submission_id, activity_id, user_id, response_text, status, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5295 (class 0 OID 16964)
-- Dependencies: 252
-- Data for Name: learning_answer_options; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.learning_answer_options (option_id, question_id, option_text, is_correct) FROM stdin;
1	6	Listing an activity without participating.	f
2	1	Official eligibility and application requirements.	t
3	7	Creating and following a realistic learning plan.	t
4	4	A guaranteed admission offer.	f
5	8	Keeping documents without organization.	f
6	3	Yes, every scholarship covers everything.	f
7	1	Only the scholarship logo.	f
8	8	Remembering all deadlines without recording them.	f
9	9	Memorize unrelated responses.	f
10	10	The official scholarship provider website.	t
11	6	Joining a group without contributing.	f
12	6	Organizing a project that addresses a community need.	t
13	5	Ignoring the essay prompt.	f
14	5	Unsupported achievements.	f
15	4	A university accommodation contract.	f
16	2	Program suitability and admission requirements.	t
17	8	Checking deadlines only after they pass.	f
18	2	Only the university ranking.	f
19	10	An outdated social media post.	f
20	10	An anonymous forwarded message.	f
21	9	Ignore the program description.	f
22	2	Only social media popularity.	f
23	3	Every scholarship covers international flights.	f
24	7	Ignoring difficult subjects.	f
25	9	Reflect on experiences and practice authentic answers.	t
26	4	A compulsory university examination.	f
27	7	Avoiding feedback.	f
28	4	Financial support for education.	t
29	1	Only the country name.	f
30	9	Invent achievements.	f
31	1	Only the number of followers.	f
32	6	Claiming another person's achievement.	f
33	3	No, coverage depends on the award.	t
34	2	Only the size of the campus.	f
35	10	An unverified advertisement.	f
36	5	Unrelated quotations.	f
37	7	Collecting certificates without learning.	f
38	8	A regularly updated application tracker.	t
39	3	Every scholarship covers accommodation only.	f
40	5	Specific experiences and thoughtful reflection.	t
\.


--
-- TOC entry 5299 (class 0 OID 17001)
-- Dependencies: 256
-- Data for Name: learning_assessment_answers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.learning_assessment_answers (answer_id, assessment_id, question_id, option_id) FROM stdin;
\.


--
-- TOC entry 5297 (class 0 OID 16983)
-- Dependencies: 254
-- Data for Name: learning_assessments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.learning_assessments (assessment_id, user_id, assessment_type, score, started_at, completed_at) FROM stdin;
\.


--
-- TOC entry 5307 (class 0 OID 17120)
-- Dependencies: 264
-- Data for Name: learning_image_hotspots; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.learning_image_hotspots (hotspot_id, resource_id, label, explanation, x_percent, y_percent, display_order) FROM stdin;
\.


--
-- TOC entry 5289 (class 0 OID 16893)
-- Dependencies: 246
-- Data for Name: learning_lessons; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.learning_lessons (lesson_id, topic_id, title, content, key_points, practical_example, common_mistakes, display_order, learning_objectives, estimated_minutes) FROM stdin;
1	1	Understanding Deadlines and Official Information	Always confirm application deadlines and requirements using the official scholarship or university website.	Recognize reliable application information.	Identify the official deadline in a sample announcement.	Trusting outdated social media announcements.	3	Recognize reliable application information.	15
2	1	Understanding Application Requirements	Applications may request transcripts, essays, recommendation letters, identification documents, test results and financial information.	Identify common application documents.	Create a document preparation checklist.	Waiting until the deadline to collect documents.	2	Identify common application documents.	25
3	1	Understanding Scholarship Eligibility	Eligibility criteria may include nationality, education level, academic achievement, age or intended field of study.	Identify mandatory eligibility conditions.	Evaluate a fictional student against a sample eligibility list.	Applying without checking mandatory conditions.	1	Identify mandatory eligibility conditions.	20
4	2	Choosing a Suitable Study Destination	Consider academic quality, program availability, living conditions, language, safety and total educational expenses.	Evaluate important destination factors.	Compare two hypothetical study destinations.	Ignoring living costs and language requirements.	3	Evaluate important destination factors.	20
5	2	Finding Universities and Programs	University selection should consider academic interests, available programs, teaching language, funding and admission requirements.	Identify suitable universities and degree programs.	Create a shortlist of three programs.	Choosing universities based only on rankings.	2	Identify suitable universities and degree programs.	25
6	2	Understanding International Study Pathways	Students may enter universities through direct undergraduate admission, preparatory programs or other recognized pathways.	Compare different education pathways.	Research the entry requirements of two study routes.	Assuming all countries use the same admission system.	1	Compare different education pathways.	20
7	3	Essential Scholarship Terminology	Important terms include eligibility, merit, financial need, deadline, renewable award and application requirements.	Understand common scholarship vocabulary.	Identify important terms in a sample scholarship announcement.	Assuming eligibility guarantees selection.	3	Understand common scholarship vocabulary.	15
8	3	Scholarship Funding Types	Scholarships may cover tuition, accommodation, meals, travel or only selected expenses. Always examine the official funding description.	Distinguish full funding, partial funding and tuition waivers.	Prepare a checklist of expenses covered by a sample award.	Confusing full tuition with full funding.	2	Distinguish full funding, partial funding and tuition waivers.	20
9	3	What Is a Scholarship?	A scholarship provides financial support for education. It may be awarded based on academic merit, financial need, leadership, service or other criteria.	Understand scholarships and selection criteria.	Compare a merit-based scholarship with a need-based scholarship.	Assuming every scholarship covers every expense.	1	Understand scholarships and selection criteria.	15
10	4	Recommendation Letters and Requests	Choose recommenders who know your work and provide sufficient notice, relevant context and accurate submission instructions.	Prepare respectful recommendation requests.	Draft a short request to a teacher.	Requesting a letter at the last minute.	3	Prepare respectful recommendation requests.	20
11	4	Preparing a Student CV	A student CV summarizes education, relevant experiences, skills, projects, activities and achievements accurately.	Organize relevant CV information.	Draft a one-page student CV.	Including unsupported achievements.	2	Organize relevant CV information.	25
12	4	Writing a Personal Essay	A strong personal essay responds directly to the prompt and uses specific experiences, reflection and authentic language.	Understand essay structure and reflection.	Write a short paragraph about a meaningful learning experience.	Using generic claims without supporting examples.	1	Understand essay structure and reflection.	30
13	5	Documenting Activities and Achievements	Maintain accurate records of activity dates, responsibilities, contributions, outcomes and supporting evidence.	Document experiences clearly and truthfully.	Create an activity record for one project.	Exaggerating responsibilities or achievements.	3	Document experiences clearly and truthfully.	20
14	5	Leadership and Community Contribution	Leadership can involve taking initiative, supporting others, solving problems and contributing responsibly to a group.	Recognize different forms of leadership.	Describe a community problem and a possible response.	Thinking leadership requires an official title.	2	Recognize different forms of leadership.	25
15	5	Understanding Extracurricular Activities	Extracurricular activities include clubs, volunteering, competitions, independent projects, creative work and community initiatives.	Identify meaningful activities.	List activities connected to your interests.	Assuming only international competitions are valuable.	1	Identify meaningful activities.	20
16	6	Creating a Personal Development Plan	A useful development plan connects a goal with practical actions, available resources and realistic checkpoints.	Create achievable development milestones.	Prepare a four-week learning plan.	Creating plans without measurable actions.	3	Create achievable development milestones.	25
17	6	Developing Useful Skills	Communication, research, collaboration, problem-solving and digital literacy can support academic and personal development.	Identify skills relevant to personal goals.	Choose one skill and prepare a learning activity.	Collecting certificates without practicing skills.	2	Identify skills relevant to personal goals.	25
18	6	Building Academic Readiness	Academic readiness includes consistent learning, understanding subject requirements and developing effective study habits.	Recognize academic strengths and improvement areas.	Write three realistic academic development goals.	Focusing only on grades without developing understanding.	1	Recognize academic strengths and improvement areas.	20
19	7	Preparing Multiple Pathways	A balanced plan can include different universities, scholarship routes and alternative opportunities aligned with personal goals.	Develop flexible education plans.	Prepare primary and alternative opportunity lists.	Depending on only one scholarship.	3	Develop flexible education plans.	25
20	7	Tracking Application Progress	Application tracking records preparation status, required documents, completed tasks, submission dates and follow-up actions.	Understand application tracking.	Create a sample application tracker.	Failing to update application status.	2	Understand application tracking.	20
21	7	Creating an Application Timeline	An application timeline organizes deadlines, preparation milestones and document collection into manageable stages.	Create a realistic preparation timeline.	Build a calendar for a hypothetical application.	Planning only around the final submission date.	1	Create a realistic preparation timeline.	25
22	8	Reviewing an Application	Review each application for completeness, consistency, accurate information, prompt relevance and submission instructions.	Apply a final application review checklist.	Review a fictional application for missing information.	Submitting without checking required documents.	3	Apply a final application review checklist.	20
23	8	Preparing for Interviews	Interview preparation includes understanding the program, reflecting on experiences and practicing clear and truthful answers.	Prepare for common interview themes.	Practice explaining your academic interests.	Memorizing artificial answers without understanding them.	2	Prepare for common interview themes.	30
24	8	Building an Application Strategy	An application strategy connects suitable opportunities with preparation time, requirements and realistic priorities.	Prioritize application tasks.	Create a preparation plan for two applications.	Starting every application immediately before its deadline.	1	Prioritize application tasks.	25
25	9	Verifying Opportunity Information	Confirm application details on official websites and check whether information is current before making decisions.	Identify reliable opportunity information.	Verify the requirements of a sample opportunity.	Treating unverified announcements as official.	3	Identify reliable opportunity information.	20
26	9	Comparing Scholarship Opportunities	Compare opportunities using eligibility, program suitability, funding, deadlines and preparation requirements.	Evaluate opportunities using consistent criteria.	Prepare a comparison matrix.	Comparing awards using prestige alone.	2	Evaluate opportunities using consistent criteria.	25
27	9	Researching Scholarship Opportunities	Research opportunities using official sources and record eligibility, benefits, required documents and application deadlines.	Build an organized opportunity shortlist.	Research and record two suitable opportunities.	Relying exclusively on third-party listings.	1	Build an organized opportunity shortlist.	25
\.


--
-- TOC entry 5285 (class 0 OID 16856)
-- Dependencies: 242
-- Data for Name: learning_levels; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.learning_levels (level_id, title, description, display_order) FROM stdin;
1	Foundation	Understand scholarships and international education.	1
2	Developing	Build your profile and prepare application materials.	2
3	Advanced	Evaluate opportunities and manage applications.	3
\.


--
-- TOC entry 5301 (class 0 OID 17029)
-- Dependencies: 258
-- Data for Name: learning_progress; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.learning_progress (progress_id, user_id, lesson_id, status, completed_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5293 (class 0 OID 16935)
-- Dependencies: 250
-- Data for Name: learning_questions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.learning_questions (question_id, topic_id, lesson_id, question_text, question_type, assessment_type, difficulty, explanation) FROM stdin;
1	1	\N	What should students check before applying?	single_choice	initial	easy	Official eligibility and application requirements.
2	2	\N	What should students consider when choosing a university?	single_choice	initial	easy	Program suitability and admission requirements.
3	3	\N	Does every scholarship cover all educational expenses?	single_choice	initial	easy	No, coverage depends on the award.
4	3	\N	Which statement best describes a scholarship?	single_choice	initial	easy	Financial support for education.
5	4	\N	What makes a personal essay effective?	single_choice	initial	easy	Specific experiences and thoughtful reflection.
6	5	\N	Which activity can demonstrate meaningful leadership?	single_choice	initial	easy	Organizing a project that addresses a community need.
7	6	\N	Which action supports academic development?	single_choice	initial	easy	Creating and following a realistic learning plan.
8	7	\N	What helps students manage multiple applications?	single_choice	initial	easy	A regularly updated application tracker.
9	8	\N	How should students prepare for interviews?	single_choice	initial	easy	Reflect on experiences and practice authentic answers.
10	9	\N	What is a reliable source of scholarship information?	single_choice	initial	easy	The official scholarship provider website.
\.


--
-- TOC entry 5291 (class 0 OID 16913)
-- Dependencies: 248
-- Data for Name: learning_resources; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.learning_resources (resource_id, lesson_id, title, resource_type, url, description, is_free, display_order) FROM stdin;
1	5	EducationUSA	website	https://educationusa.state.gov/	University research and international education guidance.	t	1
2	9	EducationUSA	website	https://educationusa.state.gov/	Official guidance about studying in the United States.	t	1
3	12	Purdue Online Writing Lab	website	https://owl.purdue.edu/	Educational writing guidance and resources.	t	1
4	17	freeCodeCamp	website	https://www.freecodecamp.org/	Free technology and programming learning materials.	t	1
5	17	Khan Academy	website	https://www.khanacademy.org/	Free educational learning resources.	t	1
6	27	EducationUSA	website	https://educationusa.state.gov/	Official information and educational guidance.	t	1
\.


--
-- TOC entry 5287 (class 0 OID 16872)
-- Dependencies: 244
-- Data for Name: learning_topics; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.learning_topics (topic_id, level_id, title, description, display_order) FROM stdin;
1	1	Eligibility and Requirements	Understand application conditions and documents.	3
2	1	International Education Pathways	Universities, programs and study destinations.	2
3	1	Scholarship Fundamentals	Scholarship types, funding and terminology.	1
4	2	Application Documents	Prepare essays, CVs and recommendation requests.	3
5	2	Extracurriculars and Leadership	Explore activities, projects and community impact.	2
6	2	Academic and Personal Development	Develop useful academic and personal skills.	1
7	3	Planning and Tracking	Organize requirements, deadlines and progress.	3
8	3	Application Strategy and Interviews	Prepare authentic and complete applications.	2
9	3	Opportunity Research and Comparison	Compare scholarships and verify opportunities.	1
\.


--
-- TOC entry 5273 (class 0 OID 16492)
-- Dependencies: 230
-- Data for Name: opportunities; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.opportunities (opportunity_id, title, provider, description, category, deadline, application_url, min_age, max_age, min_academic_percent, is_active, created_by, created_at, updated_at, subtype_id, is_verified, opportunity_purpose) FROM stdin;
1	Ubuntu STEM Scholars Demo	Ubuntu Gojo Research Team	DEMO DATA — replace with verified opportunity information before production.	Scholarship	2027-03-15	https://example.org/ubuntu-stem	15	20	80.000	t	\N	2026-10-09 00:30:40.106561+04	2026-10-09 00:30:40.106561+04	4	f	\N
2	Global Future Leaders Demo	Ubuntu Gojo Research Team	DEMO DATA — replace with verified opportunity information before production.	Scholarship	2027-05-30	https://example.org/future-leaders	16	19	85.000	t	\N	2026-10-09 00:30:40.106561+04	2026-10-09 00:30:40.106561+04	1	f	\N
3	Open Tech Pathways Demo	Ubuntu Gojo Research Team	DEMO DATA — replace with verified opportunity information before production.	Program	2027-07-01	https://example.org/open-tech	14	22	70.000	t	\N	2026-10-09 00:30:40.106561+04	2026-10-09 00:30:40.106561+04	13	f	\N
\.


--
-- TOC entry 5274 (class 0 OID 16515)
-- Dependencies: 231
-- Data for Name: opportunity_countries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.opportunity_countries (opportunity_id, country_name) FROM stdin;
1	Ethiopia
2	Ethiopia
3	Ethiopia
3	Kenya
\.


--
-- TOC entry 5281 (class 0 OID 16599)
-- Dependencies: 238
-- Data for Name: opportunity_destinations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.opportunity_destinations (opportunity_id, country_name) FROM stdin;
\.


--
-- TOC entry 5276 (class 0 OID 16539)
-- Dependencies: 233
-- Data for Name: opportunity_education_levels; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.opportunity_education_levels (opportunity_id, education_level) FROM stdin;
1	High School
2	High School
3	High School
\.


--
-- TOC entry 5275 (class 0 OID 16527)
-- Dependencies: 232
-- Data for Name: opportunity_fields; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.opportunity_fields (opportunity_id, field_name) FROM stdin;
1	Computer Science
2	Computer Science
1	Engineering
3	Biology
3	Computer Science
\.


--
-- TOC entry 5280 (class 0 OID 16573)
-- Dependencies: 237
-- Data for Name: opportunity_subtypes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.opportunity_subtypes (subtype_id, category, subtype_name, description, is_active) FROM stdin;
1	SCHOLARSHIP	UNDERGRADUATE_SCHOLARSHIP	Financial support for undergraduate education	t
2	SCHOLARSHIP	SCHOOL_LEVEL_SCHOLARSHIP	Financial support for school-level education	t
3	SCHOLARSHIP	GRADUATE_SCHOLARSHIP	Financial support for graduate education	t
4	SCHOLARSHIP	SUBJECT_SPECIFIC_SCHOLARSHIP	Financial support focused on a particular subject	t
5	SCHOLARSHIP	NEED_BASED_SCHOLARSHIP	Financial support based on financial need	t
6	PROGRAM	STUDENT_EXCHANGE	Academic or cultural exchange experience	t
7	PROGRAM	SUMMER_PROGRAM	Short-term educational program, often held during summer	t
8	PROGRAM	INTERNSHIP	Practical work experience in a professional field	t
9	PROGRAM	VOLUNTEERING	Opportunity to contribute time and skills to a cause	t
10	PROGRAM	RESEARCH_PROGRAM	Structured opportunity to participate in research	t
11	PROGRAM	LEADERSHIP_PROGRAM	Program focused on leadership and personal development	t
12	PROGRAM	LANGUAGE_LEARNING	Program focused on learning or improving a language	t
13	PROGRAM	ACADEMIC_ENRICHMENT	Additional academic learning beyond regular schooling	t
14	PROGRAM	SCIENCE_OR_TECHNOLOGY_CAMP	Hands-on science, technology, engineering, or related activities	t
15	PROGRAM	COMPETITION	Academic, technical, or skills-based competition	t
16	PROGRAM	FELLOWSHIP_PROGRAM	Structured fellowship for learning, development, or professional experience	t
17	PROGRAM	MENTORSHIP	Guidance and learning from an experienced mentor	t
18	PROGRAM	CONFERENCE_OR_WORKSHOP	A focused event for learning, discussion, or skill development	t
19	PROGRAM	COMMUNITY_SERVICE	Organized activities that benefit a community	t
20	PROGRAM	ONLINE_LEARNING_PROGRAM	Structured online educational opportunity	t
21	PROGRAM	ENTREPRENEURSHIP_PROGRAM	Program supporting business ideas and entrepreneurial skills	t
\.


--
-- TOC entry 5278 (class 0 OID 16552)
-- Dependencies: 235
-- Data for Name: opportunity_test_requirements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.opportunity_test_requirements (requirement_id, opportunity_id, test_type, min_score, max_score) FROM stdin;
1	2	IELTS	6.500	9.000
2	1	SAT	1200.000	1600.000
\.


--
-- TOC entry 5271 (class 0 OID 16470)
-- Dependencies: 228
-- Data for Name: student_documents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.student_documents (document_id, user_id, document_type, file_name, file_path, status, uploaded_at) FROM stdin;
\.


--
-- TOC entry 5269 (class 0 OID 16448)
-- Dependencies: 226
-- Data for Name: student_goals; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.student_goals (goal_id, user_id, target_degree, target_field, target_countries, target_universities, created_at, priority_dimensions) FROM stdin;
1	1	bachelor	biotechnology	{korea}	{kaist}	2026-10-09 00:59:12.142079+04	{}
3	7	bachelor	biotechnology	{germany}	{}	2026-10-26 00:34:00.732206+04	{}
\.


--
-- TOC entry 5265 (class 0 OID 16409)
-- Dependencies: 222
-- Data for Name: student_profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.student_profiles (profile_id, user_id, phone, school_name, education_level, field_of_study, academic_score, academic_scale, academic_percent_equivalent, conversion_source_url, expected_graduation_year, citizenship, date_of_birth, bio, created_at, updated_at) FROM stdin;
1	1	52228	millenniumacademy	High School	computer science	4.000	gpa_4	\N	\N	2027	ethiopia	\N	\N	2026-10-09 00:59:11.968473+04	2026-10-10 13:36:59.958799+04
3	7	\N	millenniumacademy	High School	computer science	4.000	gpa_4	\N	\N	2028	ethiopia	2009-02-01	\N	2026-10-26 00:33:56.850189+04	2026-10-26 00:34:00.176018+04
\.


--
-- TOC entry 5283 (class 0 OID 16613)
-- Dependencies: 240
-- Data for Name: student_saved_opportunities; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.student_saved_opportunities (saved_opportunity_id, user_id, opportunity_id, status, created_at, updated_at) FROM stdin;
1	7	3	RESEARCHING	2026-10-29 06:33:38.412664+04	2026-10-29 06:33:38.412664+04
\.


--
-- TOC entry 5267 (class 0 OID 16433)
-- Dependencies: 224
-- Data for Name: student_tests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.student_tests (test_id, user_id, test_type, score, max_score, score_text) FROM stdin;
\.


--
-- TOC entry 5263 (class 0 OID 16386)
-- Dependencies: 220
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (user_id, first_name, last_name, email, password_hash, role, created_at, updated_at) FROM stdin;
2	tsio	abe	tsiongdw@gmail.com	$2b$12$A.BGlwqrd/.QhmMG2g7HzeMJdhoIQpLr5mg86rtjTWgCdirYGUkbS	admin	2026-10-09 14:19:50.106293+04	2026-10-09 14:19:50.106293+04
1	Abebe	Tsion	tsionabebe2009@gmail.com	$2b$12$/zA.06U2qVY9yKBOcwAl9eAqi82EiH9o18XqeJUQ8HwX/kvBg.gbW	student	2026-10-09 00:55:31.321223+04	2026-10-09 00:55:31.321223+04
4	you	me	youme@gmail.com	$2b$12$0Lw7v5BdTzeLRfEm7N04LONANP0YldZR/D.lmw48kz4V/djZauiRi	student	2026-10-23 08:51:50.427181+04	2026-10-23 08:51:50.427181+04
7	ts	ab	tsab2009@gmail.com	$2b$12$ovoAJgEzQHrn12.roAc8juqI/vXPoYUdu1Hzyy7WI4pQn7DhWzlNK	student	2026-10-26 00:31:35.804303+04	2026-10-26 00:31:35.804303+04
8	tsion	abebe	tsionabebe2007@gmail.com	$2b$12$sLM6mawLZ5Hfc2QYza4U6umOP.eBZlo5xUYcWIKbfP4KcQnm6MIne	student	2026-10-28 20:57:26.482606+04	2026-10-28 20:57:26.482606+04
\.


--
-- TOC entry 5334 (class 0 OID 0)
-- Dependencies: 259
-- Name: learning_activities_activity_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.learning_activities_activity_id_seq', 14, true);


--
-- TOC entry 5335 (class 0 OID 0)
-- Dependencies: 261
-- Name: learning_activity_submissions_submission_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.learning_activity_submissions_submission_id_seq', 1, false);


--
-- TOC entry 5336 (class 0 OID 0)
-- Dependencies: 251
-- Name: learning_answer_options_option_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.learning_answer_options_option_id_seq', 40, true);


--
-- TOC entry 5337 (class 0 OID 0)
-- Dependencies: 255
-- Name: learning_assessment_answers_answer_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.learning_assessment_answers_answer_id_seq', 1, false);


--
-- TOC entry 5338 (class 0 OID 0)
-- Dependencies: 253
-- Name: learning_assessments_assessment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.learning_assessments_assessment_id_seq', 1, false);


--
-- TOC entry 5339 (class 0 OID 0)
-- Dependencies: 263
-- Name: learning_image_hotspots_hotspot_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.learning_image_hotspots_hotspot_id_seq', 1, false);


--
-- TOC entry 5340 (class 0 OID 0)
-- Dependencies: 245
-- Name: learning_lessons_lesson_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.learning_lessons_lesson_id_seq', 27, true);


--
-- TOC entry 5341 (class 0 OID 0)
-- Dependencies: 241
-- Name: learning_levels_level_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.learning_levels_level_id_seq', 3, true);


--
-- TOC entry 5342 (class 0 OID 0)
-- Dependencies: 257
-- Name: learning_progress_progress_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.learning_progress_progress_id_seq', 1, false);


--
-- TOC entry 5343 (class 0 OID 0)
-- Dependencies: 249
-- Name: learning_questions_question_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.learning_questions_question_id_seq', 10, true);


--
-- TOC entry 5344 (class 0 OID 0)
-- Dependencies: 247
-- Name: learning_resources_resource_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.learning_resources_resource_id_seq', 6, true);


--
-- TOC entry 5345 (class 0 OID 0)
-- Dependencies: 243
-- Name: learning_topics_topic_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.learning_topics_topic_id_seq', 9, true);


--
-- TOC entry 5346 (class 0 OID 0)
-- Dependencies: 229
-- Name: opportunities_opportunity_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.opportunities_opportunity_id_seq', 3, true);


--
-- TOC entry 5347 (class 0 OID 0)
-- Dependencies: 236
-- Name: opportunity_subtypes_subtype_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.opportunity_subtypes_subtype_id_seq', 21, true);


--
-- TOC entry 5348 (class 0 OID 0)
-- Dependencies: 234
-- Name: opportunity_test_requirements_requirement_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.opportunity_test_requirements_requirement_id_seq', 2, true);


--
-- TOC entry 5349 (class 0 OID 0)
-- Dependencies: 227
-- Name: student_documents_document_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.student_documents_document_id_seq', 1, false);


--
-- TOC entry 5350 (class 0 OID 0)
-- Dependencies: 225
-- Name: student_goals_goal_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.student_goals_goal_id_seq', 3, true);


--
-- TOC entry 5351 (class 0 OID 0)
-- Dependencies: 221
-- Name: student_profiles_profile_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.student_profiles_profile_id_seq', 4, true);


--
-- TOC entry 5352 (class 0 OID 0)
-- Dependencies: 239
-- Name: student_saved_opportunities_saved_opportunity_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.student_saved_opportunities_saved_opportunity_id_seq', 2, true);


--
-- TOC entry 5353 (class 0 OID 0)
-- Dependencies: 223
-- Name: student_tests_test_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.student_tests_test_id_seq', 1, false);


--
-- TOC entry 5354 (class 0 OID 0)
-- Dependencies: 219
-- Name: users_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_user_id_seq', 8, true);


--
-- TOC entry 5076 (class 2606 OID 17082)
-- Name: learning_activities learning_activities_lesson_id_title_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.learning_activities
    ADD CONSTRAINT learning_activities_lesson_id_title_key UNIQUE (lesson_id, title);


--
-- TOC entry 5078 (class 2606 OID 17080)
-- Name: learning_activities learning_activities_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.learning_activities
    ADD CONSTRAINT learning_activities_pkey PRIMARY KEY (activity_id);


--
-- TOC entry 5081 (class 2606 OID 17108)
-- Name: learning_activity_submissions learning_activity_submissions_activity_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.learning_activity_submissions
    ADD CONSTRAINT learning_activity_submissions_activity_id_user_id_key UNIQUE (activity_id, user_id);


--
-- TOC entry 5083 (class 2606 OID 17106)
-- Name: learning_activity_submissions learning_activity_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.learning_activity_submissions
    ADD CONSTRAINT learning_activity_submissions_pkey PRIMARY KEY (submission_id);


--
-- TOC entry 5061 (class 2606 OID 16976)
-- Name: learning_answer_options learning_answer_options_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.learning_answer_options
    ADD CONSTRAINT learning_answer_options_pkey PRIMARY KEY (option_id);


--
-- TOC entry 5066 (class 2606 OID 17012)
-- Name: learning_assessment_answers learning_assessment_answers_assessment_id_question_id_optio_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.learning_assessment_answers
    ADD CONSTRAINT learning_assessment_answers_assessment_id_question_id_optio_key UNIQUE (assessment_id, question_id, option_id);


--
-- TOC entry 5068 (class 2606 OID 17010)
-- Name: learning_assessment_answers learning_assessment_answers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.learning_assessment_answers
    ADD CONSTRAINT learning_assessment_answers_pkey PRIMARY KEY (answer_id);


--
-- TOC entry 5064 (class 2606 OID 16994)
-- Name: learning_assessments learning_assessments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.learning_assessments
    ADD CONSTRAINT learning_assessments_pkey PRIMARY KEY (assessment_id);


--
-- TOC entry 5085 (class 2606 OID 17137)
-- Name: learning_image_hotspots learning_image_hotspots_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.learning_image_hotspots
    ADD CONSTRAINT learning_image_hotspots_pkey PRIMARY KEY (hotspot_id);


--
-- TOC entry 5053 (class 2606 OID 16906)
-- Name: learning_lessons learning_lessons_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.learning_lessons
    ADD CONSTRAINT learning_lessons_pkey PRIMARY KEY (lesson_id);


--
-- TOC entry 5041 (class 2606 OID 16870)
-- Name: learning_levels learning_levels_display_order_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.learning_levels
    ADD CONSTRAINT learning_levels_display_order_key UNIQUE (display_order);


--
-- TOC entry 5043 (class 2606 OID 16866)
-- Name: learning_levels learning_levels_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.learning_levels
    ADD CONSTRAINT learning_levels_pkey PRIMARY KEY (level_id);


--
-- TOC entry 5045 (class 2606 OID 16868)
-- Name: learning_levels learning_levels_title_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.learning_levels
    ADD CONSTRAINT learning_levels_title_key UNIQUE (title);


--
-- TOC entry 5071 (class 2606 OID 17042)
-- Name: learning_progress learning_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.learning_progress
    ADD CONSTRAINT learning_progress_pkey PRIMARY KEY (progress_id);


--
-- TOC entry 5073 (class 2606 OID 17044)
-- Name: learning_progress learning_progress_user_id_lesson_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.learning_progress
    ADD CONSTRAINT learning_progress_user_id_lesson_id_key UNIQUE (user_id, lesson_id);


--
-- TOC entry 5059 (class 2606 OID 16952)
-- Name: learning_questions learning_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.learning_questions
    ADD CONSTRAINT learning_questions_pkey PRIMARY KEY (question_id);


--
-- TOC entry 5056 (class 2606 OID 16928)
-- Name: learning_resources learning_resources_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.learning_resources
    ADD CONSTRAINT learning_resources_pkey PRIMARY KEY (resource_id);


--
-- TOC entry 5048 (class 2606 OID 16886)
-- Name: learning_topics learning_topics_level_id_title_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.learning_topics
    ADD CONSTRAINT learning_topics_level_id_title_key UNIQUE (level_id, title);


--
-- TOC entry 5050 (class 2606 OID 16884)
-- Name: learning_topics learning_topics_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.learning_topics
    ADD CONSTRAINT learning_topics_pkey PRIMARY KEY (topic_id);


--
-- TOC entry 5018 (class 2606 OID 16509)
-- Name: opportunities opportunities_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.opportunities
    ADD CONSTRAINT opportunities_pkey PRIMARY KEY (opportunity_id);


--
-- TOC entry 5021 (class 2606 OID 16521)
-- Name: opportunity_countries opportunity_countries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.opportunity_countries
    ADD CONSTRAINT opportunity_countries_pkey PRIMARY KEY (opportunity_id, country_name);


--
-- TOC entry 5034 (class 2606 OID 16605)
-- Name: opportunity_destinations opportunity_destinations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.opportunity_destinations
    ADD CONSTRAINT opportunity_destinations_pkey PRIMARY KEY (opportunity_id, country_name);


--
-- TOC entry 5025 (class 2606 OID 16545)
-- Name: opportunity_education_levels opportunity_education_levels_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.opportunity_education_levels
    ADD CONSTRAINT opportunity_education_levels_pkey PRIMARY KEY (opportunity_id, education_level);


--
-- TOC entry 5023 (class 2606 OID 16533)
-- Name: opportunity_fields opportunity_fields_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.opportunity_fields
    ADD CONSTRAINT opportunity_fields_pkey PRIMARY KEY (opportunity_id, field_name);


--
-- TOC entry 5029 (class 2606 OID 16588)
-- Name: opportunity_subtypes opportunity_subtypes_category_subtype_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.opportunity_subtypes
    ADD CONSTRAINT opportunity_subtypes_category_subtype_name_key UNIQUE (category, subtype_name);


--
-- TOC entry 5031 (class 2606 OID 16586)
-- Name: opportunity_subtypes opportunity_subtypes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.opportunity_subtypes
    ADD CONSTRAINT opportunity_subtypes_pkey PRIMARY KEY (subtype_id);


--
-- TOC entry 5027 (class 2606 OID 16561)
-- Name: opportunity_test_requirements opportunity_test_requirements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.opportunity_test_requirements
    ADD CONSTRAINT opportunity_test_requirements_pkey PRIMARY KEY (requirement_id);


--
-- TOC entry 5014 (class 2606 OID 16485)
-- Name: student_documents student_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_documents
    ADD CONSTRAINT student_documents_pkey PRIMARY KEY (document_id);


--
-- TOC entry 5012 (class 2606 OID 16463)
-- Name: student_goals student_goals_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_goals
    ADD CONSTRAINT student_goals_pkey PRIMARY KEY (goal_id);


--
-- TOC entry 5004 (class 2606 OID 16424)
-- Name: student_profiles student_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_profiles
    ADD CONSTRAINT student_profiles_pkey PRIMARY KEY (profile_id);


--
-- TOC entry 5006 (class 2606 OID 16426)
-- Name: student_profiles student_profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_profiles
    ADD CONSTRAINT student_profiles_user_id_key UNIQUE (user_id);


--
-- TOC entry 5037 (class 2606 OID 16628)
-- Name: student_saved_opportunities student_saved_opportunities_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_saved_opportunities
    ADD CONSTRAINT student_saved_opportunities_pkey PRIMARY KEY (saved_opportunity_id);


--
-- TOC entry 5039 (class 2606 OID 16630)
-- Name: student_saved_opportunities student_saved_opportunities_user_id_opportunity_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_saved_opportunities
    ADD CONSTRAINT student_saved_opportunities_user_id_opportunity_id_key UNIQUE (user_id, opportunity_id);


--
-- TOC entry 5009 (class 2606 OID 16441)
-- Name: student_tests student_tests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_tests
    ADD CONSTRAINT student_tests_pkey PRIMARY KEY (test_id);


--
-- TOC entry 4999 (class 2606 OID 16407)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 5001 (class 2606 OID 16405)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- TOC entry 5010 (class 1259 OID 16569)
-- Name: idx_goals_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_goals_user ON public.student_goals USING btree (user_id);


--
-- TOC entry 5074 (class 1259 OID 17144)
-- Name: idx_learning_activities_lesson; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_learning_activities_lesson ON public.learning_activities USING btree (lesson_id);


--
-- TOC entry 5062 (class 1259 OID 17058)
-- Name: idx_learning_assessments_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_learning_assessments_user ON public.learning_assessments USING btree (user_id);


--
-- TOC entry 5051 (class 1259 OID 17056)
-- Name: idx_learning_lessons_topic; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_learning_lessons_topic ON public.learning_lessons USING btree (topic_id);


--
-- TOC entry 5069 (class 1259 OID 17059)
-- Name: idx_learning_progress_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_learning_progress_user ON public.learning_progress USING btree (user_id);


--
-- TOC entry 5057 (class 1259 OID 17057)
-- Name: idx_learning_questions_topic; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_learning_questions_topic ON public.learning_questions USING btree (topic_id);


--
-- TOC entry 5054 (class 1259 OID 17143)
-- Name: idx_learning_resources_lesson; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_learning_resources_lesson ON public.learning_resources USING btree (lesson_id);


--
-- TOC entry 5079 (class 1259 OID 17145)
-- Name: idx_learning_submissions_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_learning_submissions_user ON public.learning_activity_submissions USING btree (user_id);


--
-- TOC entry 5046 (class 1259 OID 17055)
-- Name: idx_learning_topics_level; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_learning_topics_level ON public.learning_topics USING btree (level_id);


--
-- TOC entry 5015 (class 1259 OID 16570)
-- Name: idx_opportunities_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_opportunities_active ON public.opportunities USING btree (is_active);


--
-- TOC entry 5016 (class 1259 OID 16642)
-- Name: idx_opportunities_deadline_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_opportunities_deadline_active ON public.opportunities USING btree (is_active, deadline);


--
-- TOC entry 5019 (class 1259 OID 16571)
-- Name: idx_opportunity_countries_country; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_opportunity_countries_country ON public.opportunity_countries USING btree (country_name);


--
-- TOC entry 5032 (class 1259 OID 16611)
-- Name: idx_opportunity_destinations_country; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_opportunity_destinations_country ON public.opportunity_destinations USING btree (country_name);


--
-- TOC entry 5002 (class 1259 OID 16567)
-- Name: idx_profiles_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_profiles_user ON public.student_profiles USING btree (user_id);


--
-- TOC entry 5035 (class 1259 OID 16641)
-- Name: idx_saved_opportunities_user_updated; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_saved_opportunities_user_updated ON public.student_saved_opportunities USING btree (user_id, updated_at DESC);


--
-- TOC entry 5007 (class 1259 OID 16568)
-- Name: idx_tests_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tests_user ON public.student_tests USING btree (user_id);


--
-- TOC entry 5090 (class 2606 OID 16589)
-- Name: opportunities fk_opportunities_subtype; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.opportunities
    ADD CONSTRAINT fk_opportunities_subtype FOREIGN KEY (subtype_id) REFERENCES public.opportunity_subtypes(subtype_id) ON DELETE RESTRICT;


--
-- TOC entry 5111 (class 2606 OID 17083)
-- Name: learning_activities learning_activities_lesson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.learning_activities
    ADD CONSTRAINT learning_activities_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.learning_lessons(lesson_id);


--
-- TOC entry 5112 (class 2606 OID 17109)
-- Name: learning_activity_submissions learning_activity_submissions_activity_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.learning_activity_submissions
    ADD CONSTRAINT learning_activity_submissions_activity_id_fkey FOREIGN KEY (activity_id) REFERENCES public.learning_activities(activity_id);


--
-- TOC entry 5113 (class 2606 OID 17114)
-- Name: learning_activity_submissions learning_activity_submissions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.learning_activity_submissions
    ADD CONSTRAINT learning_activity_submissions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 5104 (class 2606 OID 16977)
-- Name: learning_answer_options learning_answer_options_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.learning_answer_options
    ADD CONSTRAINT learning_answer_options_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.learning_questions(question_id) ON DELETE CASCADE;


--
-- TOC entry 5106 (class 2606 OID 17013)
-- Name: learning_assessment_answers learning_assessment_answers_assessment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.learning_assessment_answers
    ADD CONSTRAINT learning_assessment_answers_assessment_id_fkey FOREIGN KEY (assessment_id) REFERENCES public.learning_assessments(assessment_id) ON DELETE CASCADE;


--
-- TOC entry 5107 (class 2606 OID 17023)
-- Name: learning_assessment_answers learning_assessment_answers_option_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.learning_assessment_answers
    ADD CONSTRAINT learning_assessment_answers_option_id_fkey FOREIGN KEY (option_id) REFERENCES public.learning_answer_options(option_id);


--
-- TOC entry 5108 (class 2606 OID 17018)
-- Name: learning_assessment_answers learning_assessment_answers_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.learning_assessment_answers
    ADD CONSTRAINT learning_assessment_answers_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.learning_questions(question_id);


--
-- TOC entry 5105 (class 2606 OID 16995)
-- Name: learning_assessments learning_assessments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.learning_assessments
    ADD CONSTRAINT learning_assessments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 5114 (class 2606 OID 17138)
-- Name: learning_image_hotspots learning_image_hotspots_resource_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.learning_image_hotspots
    ADD CONSTRAINT learning_image_hotspots_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.learning_resources(resource_id) ON DELETE CASCADE;


--
-- TOC entry 5100 (class 2606 OID 16907)
-- Name: learning_lessons learning_lessons_topic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.learning_lessons
    ADD CONSTRAINT learning_lessons_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.learning_topics(topic_id);


--
-- TOC entry 5109 (class 2606 OID 17050)
-- Name: learning_progress learning_progress_lesson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.learning_progress
    ADD CONSTRAINT learning_progress_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.learning_lessons(lesson_id);


--
-- TOC entry 5110 (class 2606 OID 17045)
-- Name: learning_progress learning_progress_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.learning_progress
    ADD CONSTRAINT learning_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 5102 (class 2606 OID 16958)
-- Name: learning_questions learning_questions_lesson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.learning_questions
    ADD CONSTRAINT learning_questions_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.learning_lessons(lesson_id);


--
-- TOC entry 5103 (class 2606 OID 16953)
-- Name: learning_questions learning_questions_topic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.learning_questions
    ADD CONSTRAINT learning_questions_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.learning_topics(topic_id);


--
-- TOC entry 5101 (class 2606 OID 16929)
-- Name: learning_resources learning_resources_lesson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.learning_resources
    ADD CONSTRAINT learning_resources_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.learning_lessons(lesson_id);


--
-- TOC entry 5099 (class 2606 OID 16887)
-- Name: learning_topics learning_topics_level_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.learning_topics
    ADD CONSTRAINT learning_topics_level_id_fkey FOREIGN KEY (level_id) REFERENCES public.learning_levels(level_id);


--
-- TOC entry 5091 (class 2606 OID 16510)
-- Name: opportunities opportunities_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.opportunities
    ADD CONSTRAINT opportunities_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(user_id) ON DELETE SET NULL;


--
-- TOC entry 5092 (class 2606 OID 16522)
-- Name: opportunity_countries opportunity_countries_opportunity_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.opportunity_countries
    ADD CONSTRAINT opportunity_countries_opportunity_id_fkey FOREIGN KEY (opportunity_id) REFERENCES public.opportunities(opportunity_id) ON DELETE CASCADE;


--
-- TOC entry 5096 (class 2606 OID 16606)
-- Name: opportunity_destinations opportunity_destinations_opportunity_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.opportunity_destinations
    ADD CONSTRAINT opportunity_destinations_opportunity_id_fkey FOREIGN KEY (opportunity_id) REFERENCES public.opportunities(opportunity_id) ON DELETE CASCADE;


--
-- TOC entry 5094 (class 2606 OID 16546)
-- Name: opportunity_education_levels opportunity_education_levels_opportunity_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.opportunity_education_levels
    ADD CONSTRAINT opportunity_education_levels_opportunity_id_fkey FOREIGN KEY (opportunity_id) REFERENCES public.opportunities(opportunity_id) ON DELETE CASCADE;


--
-- TOC entry 5093 (class 2606 OID 16534)
-- Name: opportunity_fields opportunity_fields_opportunity_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.opportunity_fields
    ADD CONSTRAINT opportunity_fields_opportunity_id_fkey FOREIGN KEY (opportunity_id) REFERENCES public.opportunities(opportunity_id) ON DELETE CASCADE;


--
-- TOC entry 5095 (class 2606 OID 16562)
-- Name: opportunity_test_requirements opportunity_test_requirements_opportunity_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.opportunity_test_requirements
    ADD CONSTRAINT opportunity_test_requirements_opportunity_id_fkey FOREIGN KEY (opportunity_id) REFERENCES public.opportunities(opportunity_id) ON DELETE CASCADE;


--
-- TOC entry 5089 (class 2606 OID 16486)
-- Name: student_documents student_documents_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_documents
    ADD CONSTRAINT student_documents_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 5088 (class 2606 OID 16464)
-- Name: student_goals student_goals_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_goals
    ADD CONSTRAINT student_goals_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 5086 (class 2606 OID 16427)
-- Name: student_profiles student_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_profiles
    ADD CONSTRAINT student_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 5097 (class 2606 OID 16636)
-- Name: student_saved_opportunities student_saved_opportunities_opportunity_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_saved_opportunities
    ADD CONSTRAINT student_saved_opportunities_opportunity_id_fkey FOREIGN KEY (opportunity_id) REFERENCES public.opportunities(opportunity_id) ON DELETE CASCADE;


--
-- TOC entry 5098 (class 2606 OID 16631)
-- Name: student_saved_opportunities student_saved_opportunities_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_saved_opportunities
    ADD CONSTRAINT student_saved_opportunities_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 5087 (class 2606 OID 16442)
-- Name: student_tests student_tests_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_tests
    ADD CONSTRAINT student_tests_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


-- Completed on 2026-10-31 14:25:42

--
-- PostgreSQL database dump complete
--

\unrestrict TYdDSb9f2UWbKeOzCxHICUPhnAVrqJp6TwpM0YyGOFZCjhhgzLdmAFIbAesdPKv

