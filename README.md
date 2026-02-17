## SolveOn

SolveOn is a **full‑stack coding practice platform**. It provides a modern, dark‑themed web UI for solving algorithmic problems with a real‑time code runner, submissions tracking, dashboard analytics, and leaderboards, backed by a Node/Express + MongoDB API.

### Features

- **Authentication & Accounts**: Email/password signup, login, password reset, and protected routes in the frontend.
- **Problems Library**: Filterable/sortable list of coding problems with difficulty, tags, and rich problem detail pages.
- **Built‑in Editor & Runner**: In‑browser code editor with multi‑language starter code (JavaScript, Python, Java, C++) and test runner.
- **Submissions & History**: Submit solutions, view verdicts (accepted, wrong answer, etc.), and see recent activity.
- **Dashboard Analytics**: Streaks, problems solved, total submissions, acceptance rate, points, rank, and activity timeline.
- **Leaderboards**: Global rankings with points and streak info.
- **Discussions**: Per‑problem discussion threads and replies.

### Tech Stack

- **Frontend**: React 18, TypeScript, Vite, React Router, Tailwind CSS, Lucide icons.
- **Backend**: Node.js, Express 5, MongoDB (Mongoose).
- **Auth & Security**: JWT‑based auth, protected API routes, cookies/local storage for tokens.
- **Other Services**: Judge0 (or similar) integration for code execution.

## Project Structure

High‑level layout:

- `frontend/` – Vite + React + TypeScript SPA.
- `backend/` – Express + Mongoose REST API.
- Root‑level `package.json` – shared editor/dev dependencies for the monorepo.

Key backend modules (in `backend/`):

- `server.js` – Express app bootstrap, MongoDB connection, and route mounting.
- `routes/` – Feature routes: `authRoutes`, `problemRoutes`, `submissionRoutes`, `userRoutes`, `testRoutes`, `codeExecutionRoutes`, `leaderboardRoutes`, `dashboardRoutes`.
- `controllers/` – Business logic for auth, problems, submissions, dashboard, leaderboard, code execution, etc.
- `models/` – Mongoose models: `User`, `Problem`, `Submission`, `Counter`, and more.
- `utils/` – Helpers such as `judge0Client` for code execution and `mailer` for email.
- `middleware/` – Auth (`protect`) and error handling.

Key frontend modules (in `frontend/`):

- `src/App.tsx` – Routing and protected application shell.
- `src/contexts/AuthContext.tsx` – Authentication state and helpers.
- `src/lib/api.ts` – Typed API client wrapping the backend (`/auth`, `/problems`, `/submissions`, `/tests`, `/dashboard`, `/leaderboard`, etc.).
- `src/components/` – UI:
  - `auth/` – `LoginPage`, `SignupPage`, `ResetPasswordPage`.
  - `dashboard/` – `Dashboard`, `StatsCard`, `RecentActivity`.
  - `problems/` – `ProblemsPage`, `ProblemDetailPage`, `CodeEditor`, `TestResults`, `DiscussionSection`, filters and cards.
  - `leaderboard/` – `LeaderboardPage`.
  - `layout/` – `Navbar` and shell components.

The frontend also includes a detailed `SETUP.md` specific to the UI and Supabase‑style schema inspiration.

## Setup & Installation

### Prerequisites

- Node.js 18+ installed.
- Local MongoDB instance or hosted MongoDB URI.

### 1. Clone and install dependencies

```bash
git clone <https://github.com/KomalGoel18/SolveOn>
cd SolveOn

# install root‑level tooling deps (optional, for editors)
npm install

# install backend deps
cd backend
npm install

# install frontend deps
cd ../frontend
npm install
```

### 2. Configure environment variables

#### Backend (`backend/.env`)

The backend expects at least:

```env
MONGO_URI=mongodb://127.0.0.1:27017/solveon
PORT=5000
JWT_SECRET=local_dev_secret

# Optional, for email features
SMTP_HOST=...
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
```

> A sample `.env` is already present in `backend/.env` for local development. Update it as needed for your environment.

#### Frontend (`frontend/.env.local` or `.env`)

The frontend talks to the API via `VITE_API_BASE_URL`:

```env
# Local development
VITE_API_BASE_URL=http://localhost:5000/api

# Example production
VITE_API_BASE_URL=https://solveon-backend.onrender.com/api
```

`frontend/.env.local` is preconfigured for local dev; adjust for your own backend URL if different.

## Running the app locally

### 1. Start the backend (API)

```bash
cd backend
npm run dev    # nodemon server.js, listens on PORT (default 5000)
```

This will:

- Load configuration from `backend/.env`.
- Connect to MongoDB via `MONGO_URI`.
- Expose REST endpoints under `/api/*` (e.g. `/api/auth`, `/api/problems`, `/api/submissions`, `/api/dashboard`, `/api/leaderboard`, `/api/code/execute`, etc.).
- Provide a basic health check at `/api/health`.

### 2. Start the frontend (SPA)

In a separate terminal:

```bash
cd frontend
npm run dev
```

By default Vite runs on `http://localhost:5173` and proxies requests to the backend via `VITE_API_BASE_URL` (make sure this points to your backend).

You can now sign up, browse problems, run code, submit solutions, see your dashboard, and check leaderboards.

## Build & Production

### Frontend

```bash
cd frontend
npm run build      # create optimized production build
npm run preview    # preview the production build locally
```

Serve the built assets (`frontend/dist`) behind any static file host, configured to forward `/api/*` to the backend.

### Backend

```bash
cd backend
npm run start      # node server.js
```

Deploy the backend to your preferred Node hosting (Render, Railway, Heroku‑like platforms, own server, etc.), ensuring:

- Environment variables (`MONGO_URI`, `JWT_SECRET`, `PORT`, SMTP settings) are configured.
- The frontend’s `VITE_API_BASE_URL` points to the deployed backend’s `/api` base URL.

## API Overview

All endpoints are prefixed with `/api`:

- **Auth**: `/api/auth/register`, `/api/auth/login`, `/api/auth/forgot-password`, `/api/auth/reset-password/:token`.
- **Problems**: `/api/problems` (list with filters), `/api/problems/:number` (single problem by number).
- **Submissions**: `/api/submissions` (submit), `/api/submissions/user` (current user history), `/api/submissions/:id`.
- **Tests**: `/api/tests/run` – run code against sample tests for a problem.
- **Code Execution**: `/api/code/execute` – direct Judge0‑style execution endpoint.
- **Dashboard**: `/api/dashboard` – stats, streak, points, activity.
- **Leaderboard**: `/api/leaderboard` – ranking and stats.
- **Users**: `/api/users/*` – user‑related endpoints (profile, etc.).

Some routes require a valid JWT in the `Authorization: Bearer <token>` header.

## Development Notes

- The codebase is written with **TypeScript on the frontend** and modern **ES modules** on the backend.
- Frontend API helpers in `src/lib/api.ts` centralize HTTP logic and error handling.
- Protected routes are implemented via an `AuthProvider` and `ProtectedApp` wrapper in `App.tsx`.
- Tailwind CSS is used for all styling, with a dark, gradient‑heavy design.

For more detailed UI‑specific documentation and schema notes, see `frontend/SETUP.md`.

## License

This project is currently intended as a portfolio/demo application. Adjust licensing text as needed before public release.

