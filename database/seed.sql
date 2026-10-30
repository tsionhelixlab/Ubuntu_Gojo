-- Mock opportunities for integration testing.
-- These are deliberately marked as demo records in the description.

INSERT INTO opportunities
(title,provider,description,category,deadline,application_url,min_age,max_age,min_academic_percent)
VALUES
('Ubuntu STEM Scholars Demo','Ubuntu Gojo Research Team','DEMO DATA — replace with verified opportunity information before production.','Scholarship','2027-03-15','https://example.org/ubuntu-stem',15,20,80),
('Global Future Leaders Demo','Ubuntu Gojo Research Team','DEMO DATA — replace with verified opportunity information before production.','Scholarship','2027-05-30','https://example.org/future-leaders',16,19,85),
('Open Tech Pathways Demo','Ubuntu Gojo Research Team','DEMO DATA — replace with verified opportunity information before production.','Program','2027-07-01','https://example.org/open-tech',14,22,70);

INSERT INTO opportunity_countries(opportunity_id,country_name)
SELECT opportunity_id,'Ethiopia' FROM opportunities WHERE title='Ubuntu STEM Scholars Demo';
INSERT INTO opportunity_countries(opportunity_id,country_name)
SELECT opportunity_id,'Ethiopia' FROM opportunities WHERE title='Global Future Leaders Demo';
INSERT INTO opportunity_countries(opportunity_id,country_name)
SELECT opportunity_id,'Ethiopia' FROM opportunities WHERE title='Open Tech Pathways Demo';
INSERT INTO opportunity_countries(opportunity_id,country_name)
SELECT opportunity_id,'Kenya' FROM opportunities WHERE title='Open Tech Pathways Demo';

INSERT INTO opportunity_fields(opportunity_id,field_name)
SELECT opportunity_id,'Computer Science' FROM opportunities WHERE title IN ('Ubuntu STEM Scholars Demo','Global Future Leaders Demo');
INSERT INTO opportunity_fields(opportunity_id,field_name)
SELECT opportunity_id,'Engineering' FROM opportunities WHERE title='Ubuntu STEM Scholars Demo';
INSERT INTO opportunity_fields(opportunity_id,field_name)
SELECT opportunity_id,'Biology' FROM opportunities WHERE title='Open Tech Pathways Demo';
INSERT INTO opportunity_fields(opportunity_id,field_name)
SELECT opportunity_id,'Computer Science' FROM opportunities WHERE title='Open Tech Pathways Demo';

INSERT INTO opportunity_education_levels(opportunity_id,education_level)
SELECT opportunity_id,'High School' FROM opportunities;
INSERT INTO opportunity_test_requirements(opportunity_id,test_type,min_score,max_score)
SELECT opportunity_id,'IELTS',6.5,9 FROM opportunities WHERE title='Global Future Leaders Demo';
INSERT INTO opportunity_test_requirements(opportunity_id,test_type,min_score,max_score)
SELECT opportunity_id,'SAT',1200,1600 FROM opportunities WHERE title='Ubuntu STEM Scholars Demo';
