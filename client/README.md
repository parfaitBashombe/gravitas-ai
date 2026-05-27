# GravitasAI — Client

The React SPA for GravitasAI. Built with Vite, TypeScript, Tailwind CSS v4, and React Router v7. Handles authentication via Neon Auth, communicates with the Express backend over a typed REST client, and renders AI-generated training plans with an animated, glassmorphic UI.

---

## Tech Stack

| Tool | Version | Purpose |
|---|---|---|
| React | 19 | UI framework |
| TypeScript | 5.9 | Type safety |
| Vite | 7 | Build tool and dev server |
| Tailwind CSS | v4 | Utility-first styling via CSS `@theme` |
| React Router | v7 | Client-side routing |
| `@neondatabase/neon-js` | 0.2.0-beta | Authentication (better-auth) + UI components |
| Lucide React | 0.577 | Icon library |
| pnpm | 10 | Package manager |

---

## Project Structure

```
client/
├── public/
│   └── favicon.svg               # Custom dumbbell SVG icon
├── src/
│   ├── components/
│   │   ├── navbar.tsx             # Top nav — profile dropdown + mobile slide drawer
│   │   ├── plan/
│   │   │   ├── plan-display.tsx   # Maps weekly schedule → DayCard list
│   │   │   ├── day-card.tsx       # Per-day glassmorphic card with exercise table
│   │   │   └── exercise-row.tsx   # Single exercise row with RPE badge
│   │   └── ui/
│   │       ├── button.tsx         # Button (default / secondary, sm / md / lg)
│   │       ├── card.tsx           # Base card (default / bordered variants)
│   │       ├── galaxy.tsx         # Animated spiral galaxy canvas — configurable
│   │       ├── hero-particles.tsx # Solar system canvas + CursorGlow component
│   │       ├── global-cursor-light.tsx  # App-wide ambient cursor glow
│   │       ├── black-hole.tsx     # Realistic black hole canvas (unused — kept)
│   │       ├── generation-loader.tsx    # Animated loader for AI plan generation
│   │       ├── input.tsx          # Controlled text input
│   │       ├── textarea.tsx       # Controlled textarea
│   │       ├── pill-select.tsx    # Grid of selectable pill buttons
│   │       └── select.tsx         # Native select wrapper
│   ├── context/
│   │   ├── auth-context.ts        # AuthContext type + useAuth hook
│   │   └── auth-provider.tsx      # Session, profile, plan state — saveProfile / generatePlan
│   ├── lib/
│   │   ├── api.ts                 # Typed REST client (reads VITE_API_URL)
│   │   └── auth.ts                # Neon authClient instance
│   ├── pages/
│   │   ├── Home.tsx               # Landing page (hero, how it works, features, CTA)
│   │   ├── Auth.tsx               # Sign in / sign up with galaxy background
│   │   ├── Onboarding.tsx         # 4-step wizard: goal → experience → schedule → injuries
│   │   ├── Profile.tsx            # Training plan display with dual galaxy
│   │   └── Account.tsx            # Account management (Neon Auth UI)
│   ├── types/
│   │   └── index.ts               # Shared types: User, UserProfile, TrainingPlan, DaySchedule, Exercise
│   ├── App.tsx                    # Root: providers, BrowserRouter, routes
│   ├── main.tsx                   # ReactDOM.createRoot entry point
│   └── index.css                  # Tailwind v4 @theme tokens + animations + base styles
├── index.html                     # Vite HTML shell
├── vite.config.ts                 # Vite config (react + tailwindcss plugins)
├── tsconfig.json                  # Root TS references config
├── tsconfig.app.json              # App TS config (strict, bundler module resolution)
├── tsconfig.node.json             # Node TS config (vite.config.ts)
└── vercel.json                    # SPA rewrite rule for Vercel
```

---

## Routes

| Path | Component | Requires Auth |
|---|---|---|
| `/` | `Home` | No |
| `/auth/:pathname` | `Auth` | No |
| `/account/:pathname` | `Account` | Yes |
| `/onboarding` | `Onboarding` | Yes |
| `/profile` | `Profile` | Yes |

---

## Auth & Data Loading

The `AuthProvider` runs a two-phase sequence on every page load to prevent race conditions:

**Phase 1 — Auth** (`isLoading`)
Calls `authClient.getSession()` to hydrate the current user from the session cookie.

**Phase 2 — Data** (`isDataReady`)
Once the user ID is known, fetches the profile and plan in parallel:

```ts
const [profileRes, planData] = await Promise.all([
  api.getProfile(userId).catch(() => null),
  api.getCurrentPlan(userId).catch(() => null),
]);
```

`isDataReady` flips to `true` only after both fetches settle (success or failure). Protected pages guard on both flags:

```ts
if (!isDataReady) return null;                              // still loading data
if (!user) return <Navigate to="/auth/sign-in" replace />; // not logged in
if (!plan)  return <Navigate to="/onboarding" replace />;  // no plan yet
```

Without this pattern, `plan = null` during the data fetch would incorrectly redirect a returning user to `/onboarding` on every refresh.

---

## Styling System

Tailwind v4 defines design tokens directly in CSS via `@theme` — there is no `tailwind.config.js`.

### Design Tokens (`src/index.css`)

```css
@theme {
  --font-sans:          "Geist", system-ui, sans-serif;
  --color-background:   #0d0d0d;
  --color-foreground:   #f5f5f4;
  --color-muted:        #a3a3a3;
  --color-border:       #262626;
  --color-card:         #171717;
  --color-accent:       #f97316;
  --color-accent-hover: #ea580c;
}
```

### Glassmorphism Pattern

All elevated surfaces (modals, cards, day cards) use this consistent pattern:

```html
<div class="bg-black/40 backdrop-blur-xl border border-white/8 rounded-2xl">
```

### Neon Auth UI Compatibility

The Neon Auth component library reads shadcn-style CSS variables (`--background`, `--primary`, `--border`, etc.). These are defined in `@layer base` in `index.css`, mapping GravitasAI tokens to the expected names so the auth UI inherits the correct dark-orange theme automatically.

---

## Canvas Components

### `<Galaxy />`

Animated spiral galaxy rendered on a `<canvas>` element. Generates ~2,050 stars across three populations (spiral arms, central bulge, outer halo) with differential rotation, twinkling, and a pulsing orange nucleus.

**Props:**

| Prop | Type | Default | Description |
|---|---|---|---|
| `x` | `number` | `0.70` | Galaxy center X as fraction of canvas width |
| `y` | `number` | `0.50` | Galaxy center Y as fraction of canvas height |
| `scale` | `number` | `1` | Uniform geometry scale multiplier |
| `opacity` | `number` | `1` | Canvas-level alpha |
| `drawBackground` | `boolean` | `true` | Whether to paint the warm dark background gradient |

The Profile page composes two galaxies — primary upper-right, secondary lower-left at 60% scale and 55% opacity with `drawBackground={false}` to avoid covering the first.

### `<HeroParticles />`

Solar-system-style orbital animation used on the Home page and auth pages.

### `<CursorGlow />`

Mouse-tracking radial ambient light. Used on Onboarding and Profile.

### `<GlobalCursorLight />`

Subtler, app-wide cursor glow mounted at the root in `App.tsx`.

---

## API Client (`src/lib/api.ts`)

Minimal typed REST client. `BASE_URL` reads from `VITE_API_URL` at build time:

```ts
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
```

| Function | Method | Endpoint |
|---|---|---|
| `api.getProfile(userId)` | GET | `/api/profile?userId=` |
| `api.saveProfile(userId, data)` | POST | `/api/profile` |
| `api.getCurrentPlan(userId)` | GET | `/api/plan/current?userId=` |
| `api.generatePlan(userId, opts)` | POST | `/api/plan/generate` |

All methods throw a descriptive `Error` on non-2xx responses, propagated to the calling UI component.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | Yes | Server base URL — e.g. `https://gravitas-api.vercel.app` |
| `VITE_NEON_AUTH_URL` | Yes | Neon Auth base URL from your Neon project dashboard |

Create `client/.env` for local dev. On Vercel, set these under **Project → Settings → Environment Variables**.

`VITE_*` variables are inlined at build time — they must be present before running `pnpm build`.

---

## Scripts

```bash
pnpm dev       # Vite dev server at http://localhost:5173 with HMR
pnpm build     # Type-check (tsc -b) then bundle — output in dist/
pnpm preview   # Serve the production bundle locally
pnpm lint      # Run ESLint
```

---

## Deployment (Vercel)

`client/vercel.json` rewrites every path to `index.html` so React Router handles all navigation client-side:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

Without this, navigating directly to `/profile` or refreshing on any nested route would return a 404 from Vercel's CDN.

**Vercel project settings:**
- **Root directory:** `client`
- **Build command:** `pnpm build`
- **Output directory:** `dist`
- **Environment variables:** `VITE_API_URL`, `VITE_NEON_AUTH_URL`
