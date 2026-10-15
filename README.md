# ACME Salary Management

A salary-management dashboard for HR, built with a PostgreSQL-backed Rails API and a React + TypeScript frontend using Material UI. The product requirements and explicit exclusions are in [requirements.md](./requirements.md).

## Run locally

Prerequisites: Ruby 3.4+, Bundler, Node.js 20+, npm, and Docker with Compose.

1. Start PostgreSQL from the project root:

   ```sh
   docker compose up -d db
   ```

2. Prepare the Rails API and seed 10,000 synthetic employees:

   ```sh
   cd backend
   bundle install
   bin/rails db:prepare db:seed
   bin/rails server -p 3000
   ```

   The local database defaults to `postgresql://postgres:postgres@localhost:5432/salary_management_development`. Override it with `DATABASE_URL` when needed.

3. In another terminal, install and run the React dashboard:

   ```sh
   cd frontend
   npm ci
   npm run dev
   ```

   Visit <http://localhost:5173>. Vite proxies `/api` requests to the Rails API on port 3000. To open a frontend production build against the local API, run `npm run build` then `npm run preview`; configure `FRONTEND_ORIGINS` for any non-local frontend origin.

## Verify

```sh
cd backend
bin/rails test
```

```sh
cd frontend
npm run build
```

Tests use the separate `salary_management_test` PostgreSQL database. For a custom database setup, set `TEST_DATABASE_URL` independently from `DATABASE_URL`.

## API

- `GET /api/v1/employees` — paginated directory; accepts `q`, `country`, `department`, `sort` (`name`, `salary`, `department`, `country`), `direction` (`asc`, `desc`), and `page`.
- `GET /api/v1/employees/:id` and `PATCH /api/v1/employees/:id` — view a record or update its `annual_salary` and `currency`.
- `GET /api/v1/analytics` — headcount and average, median, minimum, and maximum salary grouped by currency, country/currency, and department/currency.
- `GET /api/v1/filters` — available country and department filters.
- `GET /up` — Rails health check.

Salary analytics are grouped by currency and are not converted. The seed script is deterministic and safe to rerun; employee rows are synthetic and must not be replaced with real salary data until production access control, audit, and compliance safeguards are implemented.
