# GravitasAI — Server

The Express API for GravitasAI. Handles user profile persistence, AI plan generation via Google Gemini 2.5 Flash, and plan versioning on Neon Postgres. Deployed as a serverless function on Vercel via `@vercel/node`.

---

## Tech Stack

| Tool | Version | Purpose |
|---|---|---|
| Express | 5 | HTTP framework |
| TypeScript | 6 | Type safety |
| Prisma | 7 | ORM with `@prisma/adapter-pg` driver |
| `pg` | 8 | Postgres driver (Neon-compatible) |
| Zod | 4 | Request body / query validation |
| Google Gemini | 2.5 Flash | AI plan generation via REST API |
| `dotenv` | 17 | Environment variable loading |
| `cookie-parser` | 1.4 | Cookie parsing middleware |
| `cors` | 2.8 | CORS with configurable origin allowlist |
| `tsx` | 4 | TypeScript execution for development |
| pnpm | 10 | Package manager |

---

## Project Structure

```
server/
├── api/
│   └── index.ts                  # Vercel serverless entry — exports Express app
├── prisma/
│   └── schema.prisma             # Database schema (user_profiles, training_plans)
├── public/
│   └── .gitkeep                  # Required by Vercel
├── src/
│   ├── app.ts                    # Express app setup (middleware, routes, CORS) — no listen()
│   ├── index.ts                  # Local dev entry — imports app and calls listen()
│   ├── controllers/
│   │   ├── profile.controller.ts # saveProfile, getProfile handlers
│   │   └── plan.controller.ts    # generatePlan, getCurrentPlan handlers
│   ├── lib/
│   │   ├── ai.ts                 # Gemini integration — prompt building + plan formatting
│   │   ├── prisma.ts             # Prisma client singleton
│   │   └── validators/
│   │       ├── profile.validator.ts  # Zod schemas for profile endpoints
│   │       └── plan.validator.ts     # Zod schemas for plan endpoints
│   ├── middleware/
│   │   ├── error.ts              # errorHandler + asyncHandler
│   │   └── validate.ts           # Zod validation middleware (body or query)
│   ├── routes/
│   │   ├── profile.ts            # /api/profile router
│   │   └── plan.ts               # /api/plan router
│   └── types/
│       └── index.ts              # Shared types: UserProfile, TrainingPlan, Exercise, etc.
├── generated/
│   └── prisma/                   # Auto-generated Prisma client (git-ignored)
├── dist/                         # TypeScript compilation output (git-ignored)
├── package.json
├── tsconfig.json
└── vercel.json                   # Routes all requests to api/index.ts
```

---

## API Endpoints

### Profile

#### `POST /api/profile`
Create or update a user's training profile.

**Request body:**
```json
{
  "userId": "uuid",
  "goal": "bulk | cut | recomp | strength | endurance",
  "experience": "beginner | intermediate | advanced",
  "daysPerWeek": 4,
  "sessionLength": 60,
  "equipment": "full_gym | home | dumbbells",
  "preferredSplit": "full_body | upper_lower | ppl | custom",
  "injuries": "optional free text"
}
```

**Response `200`:**
```json
{ "success": true, "profile": { ... } }
```

---

#### `GET /api/profile?userId=<uuid>`
Fetch a user's stored profile.

**Response `200`:**
```json
{ "profile": { "goal": "bulk", "experience": "intermediate", ... } }
```

**Response `404`:** Profile not found.

---

### Plan

#### `POST /api/plan/generate`
Generate a new AI training plan for the user. Respects a 60-second regeneration cooldown to avoid hammering the Gemini API.

**Request body:**
```json
{
  "userId": "uuid",
  "force": false
}
```

- `force: false` — returns the cached plan if it is newer than the last profile update
- `force: true` — generates a fresh plan regardless (subject to cooldown)

**Response `201`:**
```json
{
  "id": "uuid",
  "version": 3,
  "createdAt": "2025-05-27T...",
  "planJson": {
    "overview": { "goal": "...", "frequency": "4 days/week", "split": "Upper/Lower", "notes": "..." },
    "weeklySchedule": [
      {
        "day": "Monday",
        "focus": "Upper Push",
        "exercises": [
          { "name": "Bench Press", "sets": 4, "reps": "6-8", "rest": "2-3 min", "rpe": 8, "notes": "...", "alternatives": ["..."] }
        ]
      }
    ],
    "progression": "Increase weight by 2.5-5lbs when..."
  }
}
```

**Response `404`:** No profile found (user must complete onboarding first).

**Response `429`:** Cooldown active — body includes seconds remaining.

**Response `503`:** Gemini API unavailable.

---

#### `GET /api/plan/current?userId=<uuid>`
Fetch the most recently generated plan for a user.

**Response `200`:** Same shape as the `POST /api/plan/generate` response.

**Response `404`:** No plan found.

---

## Database Schema

Managed by Prisma with a custom output path (`../generated/prisma`).

### `user_profiles`

| Column | Type | Notes |
|---|---|---|
| `user_id` | `UUID` PK | Neon Auth user ID |
| `goal` | `VARCHAR(20)` | `bulk`, `cut`, `recomp`, `strength`, `endurance` |
| `experience` | `VARCHAR(20)` | `beginner`, `intermediate`, `advanced` |
| `days_per_week` | `INT` | 2–6 |
| `session_length` | `INT` | Minutes per session |
| `equipment` | `VARCHAR(20)` | `full_gym`, `home`, `dumbbells` |
| `preferred_split` | `VARCHAR(20)` | `full_body`, `upper_lower`, `ppl`, `custom` |
| `injuries` | `TEXT` | Optional free text |
| `updated_at` | `TIMESTAMPTZ` | Auto-set on upsert — used for plan cache invalidation |

### `training_plans`

| Column | Type | Notes |
|---|---|---|
| `id` | `UUID` PK | Auto-generated via `gen_random_uuid()` |
| `user_id` | `UUID` | FK to Neon Auth user |
| `plan_json` | `JSONB` | Full structured plan (overview + weeklySchedule + progression) |
| `plan_text` | `TEXT` | Stringified JSON — kept for search/export |
| `version` | `INT` | Auto-incremented on each regeneration |
| `created_at` | `TIMESTAMPTZ` | Auto-set |

An index on `user_id` (`idx_training_plans_user_id`) ensures fast lookups when fetching the latest plan.

---

## AI Integration (`src/lib/ai.ts`)

The Gemini integration uses the OpenAI-compatible endpoint (`/v1beta/openai/chat/completions`) so the same prompt structure works without Google's SDK.

### Plan Generation Flow

1. **Normalize profile** — applies defaults for any missing fields
2. **Build prompt** — constructs a structured prompt that maps internal enum values to plain English (e.g. `"bulk"` → `"build muscle and gain size"`)
3. **Call Gemini** — `POST` to Google's generativelanguage API with `response_format: { type: "json_object" }` to guarantee parseable output
4. **Retry logic** — retries up to 3 times on retriable errors (429, 502, 503, 504, 529) with exponential backoff (800ms × 2^attempt)
5. **Format response** — maps the raw AI JSON to the `TrainingPlan` shape with safe fallbacks for every field

### Prompt Requirements

The prompt instructs Gemini to return a plan with exactly `N` training days, 4–6 exercises per day, RPE 6–9, and exercises that fit within the session duration. Injury avoidance is injected conditionally.

### Model Configuration

The model defaults to `gemini-2.5-flash`. Override via `GOOGLE_AI_MODEL` to switch to any Gemini variant (e.g. `gemini-2.5-pro`).

---

## Middleware

### `asyncHandler`
Wraps async route handlers to forward thrown errors to Express's error middleware automatically — no try/catch boilerplate in controllers.

```ts
router.post("/", asyncHandler(myController));
```

### `validate(schema, source?)`
Zod validation middleware. `source` defaults to `"body"` but can be `"query"` for GET endpoints. Returns `400` with the first Zod error message on validation failure.

### `errorHandler`
Global Express error handler. Catches anything that reaches it and returns `500` with `{ error: "Internal server error" }`.

---

## CORS

Origins are validated against an explicit allowlist built at startup. Requests from unlisted origins are rejected.

```ts
const allowedOrigins = [
  process.env.CLIENT_URL,   // production client URL
  "http://localhost:5173",  // Vite dev server
  "http://localhost:3000",  // optional local alternative
].filter(Boolean);
```

Set `CLIENT_URL` in your server environment to your deployed client URL (e.g. `https://gravitas-ai.vercel.app`).

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | Neon Postgres connection string |
| `GOOGLE_AI_KEY` | Yes | Google AI Studio API key |
| `CLIENT_URL` | Yes | Deployed client URL for CORS — no trailing slash |
| `GOOGLE_AI_MODEL` | No | Gemini model to use (default: `gemini-2.5-flash`) |
| `PORT` | No | Server port for local dev (default: `5000`) |

Create `server/.env` for local development. On Vercel, set these under **Project → Settings → Environment Variables**.

---

## Scripts

```bash
pnpm dev     # tsx watch — hot-reload TypeScript dev server on port 5000
pnpm build   # tsc — compiles TypeScript to dist/
pnpm start   # node dist/src/index.js — runs the compiled build
```

---

## Local Setup

```bash
cd server

# Install dependencies
pnpm install

# Create .env
cp .env.example .env   # or create manually — see env vars above

# Push schema to your Neon database
npx prisma db push

# Generate Prisma client
npx prisma generate

# Start dev server
pnpm dev
```

The API will be available at `http://localhost:5000`.

---

## Deployment (Vercel)

The server is structured to run as a Vercel serverless function.

### Architecture

```
server/
├── src/app.ts       ← Express app (no listen()) — shared between local and Vercel
├── src/index.ts     ← Local dev only — calls app.listen()
└── api/index.ts     ← Vercel entry — exports app as default
```

`server/vercel.json` routes every incoming request to `api/index.ts`:

```json
{
  "version": 2,
  "builds": [{ "src": "api/index.ts", "use": "@vercel/node" }],
  "routes": [{ "src": "/(.*)", "dest": "api/index.ts" }]
}
```

Vercel compiles `api/index.ts` on deploy — the `dist/` folder is never needed in the repository.

### Steps

1. Import the `server/` directory as a separate Vercel project
2. Set all required environment variables in Vercel project settings
3. Deploy — Vercel auto-detects `@vercel/node` and builds from TypeScript directly
4. Copy the deployed URL and set it as `VITE_API_URL` in your client Vercel project
