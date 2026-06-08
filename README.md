# AI Test Automation Agent (Auto-QA)

> Auto-QA is an AI-powered testing platform that analyzes GitHub repositories, generates intelligent test cases, creates Playwright automation scripts, executes them in real time, and converts execution logs into human-readable reports.

## Features

- AI-powered test case generation
- Playwright script generation
- Real-time execution log streaming
- Human-readable AI analysis
- GitHub repository integration
- Stripe-powered credit system
- Workspace management dashboard
- Repository-specific testing instructions
- Playwright browser automation
- Execution history and test persistence

## Architecture

### Frontend
- Next.js
- React
- TypeScript

### Backend
- Next.js API Routes
- Drizzle ORM
- PostgreSQL / Neon

### Integrations
- Google Gemini AI
- GitHub OAuth
- Stripe
- Clerk
- Playwright

## AI Workflow

1. User connects GitHub repository
2. Repository source code is analyzed
3. AI generates test cases
4. User runs a test case
5. AI generates Playwright script
6. Playwright executes browser automation
7. Logs stream live to the UI
8. User can generate a human-readable AI report

## Folder structure

- `app/`
  - `api/` — backend API routes
  - `workspace/` — workspace pages and layout
  - `sign-in/`, `sign-up/` — authentication pages
  - `docs/` — documentation page
  - `page.tsx`, `layout.tsx`, `middleware.ts`
- `components/`
  - `custom/` — app-specific UIs and dialogs
  - `ui/` — reusable UI primitives
- `db/` — Drizzle ORM schema and database initialization
- `lib/` — server helpers and integrations (`stripe.ts`)
- `context/` — user context provider
- `public/` — static assets
- `playwright.config.ts` — Playwright configuration
- `drizzle.config.ts` — Drizzle config
- `package.json`, `tsconfig.json`, `next.config.mjs`

## Project overview

Auto-QA is built to help teams inspect GitHub repositories, generate test case definitions, and execute browser automation through Playwright.

The app uses GitHub OAuth to connect repositories, Google Gemini AI to create test definitions and scripts, Stripe to manage credits, and Clerk for authentication.

## High-level flow

- User signs in via the configured authentication provider (Clerk is included as a dependency).
- The frontend (in the `app/` directory) communicates with the backend API routes under `app/api/` to:
  - connect to GitHub and list repos (`app/api/github/...`)
  - generate test cases (`app/api/generate-test-cases/route.ts`)
  - analyze test-cases (`app/api/test-cases/analyze/route.ts`)
  - run test cases and stream results (`app/api/test-cases/run/route.ts`)
  - manage user and workspace settings (`app/api/users/`, `app/api/test-cases/settings/`)
  - handle payments and webhooks (`app/api/checkout/stripe/route.ts`, `app/api/webhooks/stripe/route.ts`)

Server helpers and integrations live in `lib/` (for example, `lib/stripe.ts` contains Stripe helper functions) and database schema/logic lives in `db/` (Drizzle setup and schema).

## Repo structure (key files)

- `app/` — Next.js app router pages and API routes.
- `components/` — React UI components used across the app.
- `lib/stripe.ts` — Stripe helper functions and client initialization.
- `db/` — Drizzle ORM schema and database initialization.
- `playwright.config.ts` — Playwright configuration for running tests.
- `drizzle.config.ts` — Drizzle configuration for migrations and generation.
- `package.json` — useful scripts:
  - `npm run dev` — runs the app in development mode
  - `npm run build` — builds the Next.js app for production
  - `npm run start` — starts the production server
  - `npm run lint` — runs linting
  - `npm run db:generate` — generate DB types/migrations with Drizzle
  - `npm run db:push` — push schema changes
  - `npm run db:studio` — launch Drizzle Studio

## Prerequisites

- Node.js 18+ (recommended)
- npm or yarn/pnpm
- A PostgreSQL-compatible database (Neon, Postgres, etc.) for Drizzle
- Stripe account for credit checkout
- GitHub OAuth app for repository access

## Environment variables

Create a `.env.local` file with the values below:

- `DATABASE_URL` — database connection string for Drizzle
- `CLIENT_ID` — GitHub OAuth app client ID
- `CLIENT_SECRET` — GitHub OAuth app client secret
- `REDIRECT_URI` — GitHub OAuth redirect URI
- `GEMINI_API_KEY` — Google Gemini API key
- `STRIPE_SECRET_KEY` — Stripe secret key
- `STRIPE_WEBHOOK_SECRET` — Stripe webhook signing secret
- `NEXT_PUBLIC_STRIPE_PRICE_ID_STARTER` — Stripe price ID used by checkout
- `NEXT_PUBLIC_APP_URL` — public application URL (for redirect URLs and checkout)

## Installation & local development

1. Clone the repository and change into the folder:

```bash
git clone <repo-url>
cd AI-testAutomation-agent
```

2. Install dependencies:

```bash
npm install
```

3. Create `.env.local` with the environment variables listed above.

4. Run the development server:

```bash
npm run dev
```

5. Open `http://localhost:3000` in your browser.

## Database (Drizzle)

- Generate DB types/migrations: `npm run db:generate`
- Push schema changes: `npm run db:push`
- Open Drizzle Studio: `npm run db:studio`

Ensure `DATABASE_URL` is set before running these commands.

## Running tests / Playwright

- Playwright is included as a dev dependency. To run tests locally, use:

```bash
npx playwright test
```

## Stripe integration

- Checkout endpoint: `app/api/checkout/stripe/route.ts`
- Webhook endpoint: `app/api/webhooks/stripe/route.ts`
- Stripe helper: `lib/stripe.ts`

## GitHub integration

- GitHub OAuth endpoints are located under `app/api/github/`
- Repo listing and callback handling are implemented in the API routes

## Common tasks

- Build for production: `npm run build`
- Start production server: `npm run start`
- Lint: `npm run lint`
- Database dev ops: `npm run db:generate`, `npm run db:push`, `npm run db:studio`

## Troubleshooting

- Application fails to start: verify `.env.local` variables and that the database is reachable.
- Stripe webhook failures: confirm `STRIPE_WEBHOOK_SECRET` and Stripe webhook URL.
- GitHub OAuth issues: confirm `CLIENT_ID`, `CLIENT_SECRET`, and `REDIRECT_URI`.
