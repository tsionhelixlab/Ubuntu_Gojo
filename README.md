# Ubuntu Gojo — Integrated Working Baseline

This version is a clean integration of the uploaded authentication, student UI, profile UI, dashboard UI, matching logic, and admin work.

## What changed

- One Express server serves the website and API. There is no separate admin server.
- One PostgreSQL schema is the source of truth; the older database proposal is not used.
- Signup stores first and last name instead of discarding them.
- Login returns a JWT and the dashboard verifies it with `/api/auth/me`.
- Profile data is persisted in PostgreSQL and can be created/updated repeatedly.
- Profile academic scores support percentage, 4.0 GPA, 5.0 GPA, and 10.0 GPA scales plus an optional percent equivalent/conversion source.
- Tests are stored as rows rather than hard-coded JavaScript objects.
- Goals are stored against the authenticated user, removing the old broken `students` lookup.
- Opportunities, countries, fields, education requirements, and test requirements are database records.
- Matching reads the student's profile/goals and opportunities from PostgreSQL.
- Admin opportunity CRUD uses the same authentication and database as the student system.
- Three demo opportunities are provided only for integration testing.

## Today's flow

Landing → Sign up → Login → Student dashboard → Create/Edit profile → saved in PostgreSQL.

The matching API is already connected to the same data model so the next frontend step can display real matches.

## Run

```text
npm install
```

Create PostgreSQL database and run:

```text
database/schema.sql
database/seed.sql
```

Copy `.env.example` to `.env`, set your credentials, then:

```text
npm run dev
```

Open `http://localhost:5000`.

## API

Auth:
- POST `/api/auth/register`
- POST `/api/auth/login`
- GET `/api/auth/me`
- POST `/api/auth/logout`

Student:
- GET/POST/PUT `/api/profile`
- GET/POST `/api/goals`
- GET `/api/matching`

Admin:
- GET/POST `/api/admin/opportunities`
- PUT/DELETE `/api/admin/opportunities/:id`

## Important

The demo opportunity records are not real scholarship claims. Replace them with verified research data before production.
