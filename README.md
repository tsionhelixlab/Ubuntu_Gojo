Ubuntu Gojo

Personalized International Education & Scholarship Guidance Platform

Learn • Discover • Explore • Prepare • Apply • Progress

Ubuntu Gojo is a web-based platform designed to help students navigate international education opportunities and scholarship applications. It brings educational guidance, opportunity exploration, eligibility matching, and preparation support into one connected experience.

Developed by Group 3 as part of the INSA Software Development Training graduation project.

---

1. About the Project

Finding international scholarships and educational opportunities can be challenging. Students often need to search across multiple websites to understand university requirements, scholarship eligibility, application procedures, and deadlines.

Ubuntu Gojo aims to make this process more organized and accessible by providing students with a platform where they can explore opportunities, understand their requirements, identify preparation gaps, and plan their next steps.

Meaning Behind the Name

- Ubuntu: Inspired by the idea "I am because we are," representing community, shared humanity, and mutual support.
- Gojo (ጎጆ): An Ethiopian word referring to a traditional hut or home, symbolizing shelter, warmth, belonging, and guidance.

Together, Ubuntu Gojo represents a supportive space where students can find guidance as they pursue educational opportunities.

2. Project Objectives

The main objective is to develop a personalized platform that supports students throughout their international education journey.

Specific objectives include:

- Organizing international scholarship and educational opportunity information.
- Helping students create profiles and define educational goals.
- Providing opportunity exploration and eligibility-based matching.
- Helping students understand requirements and identify preparation gaps.
- Providing educational and preparation resources.
- Supporting the organization of application-related activities.
- Allowing administrators to manage platform information.

3. Main Features

Student Features

- User Authentication: Student registration and login.
- Student Profile: Management of personal and academic information.
- Educational Goals: Students can define their interests and educational goals.
- Opportunity Exploration: Access to scholarship and educational opportunity information.
- Eligibility Matching: Compares available student profile information with opportunity requirements.
- Learning Resources: Provides educational resources and guidance.
- Preparation Support: Supports academic and extracurricular development and preparation planning.
- Student Dashboard: Provides a central space for accessing student features.

Opportunity Matching

The matching system uses rule-based logic to compare student information with opportunity eligibility criteria.

Depending on the available data, matching considers factors such as:

- Age requirements
- Country or nationality
- Educational level
- Intended field of study
- Academic performance
- Standardized test requirements

The system provides matching results and relevant information about matched criteria and potential gaps.

Matching results support student decisions; they do not guarantee scholarship eligibility, admission, or funding.

Admin Dashboard

The administrator dashboard supports the management of platform information, including educational opportunities and related records.

Some administrative functionality is still under development.

4. Technology Stack

Area| Technologies
Frontend| HTML, CSS, JavaScript
Backend| Node.js, Express.js
Database| PostgreSQL
Database Management| pgAdmin 4
Development Environment| Visual Studio Code
Version Control| Git and GitHub
Interface Design| Figma

5. System Architecture

Ubuntu Gojo follows a client-server architecture.

1. Frontend: Provides the user interface using HTML, CSS, and JavaScript.
2. Backend: Uses Node.js and Express.js to handle application logic and API requests.
3. Database: PostgreSQL stores application data.
4. Matching Logic: Compares student information with opportunity requirements.
5. Administration: Provides tools for managing platform information.

6. Getting Started

Prerequisites

Make sure you have installed:

- "Node.js" (https://nodejs.org/)
- "PostgreSQL" (https://www.postgresql.org/)
- "Git" (https://git-scm.com/)
- A code editor such as Visual Studio Code

Clone the Repository

git clone https://github.com/tsionhelixlab/Ubuntu_Gojo.git

Move into the project directory:

cd Ubuntu_Gojo

Install Dependencies

npm install

Configure the Database

1. Create a PostgreSQL database for Ubuntu Gojo.
2. Configure the database connection using the environment variables required by the project.
3. Import the provided database schema or SQL setup files.
4. Ensure that the database connection settings match your local PostgreSQL configuration.

Important: Use the actual environment variable names and database setup instructions defined in the backend configuration. Do not commit passwords or ".env" files containing secrets.

Start the Application

Check the "package.json" file for the available scripts.

For example, if the project uses the "start" script:

npm start

Open the local application using the port configured in the project.

Note: Verify the exact database setup and startup commands against the repository before submission.

7. Project Scope and Development Status

Ubuntu Gojo has a broader vision that extends beyond the initial graduation project.

The current development focuses on establishing the core web platform and its essential functionality. Some features and integrations may still require improvement and testing.

Future development may include:

- More complete self-discovery and exploration features.
- Expanded scholarship and university opportunity coverage.
- Improved preparation and application management.
- Mobile and low-connectivity support.
- Multilingual educational guidance.
- Optional AI-assisted guidance.
- Mentorship and student community features.

These are future development goals, not claims that all functionality is currently available.

8. Future Development

Future versions of Ubuntu Gojo aim to strengthen the existing platform, improve accessibility, expand trusted opportunity information, introduce multilingual support, and explore optional AI-assisted guidance.

The long-term vision also includes improved personalization, document support, mentorship, community development, and sustainable platform maintenance.

9. Project Information

Item| Details
Project Name| Ubuntu Gojo
Project Type| Web-based Educational Guidance Platform
Project Group| Group 3
Training| INSA Software Development Training
Project Duration| Two-month graduation project
Supervisor| Eyobedel
Repository| "Ubuntu Gojo on GitHub" (https://github.com/tsionhelixlab/Ubuntu_Gojo)
Live Demo| To be added when deployment is available

10. Project Philosophy

Ubuntu Gojo is built around the belief that access to educational opportunities should not be limited by a student's location or access to guidance.

The platform aims to help students move from uncertainty toward informed decisions and practical preparation.

The Journey represents the steps students take toward their educational goals, while The Horizon represents the opportunities and possibilities ahead.

11. Acknowledgment

Developed by Group 3 as part of the INSA Software Development Training graduation project.

Ubuntu Gojo represents a collaborative effort to make international educational guidance more organized, understandable, and accessible to students.
