# GravitasAI

> **AI-powered personal training, built for everyone.**

GravitasAI turns a 2-minute questionnaire into a complete, science-backed training program — tailored to your goal, schedule, experience level, and equipment. No generic templates, no guesswork. Just a plan that's actually yours.

---

## The Problem

The fitness industry sells two things: expensive personal trainers most people can't afford, and generic programs that treat every athlete the same. Neither works.

A beginner trying to bulk with only dumbbells at home needs a completely different program than an advanced lifter cutting at a commercial gym — yet every app gives them the same 12-week template. Progress stalls. People quit.

---

## The Solution

GravitasAI uses large language models to generate training programs with the same nuance a world-class coach would apply — accounting for your specific goal, training age, available equipment, weekly availability, preferred training split, and any physical limitations.

The result is a fully structured weekly program: every training day, every exercise, every set, rep, rest period, and RPE target. Personalized. Versioned. Regeneratable on demand.

---

## Key Features

### Intelligent Plan Generation
- **5 training goals** — Bulk, Cut, Recomposition, Strength, Endurance
- **3 experience levels** — Beginner, Intermediate, Advanced
- **3 equipment tiers** — Full gym, Home gym, Dumbbells only
- **4 training splits** — Full body, Upper/Lower, Push/Pull/Legs, AI-decided
- **Injury & limitation awareness** — the AI avoids contraindicated movements

### Complete Program Output
- Full weekly schedule with day-by-day training structure
- Every exercise prescribed with sets, reps, rest periods, and RPE targets
- Alternative exercises for every movement
- Detailed progressive overload strategy tailored to experience level
- Coach-style program notes explaining the methodology

### Versioned Plans
- Plans are versioned — regenerate any time your goals or schedule change
- Full history preserved in the database
- One-click regeneration from the profile page

### Beautiful, Immersive UI
- Dark-first design with an animated spiral galaxy background
- Glassmorphic card system for high readability on dark backgrounds
- Cursor-following ambient light effect
- Fully responsive from mobile to desktop
- Animated 4-step onboarding wizard — no scrolling required

---

## How It Works

```
User answers 4 steps → Profile saved to DB → Gemini generates plan → Plan stored as JSON → Displayed instantly
```

1. **Onboarding** — A no-scroll, 4-step wizard collects goal, experience, split preference, schedule, equipment, and any injuries
2. **AI Generation** — The server sends a structured prompt to Google Gemini 2.5 Flash and parses the JSON response
3. **Storage** — The plan is stored in Neon Postgres alongside the user profile, versioned automatically
4. **Display** — The profile page renders the full plan with glassmorphic day cards, RPE badges, and a progression strategy section

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Vercel (CDN)                         │
│  ┌──────────────────────┐   ┌──────────────────────────┐    │
│  │   Client (React SPA) │   │   Server (Express + Node) │   │
│  │   Vite · Tailwind v4 │   │   Serverless via @vercel/ │   │
│  │   React Router v7    │   │   node                    │   │
│  └──────────┬───────────┘   └────────────┬─────────────┘   │
└─────────────┼────────────────────────────┼─────────────────┘
              │                            │
              │  REST API                  │
              └───────────→ /api/*  ←──────┘
                                           │
                         ┌─────────────────┼──────────────────┐
                         │                 │                  │
                    ┌────▼────┐    ┌───────▼──────┐   ┌──────▼─────┐
                    │ Neon DB │    │ Google Gemini │   │  Neon Auth │
                    │Postgres │    │  2.5 Flash   │   │  (better-  │
                    │         │    │              │   │   auth)    │
                    └─────────┘    └──────────────┘   └────────────┘
```

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite 7, Tailwind CSS v4 |
| Routing | React Router v7 |
| Authentication | Neon Auth (`@neondatabase/neon-js`) |
| Backend | Express 5, Node.js, TypeScript |
| Database | Neon Postgres (serverless Postgres) |
| ORM | Prisma 7 with `@prisma/adapter-pg` |
| AI | Google Gemini 2.5 Flash via REST API |
| Deployment | Vercel (client as static SPA, server as serverless functions) |
| Package Manager | pnpm 10 |

---

## Project Structure

```
gravitas-ai/
├── client/          # React SPA — see client/README.md
├── server/          # Express API — see server/README.md
└── README.md        # This file
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm 10+
- A [Neon](https://neon.tech) project (for Postgres + Auth)
- A [Google AI Studio](https://aistudio.google.com) API key

### 1. Clone
```bash
git clone https://github.com/parfaitBashombe/gravitas-ai.git
cd gravitas-ai
```

### 2. Install dependencies
```bash
cd client && pnpm install
cd ../server && pnpm install
```

### 3. Configure environment variables

**`server/.env`**
```env
DATABASE_URL=postgresql://...          # Neon connection string
GOOGLE_AI_KEY=AIza...                  # Google AI Studio key
CLIENT_URL=http://localhost:5173       # Client origin for CORS
GOOGLE_AI_MODEL=gemini-2.5-flash      # Optional — default shown
```

**`client/.env`**
```env
VITE_API_URL=http://localhost:5000     # Backend base URL
VITE_NEON_AUTH_URL=https://...        # From Neon project dashboard
```

### 4. Run the database migrations
```bash
cd server && npx prisma db push
```

### 5. Start development servers
```bash
# Terminal 1 — server
cd server && pnpm dev

# Terminal 2 — client
cd client && pnpm dev
```

The app will be available at `http://localhost:5173`.

---

## Deployment

Both the client and server are configured for zero-config Vercel deployment via their respective `vercel.json` files.

See [client/README.md](client/README.md) and [server/README.md](server/README.md) for full deployment instructions.

---

## Roadmap

- [ ] Workout logging — track completed sessions
- [ ] Progress tracking — charts and personal records
- [ ] Plan history — browse and restore previous versions
- [ ] Exercise library — searchable, with video demonstrations
- [ ] Push notifications — daily training reminders
- [ ] Social features — share plans and progress

---

## License

ISC
