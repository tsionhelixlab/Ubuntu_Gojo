# Database setup

1. Create a PostgreSQL database named `ubuntu_gojo`.
2. Run `schema.sql` in pgAdmin Query Tool.
3. Run `seed.sql` after the schema.
4. Copy the project `.env.example` to `.env` and put in your PostgreSQL credentials.
5. Start the backend with `npm install` then `npm run dev`.

The schema is intentionally owned by the Ubuntu Gojo application. The old database proposal is not used.
