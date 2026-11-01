--
-- PostgreSQL database dump
--

\restrict OiUAMTYZQ7xDBQF3cfFpSnYCHEpQTXZrKcCh4fWm9XMbflGXOEaGRatmEcb7cfi

-- Dumped from database version 18.6
-- Dumped by pg_dump version 18.6

-- Started on 2026-11-01 17:39:24

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

--
-- TOC entry 5213 (class 0 OID 16856)
-- Dependencies: 242
-- Data for Name: learning_levels; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.learning_levels (level_id, title, description, display_order) FROM stdin;
1	Foundation	Understand scholarships and international education.	1
2	Developing	Build your profile and prepare application materials.	2
3	Advanced	Evaluate opportunities and manage applications.	3
\.


--
-- TOC entry 5215 (class 0 OID 16872)
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
-- TOC entry 5217 (class 0 OID 16893)
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
-- TOC entry 5231 (class 0 OID 17064)
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
-- TOC entry 5191 (class 0 OID 16386)
-- Dependencies: 220
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (user_id, first_name, last_name, email, password_hash, role, created_at, updated_at) FROM stdin;
2	tsio	abe	tsiongdw@gmail.com	$2b$12$A.BGlwqrd/.QhmMG2g7HzeMJdhoIQpLr5mg86rtjTWgCdirYGUkbS	admin	2026-10-09 14:19:50.106293+04	2026-10-09 14:19:50.106293+04
1	Abebe	Tsion	tsionabebe2009@gmail.com	$2b$12$/zA.06U2qVY9yKBOcwAl9eAqi82EiH9o18XqeJUQ8HwX/kvBg.gbW	student	2026-10-09 00:55:31.321223+04	2026-10-09 00:55:31.321223+04
4	you	me	youme@gmail.com	$2b$12$0Lw7v5BdTzeLRfEm7N04LONANP0YldZR/D.lmw48kz4V/djZauiRi	student	2026-10-23 08:51:50.427181+04	2026-10-23 08:51:50.427181+04
9	mule	asefa	muleasefa@gmail.com	$2b$12$zOcx285rUZNya3FdErCBY.fc/AWjoaqlXhH56SfWM8cJQ1bJaH17W	student	2026-10-31 22:41:54.71469+04	2026-10-31 22:41:54.71469+04
8	tsion	abebe	tsionabebe2007@gmail.com	$2b$12$sLM6mawLZ5Hfc2QYza4U6umOP.eBZlo5xUYcWIKbfP4KcQnm6MIne	student	2026-10-28 20:57:26.482606+04	2026-10-28 20:57:26.482606+04
7	ts	ab	tsab2009@gmail.com	$2b$12$ovoAJgEzQHrn12.roAc8juqI/vXPoYUdu1Hzyy7WI4pQn7DhWzlNK	admin	2026-10-26 00:31:35.804303+04	2026-10-26 00:31:35.804303+04
\.


--
-- TOC entry 5233 (class 0 OID 17089)
-- Dependencies: 262
-- Data for Name: learning_activity_submissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.learning_activity_submissions (submission_id, activity_id, user_id, response_text, status, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5221 (class 0 OID 16935)
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
-- TOC entry 5223 (class 0 OID 16964)
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
-- TOC entry 5225 (class 0 OID 16983)
-- Dependencies: 254
-- Data for Name: learning_assessments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.learning_assessments (assessment_id, user_id, assessment_type, score, started_at, completed_at) FROM stdin;
1	8	initial	30.00	2026-10-31 19:04:33.546373+04	2026-10-31 19:04:33.546373+04
2	8	initial	20.00	2026-10-31 22:36:21.761261+04	2026-10-31 22:36:21.761261+04
\.


--
-- TOC entry 5227 (class 0 OID 17001)
-- Dependencies: 256
-- Data for Name: learning_assessment_answers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.learning_assessment_answers (answer_id, assessment_id, question_id, option_id) FROM stdin;
1	1	1	2
2	1	2	22
3	1	3	39
4	1	4	26
5	1	5	14
6	1	6	1
7	1	7	37
8	1	8	8
9	1	9	25
10	1	10	10
11	2	1	31
12	2	2	34
13	2	3	6
14	2	4	26
15	2	5	36
16	2	6	32
17	2	7	24
18	2	8	38
19	2	9	25
20	2	10	35
\.


--
-- TOC entry 5219 (class 0 OID 16913)
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
-- TOC entry 5235 (class 0 OID 17120)
-- Dependencies: 264
-- Data for Name: learning_image_hotspots; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.learning_image_hotspots (hotspot_id, resource_id, label, explanation, x_percent, y_percent, display_order) FROM stdin;
\.


--
-- TOC entry 5229 (class 0 OID 17029)
-- Dependencies: 258
-- Data for Name: learning_progress; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.learning_progress (progress_id, user_id, lesson_id, status, completed_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5208 (class 0 OID 16573)
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
-- TOC entry 5201 (class 0 OID 16492)
-- Dependencies: 230
-- Data for Name: opportunities; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.opportunities (opportunity_id, title, provider, description, category, deadline, application_url, min_age, max_age, min_academic_percent, is_active, created_by, created_at, updated_at, subtype_id, is_verified, opportunity_purpose) FROM stdin;
1	Ubuntu STEM Scholars Demo	Ubuntu Gojo Research Team	DEMO DATA — replace with verified opportunity information before production.	Scholarship	2027-03-15	https://example.org/ubuntu-stem	15	20	80.000	t	\N	2026-10-09 00:30:40.106561+04	2026-10-09 00:30:40.106561+04	4	f	\N
2	Global Future Leaders Demo	Ubuntu Gojo Research Team	DEMO DATA — replace with verified opportunity information before production.	Scholarship	2027-05-30	https://example.org/future-leaders	16	19	85.000	t	\N	2026-10-09 00:30:40.106561+04	2026-10-09 00:30:40.106561+04	1	f	\N
3	Open Tech Pathways Demo	Ubuntu Gojo Research Team	DEMO DATA — replace with verified opportunity information before production.	Program	2027-07-01	https://example.org/open-tech	14	22	70.000	t	\N	2026-10-09 00:30:40.106561+04	2026-10-09 00:30:40.106561+04	13	f	\N
4	The capital Quest Competition and win prize	Afro Access Investment Lab	\N	Program	\N	https://lnkd.in/eZBX2sBC	19	\N	\N	t	7	2026-10-31 17:12:16.870789+04	2026-10-31 17:12:16.870789+04	15	t	\N
5	Fully Funded CaCTüS Summer Research Internship 2027 in Germany	Max Planck Institute / CaCTüS	90-day summer research internship from July 1 to September 30, 2027, in Germany. Research areas include AI, machine learning, neuroscience and cognitive science. Benefits listed include a monthly stipend of EUR 1,350, accommodation, insurance and travel compensation. For bachelor's and master's students.	PROGRAM	2026-11-16	https://www.projects.tuebingen.mpg.de/	\N	\N	\N	t	\N	2026-11-01 09:12:28.308253+04	2026-11-01 09:12:28.308253+04	10	f	\N
6	AIESEC Global Exchange Information Session	AIESEC	Information session for young people, students and graduates. Scheduled for November 1, 2026, at ALX Lideta Hub, Addis Ababa.	PROGRAM	\N	https://forms.gle/aLmuELB81nL8B6y6A	\N	\N	\N	t	\N	2026-11-01 09:12:28.308253+04	2026-11-01 09:12:28.308253+04	18	f	\N
7	MIDROC Gold Mine PLC Trainee Program	MIDROC Gold Mine PLC	Trainee recruitment for recent BSc graduates from 2024 to 2026. The source lists minimum CGPA requirements of 3.50 for male applicants and 3.25 for female applicants. Applicants should verify the eligible fields and application announcement.	PROGRAM	\N	\N	\N	\N	\N	t	\N	2026-11-01 09:12:28.308253+04	2026-11-01 09:12:28.308253+04	8	f	\N
8	Kectil Program 2027	Kectil	One-year online leadership program for people aged 17 to 26 from developing and least-developed countries. Requires English ability and internet access. Expected participation is approximately 2 to 3 hours weekly.	PROGRAM	2026-11-15	https://kectil.com/apply	17	26	\N	t	\N	2026-11-01 09:12:28.308253+04	2026-11-01 09:12:28.308253+04	11	f	\N
9	Ethio Virtual Fight (EVF) Beta Test	Ethio Virtual Fight	Beta-testing opportunity for people interested in gaming and virtual reality. The source lists a minimum age of 15 and an in-person test in Addis Ababa on October 31, 2026. The event date has passed.	PROGRAM	2026-10-31	https://evf.et/	15	\N	\N	f	\N	2026-11-01 09:12:28.308253+04	2026-11-01 09:12:28.308253+04	15	f	\N
10	Deliver ICT Internship Program 2026	Deliver ICT	Six-month internship for BSc graduates in IT and engineering-related fields. Tracks include cybersecurity, networking, systems/cloud and data center. Location: Addis Ababa.	PROGRAM	2026-11-03	mailto:hr@deliverict.com	\N	\N	\N	t	\N	2026-11-01 09:12:28.308253+04	2026-11-01 09:12:28.308253+04	8	f	\N
11	Mastercard Foundation Scholars Program at ASU 2027	Arizona State University / Mastercard Foundation	Graduate scholarship opportunity for African citizens aged 18 to 33 who will have a bachelor's degree by July 2027, with a minimum GPA of 3.0/4.0 and demonstrated leadership and community service. The source lists 50 scholarships.	SCHOLARSHIP	2026-11-22	https://asu.co1.qualtrics.com/jfe/form/SV_eYaCwLAy07BCOaO	18	33	\N	t	\N	2026-11-01 09:12:28.308253+04	2026-11-01 09:12:28.308253+04	3	f	\N
12	Connect to the World Internship Program	Connect to the World	Three-month hybrid internship in Addis Ababa. Roles include marketing, design, social media, video editing and coordination. Some positions may require a portfolio. The listed deadline has passed.	PROGRAM	2026-10-31	https://form.jotform.com/262965932906066	\N	\N	\N	f	\N	2026-11-01 09:12:28.308253+04	2026-11-01 09:12:28.308253+04	8	f	\N
13	Cursor Hackathon in Jimma	Cursor Hackathon	27-hour hackathon scheduled for November 21 to 22, 2026, at Jimma University. Open to students, developers, professionals, freelancers, founders, designers and beginners.	PROGRAM	\N	https://luma.com/spacexai-yijh	\N	\N	\N	t	\N	2026-11-01 09:12:28.308253+04	2026-11-01 09:12:28.308253+04	15	f	\N
14	Zero to Hired Free Online 5-Week Freelance & Remote Work Masterclass	Zero to Hired	Free five-week online masterclass for people interested in freelance and remote work. Sessions begin November 14, 2026.	PROGRAM	\N	https://forms.gle/juuBELP3VSDNCkFo9	\N	\N	\N	t	\N	2026-11-01 09:12:28.308253+04	2026-11-01 09:12:28.308253+04	20	f	\N
15	WFF Young Scientists Group 2027–2029	World Food Forum	Opportunity for applicants aged 18 to 35 enrolled in or graduated from a master's or PhD program, with expertise in agrifood systems and English proficiency. Expected contribution is up to 20 hours monthly.	PROGRAM	2027-01-29	https://youth.world-food-forum.org/youth-advisory-bodies/young-scientists-group/form/en	18	35	\N	t	\N	2026-11-01 09:12:28.308253+04	2026-11-01 09:12:28.308253+04	11	f	\N
16	Free Virtual Innovation Bootcamp Program for Undergraduate Students	Provider to be confirmed	The source identifies a free virtual innovation bootcamp for undergraduate students in health-related fields in Africa. More eligibility and application details need verification.	PROGRAM	\N	\N	\N	\N	\N	f	\N	2026-11-01 09:12:28.308253+04	2026-11-01 09:12:28.308253+04	13	f	\N
17	AY Labs Market Research Officer	AY Labs	Opportunity identified in the supplied source. Full requirements, application details and deadline require verification.	PROGRAM	\N	\N	\N	\N	\N	f	\N	2026-11-01 09:12:28.308253+04	2026-11-01 09:12:28.308253+04	8	f	\N
18	Calling Ethiopian Students: Explore Study Abroad Opportunities	Provider to be confirmed	Information opportunity for Ethiopian students interested in exploring study-abroad options. Full details require verification.	PROGRAM	\N	\N	\N	\N	\N	f	\N	2026-11-01 09:12:28.308253+04	2026-11-01 09:12:28.308253+04	18	f	\N
19	Free E-Commerce Skills Training for Urban Refugee Youth in Addis Ababa	Provider to be confirmed	Free e-commerce skills training identified in the source for urban refugee youth in Addis Ababa. Exact eligibility and application details require verification.	PROGRAM	\N	\N	\N	\N	\N	f	\N	2026-11-01 09:12:28.308253+04	2026-11-01 09:12:28.308253+04	20	f	\N
20	Free U.S. University Virtual Fair 2026	Provider to be confirmed	Free virtual fair featuring U.S. universities. Event date and registration details require verification.	PROGRAM	\N	\N	\N	\N	\N	f	\N	2026-11-01 09:12:28.308253+04	2026-11-01 09:12:28.308253+04	18	f	\N
21	Bennington Young Writers Award	Bennington College	Writing award for students in grades 9 to 12 worldwide who have not graduated. The source describes original poetry, fiction and nonfiction approved by a teacher or mentor. Entry is free.	PROGRAM	2026-11-01	https://www.bennington.edu/events/bennington-young-creators-awards/bennington-young-writers-awards	\N	\N	\N	t	\N	2026-11-01 09:12:28.308253+04	2026-11-01 09:12:28.308253+04	15	f	\N
22	Free Career Readiness Training for Graduates and Job Seekers	LonAdd	Free three-hour interactive career-readiness session for recent graduates, final-year university students and entry-level job seekers. The date is to be announced. Venue: Nigist Tower, Kazanchis, Addis Ababa.	PROGRAM	\N	https://docs.google.com/forms/d/e/1FAIpQLSeKaFwToSlAaEYm-WPFrOO65BUpsIwst7NvnzZUccFtnujrZQ/viewform	\N	\N	\N	t	\N	2026-11-01 09:12:28.308253+04	2026-11-01 09:12:28.308253+04	18	f	\N
23	Ayzon Foundation SHE CAN Cohort 4 Entrepreneurship Track	Ayzon Foundation	Five-week entrepreneurship track for young women and recent female graduates. Sessions are listed for Mondays and Wednesdays at Satchmo Center, Addis Ababa. The listed deadline has passed.	PROGRAM	2026-10-31	https://forms.gle/hwUxCs1yYJDZbUZY8	\N	\N	\N	f	\N	2026-11-01 09:12:28.308253+04	2026-11-01 09:12:28.308253+04	21	f	\N
24	SIHA Network Digital Protection Bootcamp	SIHA Network	Digital protection bootcamp for women human-rights defenders, advocates and organizers in Addis Ababa. Event dates are November 11 to 13, 2026.	PROGRAM	2026-11-03	https://lnkd.in/e8gMHbzB	\N	\N	\N	t	\N	2026-11-01 09:12:28.308253+04	2026-11-01 09:12:28.308253+04	18	f	\N
25	Yale Young Global Scholars (YYGS) 2027	Yale University	A two-week residential academic programm at Yale for high-school students from around the world.	Program	2027-01-20	https://globalscholars.yale.edu/news/yale-young-global-scholars-opens-application-summer-2027	16	18	\N	t	7	2026-11-01 11:26:16.443174+04	2026-11-01 11:26:16.443174+04	7	f	Academic program
\.


--
-- TOC entry 5202 (class 0 OID 16515)
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
-- TOC entry 5209 (class 0 OID 16599)
-- Dependencies: 238
-- Data for Name: opportunity_destinations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.opportunity_destinations (opportunity_id, country_name) FROM stdin;
25	United States
\.


--
-- TOC entry 5204 (class 0 OID 16539)
-- Dependencies: 233
-- Data for Name: opportunity_education_levels; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.opportunity_education_levels (opportunity_id, education_level) FROM stdin;
1	High School
2	High School
3	High School
25	Highschool
\.


--
-- TOC entry 5203 (class 0 OID 16527)
-- Dependencies: 232
-- Data for Name: opportunity_fields; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.opportunity_fields (opportunity_id, field_name) FROM stdin;
1	Computer Science
2	Computer Science
1	Engineering
3	Biology
3	Computer Science
25	STEM
25	Humanities
25	Social Sciences
\.


--
-- TOC entry 5206 (class 0 OID 16552)
-- Dependencies: 235
-- Data for Name: opportunity_test_requirements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.opportunity_test_requirements (requirement_id, opportunity_id, test_type, min_score, max_score) FROM stdin;
1	2	IELTS	6.500	9.000
2	1	SAT	1200.000	1600.000
\.


--
-- TOC entry 5199 (class 0 OID 16470)
-- Dependencies: 228
-- Data for Name: student_documents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.student_documents (document_id, user_id, document_type, file_name, file_path, status, uploaded_at) FROM stdin;
\.


--
-- TOC entry 5197 (class 0 OID 16448)
-- Dependencies: 226
-- Data for Name: student_goals; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.student_goals (goal_id, user_id, target_degree, target_field, target_countries, target_universities, created_at, priority_dimensions) FROM stdin;
1	1	bachelor	biotechnology	{korea}	{kaist}	2026-10-09 00:59:12.142079+04	{}
5	8	undergraduate	computer science	{usa}	{harvard}	2026-11-01 09:29:47.296534+04	{}
7	7	bachelor	stem	{germany}	{}	2026-11-01 12:32:12.665063+04	{}
\.


--
-- TOC entry 5193 (class 0 OID 16409)
-- Dependencies: 222
-- Data for Name: student_profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.student_profiles (profile_id, user_id, phone, school_name, education_level, field_of_study, academic_score, academic_scale, academic_percent_equivalent, conversion_source_url, expected_graduation_year, citizenship, date_of_birth, bio, created_at, updated_at) FROM stdin;
1	1	52228	millenniumacademy	High School	computer science	4.000	gpa_4	\N	\N	2027	ethiopia	\N	\N	2026-10-09 00:59:11.968473+04	2026-10-10 13:36:59.958799+04
5	8	091668524	millenniumacademy	High School	computer science	\N	\N	\N	\N	2028	ethiopia	2009-02-02	\N	2026-10-31 19:08:20.184185+04	2026-11-01 10:53:47.8995+04
3	7	\N	millenniumacademy	High School	computer science	4.000	gpa_4	\N	\N	2028	ethiopia	2009-01-31	\N	2026-10-26 00:33:56.850189+04	2026-11-01 12:32:12.062358+04
\.


--
-- TOC entry 5211 (class 0 OID 16613)
-- Dependencies: 240
-- Data for Name: student_saved_opportunities; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.student_saved_opportunities (saved_opportunity_id, user_id, opportunity_id, status, created_at, updated_at) FROM stdin;
1	7	3	RESEARCHING	2026-10-29 06:33:38.412664+04	2026-10-29 06:33:38.412664+04
4	8	1	RESEARCHING	2026-10-31 22:34:51.43953+04	2026-10-31 22:34:51.43953+04
3	8	4	PLANNING_TO_APPLY	2026-10-31 20:06:09.949356+04	2026-10-31 22:35:14.676444+04
\.


--
-- TOC entry 5195 (class 0 OID 16433)
-- Dependencies: 224
-- Data for Name: student_tests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.student_tests (test_id, user_id, test_type, score, max_score, score_text) FROM stdin;
\.


--
-- TOC entry 5241 (class 0 OID 0)
-- Dependencies: 259
-- Name: learning_activities_activity_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.learning_activities_activity_id_seq', 14, true);


--
-- TOC entry 5242 (class 0 OID 0)
-- Dependencies: 261
-- Name: learning_activity_submissions_submission_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.learning_activity_submissions_submission_id_seq', 1, false);


--
-- TOC entry 5243 (class 0 OID 0)
-- Dependencies: 251
-- Name: learning_answer_options_option_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.learning_answer_options_option_id_seq', 40, true);


--
-- TOC entry 5244 (class 0 OID 0)
-- Dependencies: 255
-- Name: learning_assessment_answers_answer_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.learning_assessment_answers_answer_id_seq', 20, true);


--
-- TOC entry 5245 (class 0 OID 0)
-- Dependencies: 253
-- Name: learning_assessments_assessment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.learning_assessments_assessment_id_seq', 2, true);


--
-- TOC entry 5246 (class 0 OID 0)
-- Dependencies: 263
-- Name: learning_image_hotspots_hotspot_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.learning_image_hotspots_hotspot_id_seq', 1, false);


--
-- TOC entry 5247 (class 0 OID 0)
-- Dependencies: 245
-- Name: learning_lessons_lesson_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.learning_lessons_lesson_id_seq', 27, true);


--
-- TOC entry 5248 (class 0 OID 0)
-- Dependencies: 241
-- Name: learning_levels_level_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.learning_levels_level_id_seq', 3, true);


--
-- TOC entry 5249 (class 0 OID 0)
-- Dependencies: 257
-- Name: learning_progress_progress_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.learning_progress_progress_id_seq', 1, false);


--
-- TOC entry 5250 (class 0 OID 0)
-- Dependencies: 249
-- Name: learning_questions_question_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.learning_questions_question_id_seq', 10, true);


--
-- TOC entry 5251 (class 0 OID 0)
-- Dependencies: 247
-- Name: learning_resources_resource_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.learning_resources_resource_id_seq', 6, true);


--
-- TOC entry 5252 (class 0 OID 0)
-- Dependencies: 243
-- Name: learning_topics_topic_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.learning_topics_topic_id_seq', 9, true);


--
-- TOC entry 5253 (class 0 OID 0)
-- Dependencies: 229
-- Name: opportunities_opportunity_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.opportunities_opportunity_id_seq', 25, true);


--
-- TOC entry 5254 (class 0 OID 0)
-- Dependencies: 236
-- Name: opportunity_subtypes_subtype_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.opportunity_subtypes_subtype_id_seq', 21, true);


--
-- TOC entry 5255 (class 0 OID 0)
-- Dependencies: 234
-- Name: opportunity_test_requirements_requirement_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.opportunity_test_requirements_requirement_id_seq', 2, true);


--
-- TOC entry 5256 (class 0 OID 0)
-- Dependencies: 227
-- Name: student_documents_document_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.student_documents_document_id_seq', 1, false);


--
-- TOC entry 5257 (class 0 OID 0)
-- Dependencies: 225
-- Name: student_goals_goal_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.student_goals_goal_id_seq', 7, true);


--
-- TOC entry 5258 (class 0 OID 0)
-- Dependencies: 221
-- Name: student_profiles_profile_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.student_profiles_profile_id_seq', 13, true);


--
-- TOC entry 5259 (class 0 OID 0)
-- Dependencies: 239
-- Name: student_saved_opportunities_saved_opportunity_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.student_saved_opportunities_saved_opportunity_id_seq', 4, true);


--
-- TOC entry 5260 (class 0 OID 0)
-- Dependencies: 223
-- Name: student_tests_test_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.student_tests_test_id_seq', 1, false);


--
-- TOC entry 5261 (class 0 OID 0)
-- Dependencies: 219
-- Name: users_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_user_id_seq', 9, true);


-- Completed on 2026-11-01 17:40:44

--
-- PostgreSQL database dump complete
--

\unrestrict OiUAMTYZQ7xDBQF3cfFpSnYCHEpQTXZrKcCh4fWm9XMbflGXOEaGRatmEcb7cfi

