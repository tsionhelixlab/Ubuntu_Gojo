--
-- PostgreSQL database dump
--

\restrict wwwxZRwpHBSywpsaJrIepcqKvWgpCF7fSMvoL4IkSq3jGLFXYUqsonO4iHE6f8P

-- Dumped from database version 18.6
-- Dumped by pg_dump version 18.6

-- Started on 2026-10-31 02:00:25

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
-- TOC entry 219 (class 1259 OID 16645)
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
    subtype_id bigint NOT NULL
);


ALTER TABLE public.opportunities OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 16661)
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
-- TOC entry 5099 (class 0 OID 0)
-- Dependencies: 220
-- Name: opportunities_opportunity_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.opportunities_opportunity_id_seq OWNED BY public.opportunities.opportunity_id;


--
-- TOC entry 221 (class 1259 OID 16662)
-- Name: opportunity_countries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.opportunity_countries (
    opportunity_id bigint NOT NULL,
    country_name character varying(120) NOT NULL
);


ALTER TABLE public.opportunity_countries OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 16667)
-- Name: opportunity_education_levels; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.opportunity_education_levels (
    opportunity_id bigint NOT NULL,
    education_level character varying(80) NOT NULL
);


ALTER TABLE public.opportunity_education_levels OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16672)
-- Name: opportunity_fields; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.opportunity_fields (
    opportunity_id bigint NOT NULL,
    field_name character varying(160) NOT NULL
);


ALTER TABLE public.opportunity_fields OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 16677)
-- Name: opportunity_subtypes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.opportunity_subtypes (
    subtype_id bigint NOT NULL,
    category character varying(20) NOT NULL,
    subtype_name character varying(80) NOT NULL,
    description text,
    is_active boolean DEFAULT true NOT NULL,
    CONSTRAINT opportunity_subtypes_category_check CHECK (((category)::text = ANY (ARRAY[('SCHOLARSHIP'::character varying)::text, ('PROGRAM'::character varying)::text])))
);


ALTER TABLE public.opportunity_subtypes OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 16688)
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
-- TOC entry 5100 (class 0 OID 0)
-- Dependencies: 225
-- Name: opportunity_subtypes_subtype_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.opportunity_subtypes_subtype_id_seq OWNED BY public.opportunity_subtypes.subtype_id;


--
-- TOC entry 226 (class 1259 OID 16689)
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
-- TOC entry 227 (class 1259 OID 16696)
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
-- TOC entry 5101 (class 0 OID 0)
-- Dependencies: 227
-- Name: opportunity_test_requirements_requirement_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.opportunity_test_requirements_requirement_id_seq OWNED BY public.opportunity_test_requirements.requirement_id;


--
-- TOC entry 228 (class 1259 OID 16697)
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
    CONSTRAINT student_documents_status_check CHECK (((status)::text = ANY (ARRAY[('pending'::character varying)::text, ('verified'::character varying)::text, ('rejected'::character varying)::text])))
);


ALTER TABLE public.student_documents OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 16710)
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
-- TOC entry 5102 (class 0 OID 0)
-- Dependencies: 229
-- Name: student_documents_document_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.student_documents_document_id_seq OWNED BY public.student_documents.document_id;


--
-- TOC entry 230 (class 1259 OID 16711)
-- Name: student_goals; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.student_goals (
    goal_id bigint NOT NULL,
    user_id bigint NOT NULL,
    target_degree character varying(100),
    target_field character varying(160),
    target_countries text[] DEFAULT '{}'::text[] NOT NULL,
    target_universities text[] DEFAULT '{}'::text[] NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.student_goals OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 16724)
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
-- TOC entry 5103 (class 0 OID 0)
-- Dependencies: 231
-- Name: student_goals_goal_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.student_goals_goal_id_seq OWNED BY public.student_goals.goal_id;


--
-- TOC entry 232 (class 1259 OID 16725)
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
    CONSTRAINT student_profiles_academic_scale_check CHECK ((((academic_scale)::text = ANY (ARRAY[('percentage'::character varying)::text, ('gpa_4'::character varying)::text, ('gpa_5'::character varying)::text, ('gpa_10'::character varying)::text])) OR (academic_scale IS NULL))),
    CONSTRAINT student_profiles_expected_graduation_year_check CHECK (((expected_graduation_year IS NULL) OR ((expected_graduation_year >= 2000) AND (expected_graduation_year <= 2100))))
);


ALTER TABLE public.student_profiles OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 16738)
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
-- TOC entry 5104 (class 0 OID 0)
-- Dependencies: 233
-- Name: student_profiles_profile_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.student_profiles_profile_id_seq OWNED BY public.student_profiles.profile_id;


--
-- TOC entry 234 (class 1259 OID 16739)
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
-- TOC entry 235 (class 1259 OID 16745)
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
-- TOC entry 5105 (class 0 OID 0)
-- Dependencies: 235
-- Name: student_tests_test_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.student_tests_test_id_seq OWNED BY public.student_tests.test_id;


--
-- TOC entry 236 (class 1259 OID 16746)
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
    CONSTRAINT users_role_check CHECK (((role)::text = ANY (ARRAY[('student'::character varying)::text, ('admin'::character varying)::text])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 16763)
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
-- TOC entry 5106 (class 0 OID 0)
-- Dependencies: 237
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_user_id_seq OWNED BY public.users.user_id;


--
-- TOC entry 4857 (class 2604 OID 16764)
-- Name: opportunities opportunity_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.opportunities ALTER COLUMN opportunity_id SET DEFAULT nextval('public.opportunities_opportunity_id_seq'::regclass);


--
-- TOC entry 4862 (class 2604 OID 16765)
-- Name: opportunity_subtypes subtype_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.opportunity_subtypes ALTER COLUMN subtype_id SET DEFAULT nextval('public.opportunity_subtypes_subtype_id_seq'::regclass);


--
-- TOC entry 4864 (class 2604 OID 16766)
-- Name: opportunity_test_requirements requirement_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.opportunity_test_requirements ALTER COLUMN requirement_id SET DEFAULT nextval('public.opportunity_test_requirements_requirement_id_seq'::regclass);


--
-- TOC entry 4865 (class 2604 OID 16767)
-- Name: student_documents document_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_documents ALTER COLUMN document_id SET DEFAULT nextval('public.student_documents_document_id_seq'::regclass);


--
-- TOC entry 4868 (class 2604 OID 16768)
-- Name: student_goals goal_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_goals ALTER COLUMN goal_id SET DEFAULT nextval('public.student_goals_goal_id_seq'::regclass);


--
-- TOC entry 4872 (class 2604 OID 16769)
-- Name: student_profiles profile_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_profiles ALTER COLUMN profile_id SET DEFAULT nextval('public.student_profiles_profile_id_seq'::regclass);


--
-- TOC entry 4875 (class 2604 OID 16770)
-- Name: student_tests test_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_tests ALTER COLUMN test_id SET DEFAULT nextval('public.student_tests_test_id_seq'::regclass);


--
-- TOC entry 4876 (class 2604 OID 16771)
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);


--
-- TOC entry 5075 (class 0 OID 16645)
-- Dependencies: 219
-- Data for Name: opportunities; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.opportunities (opportunity_id, title, provider, description, category, deadline, application_url, min_age, max_age, min_academic_percent, is_active, created_by, created_at, updated_at, subtype_id) FROM stdin;
1	Ubuntu STEM Scholars Demo	Ubuntu Gojo Research Team	DEMO DATA — replace with verified opportunity information before production.	Scholarship	2027-03-15	https://example.org/ubuntu-stem	15	20	80.000	t	\N	2026-10-09 00:30:40.106561+04	2026-10-09 00:30:40.106561+04	4
2	Global Future Leaders Demo	Ubuntu Gojo Research Team	DEMO DATA — replace with verified opportunity information before production.	Scholarship	2027-05-30	https://example.org/future-leaders	16	19	85.000	t	\N	2026-10-09 00:30:40.106561+04	2026-10-09 00:30:40.106561+04	1
3	Open Tech Pathways Demo	Ubuntu Gojo Research Team	DEMO DATA — replace with verified opportunity information before production.	Program	2027-07-01	https://example.org/open-tech	14	22	70.000	t	\N	2026-10-09 00:30:40.106561+04	2026-10-09 00:30:40.106561+04	13
\.


--
-- TOC entry 5077 (class 0 OID 16662)
-- Dependencies: 221
-- Data for Name: opportunity_countries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.opportunity_countries (opportunity_id, country_name) FROM stdin;
1	Ethiopia
2	Ethiopia
3	Ethiopia
3	Kenya
\.


--
-- TOC entry 5078 (class 0 OID 16667)
-- Dependencies: 222
-- Data for Name: opportunity_education_levels; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.opportunity_education_levels (opportunity_id, education_level) FROM stdin;
1	High School
2	High School
3	High School
\.


--
-- TOC entry 5079 (class 0 OID 16672)
-- Dependencies: 223
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
-- TOC entry 5080 (class 0 OID 16677)
-- Dependencies: 224
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
-- TOC entry 5082 (class 0 OID 16689)
-- Dependencies: 226
-- Data for Name: opportunity_test_requirements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.opportunity_test_requirements (requirement_id, opportunity_id, test_type, min_score, max_score) FROM stdin;
1	2	IELTS	6.500	9.000
2	1	SAT	1200.000	1600.000
\.


--
-- TOC entry 5084 (class 0 OID 16697)
-- Dependencies: 228
-- Data for Name: student_documents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.student_documents (document_id, user_id, document_type, file_name, file_path, status, uploaded_at) FROM stdin;
\.


--
-- TOC entry 5086 (class 0 OID 16711)
-- Dependencies: 230
-- Data for Name: student_goals; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.student_goals (goal_id, user_id, target_degree, target_field, target_countries, target_universities, created_at) FROM stdin;
1	1	bachelor	biotechnology	{korea}	{kaist}	2026-10-09 00:59:12.142079+04
3	7	bachelor	biotechnology	{germany}	{}	2026-10-26 00:34:00.732206+04
\.


--
-- TOC entry 5088 (class 0 OID 16725)
-- Dependencies: 232
-- Data for Name: student_profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.student_profiles (profile_id, user_id, phone, school_name, education_level, field_of_study, academic_score, academic_scale, academic_percent_equivalent, conversion_source_url, expected_graduation_year, citizenship, date_of_birth, bio, created_at, updated_at) FROM stdin;
1	1	52228	millenniumacademy	High School	computer science	4.000	gpa_4	\N	\N	2027	ethiopia	\N	\N	2026-10-09 00:59:11.968473+04	2026-10-10 13:36:59.958799+04
3	7	\N	millenniumacademy	High School	computer science	4.000	gpa_4	\N	\N	2028	ethiopia	2009-02-01	\N	2026-10-26 00:33:56.850189+04	2026-10-26 00:34:00.176018+04
\.


--
-- TOC entry 5090 (class 0 OID 16739)
-- Dependencies: 234
-- Data for Name: student_tests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.student_tests (test_id, user_id, test_type, score, max_score, score_text) FROM stdin;
\.


--
-- TOC entry 5092 (class 0 OID 16746)
-- Dependencies: 236
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (user_id, first_name, last_name, email, password_hash, role, created_at, updated_at) FROM stdin;
2	tsio	abe	tsiongdw@gmail.com	$2b$12$A.BGlwqrd/.QhmMG2g7HzeMJdhoIQpLr5mg86rtjTWgCdirYGUkbS	admin	2026-10-09 14:19:50.106293+04	2026-10-09 14:19:50.106293+04
1	Abebe	Tsion	tsionabebe2009@gmail.com	$2b$12$/zA.06U2qVY9yKBOcwAl9eAqi82EiH9o18XqeJUQ8HwX/kvBg.gbW	student	2026-10-09 00:55:31.321223+04	2026-10-09 00:55:31.321223+04
4	you	me	youme@gmail.com	$2b$12$0Lw7v5BdTzeLRfEm7N04LONANP0YldZR/D.lmw48kz4V/djZauiRi	student	2026-10-23 08:51:50.427181+04	2026-10-23 08:51:50.427181+04
7	ts	ab	tsab2009@gmail.com	$2b$12$ovoAJgEzQHrn12.roAc8juqI/vXPoYUdu1Hzyy7WI4pQn7DhWzlNK	student	2026-10-26 00:31:35.804303+04	2026-10-26 00:31:35.804303+04
\.


--
-- TOC entry 5107 (class 0 OID 0)
-- Dependencies: 220
-- Name: opportunities_opportunity_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.opportunities_opportunity_id_seq', 3, true);


--
-- TOC entry 5108 (class 0 OID 0)
-- Dependencies: 225
-- Name: opportunity_subtypes_subtype_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.opportunity_subtypes_subtype_id_seq', 21, true);


--
-- TOC entry 5109 (class 0 OID 0)
-- Dependencies: 227
-- Name: opportunity_test_requirements_requirement_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.opportunity_test_requirements_requirement_id_seq', 2, true);


--
-- TOC entry 5110 (class 0 OID 0)
-- Dependencies: 229
-- Name: student_documents_document_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.student_documents_document_id_seq', 1, false);


--
-- TOC entry 5111 (class 0 OID 0)
-- Dependencies: 231
-- Name: student_goals_goal_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.student_goals_goal_id_seq', 3, true);


--
-- TOC entry 5112 (class 0 OID 0)
-- Dependencies: 233
-- Name: student_profiles_profile_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.student_profiles_profile_id_seq', 4, true);


--
-- TOC entry 5113 (class 0 OID 0)
-- Dependencies: 235
-- Name: student_tests_test_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.student_tests_test_id_seq', 1, false);


--
-- TOC entry 5114 (class 0 OID 0)
-- Dependencies: 237
-- Name: users_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_user_id_seq', 7, true);


--
-- TOC entry 4887 (class 2606 OID 16773)
-- Name: opportunities opportunities_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.opportunities
    ADD CONSTRAINT opportunities_pkey PRIMARY KEY (opportunity_id);


--
-- TOC entry 4890 (class 2606 OID 16775)
-- Name: opportunity_countries opportunity_countries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.opportunity_countries
    ADD CONSTRAINT opportunity_countries_pkey PRIMARY KEY (opportunity_id, country_name);


--
-- TOC entry 4892 (class 2606 OID 16777)
-- Name: opportunity_education_levels opportunity_education_levels_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.opportunity_education_levels
    ADD CONSTRAINT opportunity_education_levels_pkey PRIMARY KEY (opportunity_id, education_level);


--
-- TOC entry 4894 (class 2606 OID 16779)
-- Name: opportunity_fields opportunity_fields_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.opportunity_fields
    ADD CONSTRAINT opportunity_fields_pkey PRIMARY KEY (opportunity_id, field_name);


--
-- TOC entry 4896 (class 2606 OID 16781)
-- Name: opportunity_subtypes opportunity_subtypes_category_subtype_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.opportunity_subtypes
    ADD CONSTRAINT opportunity_subtypes_category_subtype_name_key UNIQUE (category, subtype_name);


--
-- TOC entry 4898 (class 2606 OID 16783)
-- Name: opportunity_subtypes opportunity_subtypes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.opportunity_subtypes
    ADD CONSTRAINT opportunity_subtypes_pkey PRIMARY KEY (subtype_id);


--
-- TOC entry 4900 (class 2606 OID 16785)
-- Name: opportunity_test_requirements opportunity_test_requirements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.opportunity_test_requirements
    ADD CONSTRAINT opportunity_test_requirements_pkey PRIMARY KEY (requirement_id);


--
-- TOC entry 4902 (class 2606 OID 16787)
-- Name: student_documents student_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_documents
    ADD CONSTRAINT student_documents_pkey PRIMARY KEY (document_id);


--
-- TOC entry 4905 (class 2606 OID 16789)
-- Name: student_goals student_goals_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_goals
    ADD CONSTRAINT student_goals_pkey PRIMARY KEY (goal_id);


--
-- TOC entry 4908 (class 2606 OID 16791)
-- Name: student_profiles student_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_profiles
    ADD CONSTRAINT student_profiles_pkey PRIMARY KEY (profile_id);


--
-- TOC entry 4910 (class 2606 OID 16793)
-- Name: student_profiles student_profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_profiles
    ADD CONSTRAINT student_profiles_user_id_key UNIQUE (user_id);


--
-- TOC entry 4913 (class 2606 OID 16795)
-- Name: student_tests student_tests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_tests
    ADD CONSTRAINT student_tests_pkey PRIMARY KEY (test_id);


--
-- TOC entry 4915 (class 2606 OID 16797)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 4917 (class 2606 OID 16799)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- TOC entry 4903 (class 1259 OID 16800)
-- Name: idx_goals_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_goals_user ON public.student_goals USING btree (user_id);


--
-- TOC entry 4885 (class 1259 OID 16801)
-- Name: idx_opportunities_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_opportunities_active ON public.opportunities USING btree (is_active);


--
-- TOC entry 4888 (class 1259 OID 16802)
-- Name: idx_opportunity_countries_country; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_opportunity_countries_country ON public.opportunity_countries USING btree (country_name);


--
-- TOC entry 4906 (class 1259 OID 16803)
-- Name: idx_profiles_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_profiles_user ON public.student_profiles USING btree (user_id);


--
-- TOC entry 4911 (class 1259 OID 16804)
-- Name: idx_tests_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tests_user ON public.student_tests USING btree (user_id);


--
-- TOC entry 4918 (class 2606 OID 16805)
-- Name: opportunities fk_opportunities_subtype; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.opportunities
    ADD CONSTRAINT fk_opportunities_subtype FOREIGN KEY (subtype_id) REFERENCES public.opportunity_subtypes(subtype_id) ON DELETE RESTRICT;


--
-- TOC entry 4919 (class 2606 OID 16810)
-- Name: opportunities opportunities_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.opportunities
    ADD CONSTRAINT opportunities_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(user_id) ON DELETE SET NULL;


--
-- TOC entry 4920 (class 2606 OID 16815)
-- Name: opportunity_countries opportunity_countries_opportunity_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.opportunity_countries
    ADD CONSTRAINT opportunity_countries_opportunity_id_fkey FOREIGN KEY (opportunity_id) REFERENCES public.opportunities(opportunity_id) ON DELETE CASCADE;


--
-- TOC entry 4921 (class 2606 OID 16820)
-- Name: opportunity_education_levels opportunity_education_levels_opportunity_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.opportunity_education_levels
    ADD CONSTRAINT opportunity_education_levels_opportunity_id_fkey FOREIGN KEY (opportunity_id) REFERENCES public.opportunities(opportunity_id) ON DELETE CASCADE;


--
-- TOC entry 4922 (class 2606 OID 16825)
-- Name: opportunity_fields opportunity_fields_opportunity_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.opportunity_fields
    ADD CONSTRAINT opportunity_fields_opportunity_id_fkey FOREIGN KEY (opportunity_id) REFERENCES public.opportunities(opportunity_id) ON DELETE CASCADE;


--
-- TOC entry 4923 (class 2606 OID 16830)
-- Name: opportunity_test_requirements opportunity_test_requirements_opportunity_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.opportunity_test_requirements
    ADD CONSTRAINT opportunity_test_requirements_opportunity_id_fkey FOREIGN KEY (opportunity_id) REFERENCES public.opportunities(opportunity_id) ON DELETE CASCADE;


--
-- TOC entry 4924 (class 2606 OID 16835)
-- Name: student_documents student_documents_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_documents
    ADD CONSTRAINT student_documents_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 4925 (class 2606 OID 16840)
-- Name: student_goals student_goals_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_goals
    ADD CONSTRAINT student_goals_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 4926 (class 2606 OID 16845)
-- Name: student_profiles student_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_profiles
    ADD CONSTRAINT student_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 4927 (class 2606 OID 16850)
-- Name: student_tests student_tests_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_tests
    ADD CONSTRAINT student_tests_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


-- Completed on 2026-10-31 02:00:29

--
-- PostgreSQL database dump complete
--

\unrestrict wwwxZRwpHBSywpsaJrIepcqKvWgpCF7fSMvoL4IkSq3jGLFXYUqsonO4iHE6f8P

