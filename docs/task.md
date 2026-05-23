# Tasks: User Story — Owner Login

---

## Task 1: Backend — Login Endpoint, JWT Issuance, and Auth Middleware

**Layer**: Backend

---

### User Story Context

**As an** owner
**I want to** log in with my username and password
**So that** I can access the admin dashboard to manage my short links

---

### Technical Scope

#### Endpoints

**POST** `/login` — Validate credentials and issue a JWT session cookie

- **Authentication**: None
- **Request**:
  ```json
  {
    "username": "string — the owner's username",
    "password": "string — the owner's plaintext password"
  }
  ```
- **Response (302)**:
  - Redirects to `/admin`
  - Sets `Set-Cookie` header: `token=<jwt>; HttpOnly; Secure; SameSite=Strict; Max-Age=604800`
- **Error Codes**:
  - `401` — Invalid username or password (generic message, no field hint)
  - `500` — Internal server error

**POST** `/logout` — Clear the JWT cookie and end the session *(referenced here; implemented in the Owner Logout story)*

#### Middleware

- `authMiddleware` in `src/middleware/auth.ts` — Reads the `token` cookie, verifies the JWT signature and expiry claim, and attaches the user ID to the Hono context. Applied to all `/admin/*` and `/api/*` routes. Redirects unauthenticated requests to `/login` with a 302.

#### Utility Helpers

- `signJwt(payload)` in `src/utils/jwt.ts` — Signs a JWT with HS256 using the `JWT_SECRET` env var; sets a 7-day expiry claim.
- `verifyJwt(token)` in `src/utils/jwt.ts` — Verifies the token signature and expiry; returns the decoded payload or throws on failure.

#### Handler

- `handleLogin` in `src/handlers/auth.ts` — Receives POST body, queries the `users` table for the username, compares the password against `password_hash` with bcrypt, calls `signJwt`, and sets the cookie. Returns a generic error response on any failure.

#### Database

- `users` table must exist with columns: `id`, `username`, `password_hash`
- Schema is initialized in `src/db/schema.ts` via `CREATE TABLE IF NOT EXISTS users`
- No migration needed — schema is idempotent on startup
- Credentials are pre-seeded; no INSERT logic is required in this task

---

### Notes

- `JWT_SECRET` must be provided as an environment variable and never committed to source control
- bcrypt comparison must be constant-time to prevent timing attacks — use a well-maintained Deno bcrypt library
- The generic error message ("Invalid username or password") must not distinguish between a wrong username and a wrong password
- JWT payload should carry only `userId` and `exp`; no roles, emails, or other sensitive data
- Cookie must be `HttpOnly`, `Secure`, `SameSite=Strict` — the frontend has no JavaScript access to the token
- `authMiddleware` must be registered before any `/admin/*` or `/api/*` route handlers in `main.ts`
- Task 2 (Frontend) depends on the `/login` POST endpoint being available

---

### Implementation Tasks

- [ ] Set up `src/db/client.ts` — SQLite connection singleton using Deno SQLite driver
- [ ] Set up `src/db/schema.ts` — `CREATE TABLE IF NOT EXISTS users` statement, run on app startup in `main.ts`
- [ ] Implement `signJwt` and `verifyJwt` in `src/utils/jwt.ts`
- [ ] Implement `handleLogin` in `src/handlers/auth.ts` — credential lookup, bcrypt verify, JWT issuance, cookie set
- [ ] Implement `authMiddleware` in `src/middleware/auth.ts` — JWT cookie extraction, verify, context attachment, redirect on failure
- [ ] Register `POST /login` route and auth middleware in `main.ts`
- [ ] Handle missing or malformed cookie in middleware without throwing unhandled errors
- [ ] Write unit tests for `signJwt` / `verifyJwt` helpers
- [ ] Write integration test: valid credentials → 302 to `/admin` + cookie set
- [ ] Write integration test: invalid credentials → 401 with generic message
- [ ] Write integration test: request to `/admin` without cookie → 302 to `/login`
- [ ] Code review

---

## Task 2: Frontend — Login Page (Hono JSX SSR)

**Layer**: Frontend

---

### User Story Context

**As an** owner
**I want to** log in with my username and password
**So that** I can access the admin dashboard to manage my short links

---

### Technical Scope

#### Route

**GET** `/login` — Renders the login page. If a valid JWT cookie is already present, redirects to `/admin` (handled in `src/handlers/auth.ts`).

#### Components

- `LoginPage` in `src/views/login.tsx` — Full-page server-rendered Hono JSX component. Contains:
  - Username input field (`name="username"`, `type="text"`, `required`)
  - Password input field (`name="password"`, `type="password"`, `required`)
  - Submit button
  - Inline error message area — conditionally rendered when an error string is passed as a prop (e.g., "Invalid username or password")
  - Form `action="/login"` `method="POST"`

- `Layout` in `src/views/layout.tsx` — Shared HTML shell (`<html>`, `<head>`, `<body>`) that wraps page components. `LoginPage` renders inside `Layout`.

#### Handler

- `handleLoginPage` in `src/handlers/auth.ts` — Renders `LoginPage` via Hono JSX. Accepts an optional error prop passed from a failed `POST /login` attempt (redirect back to GET `/login` with query param or flash state).

---

### Notes

- No JavaScript framework or client-side JS is needed — form submits natively via HTML POST
- Error state after a failed login should be communicated server-side (e.g., query param `?error=1` on redirect back to GET `/login`), not via client JS
- The form should preserve no field values after a failed login — both fields clear on re-render to avoid leaking the attempted password in the DOM
- Hono JSX renders synchronously on the server; no hydration step
- Depends on Task 1: the POST `/login` handler must exist for the form to submit to

---

### Implementation Tasks

- [ ] Implement `Layout` component in `src/views/layout.tsx` — shared HTML shell
- [ ] Implement `LoginPage` component in `src/views/login.tsx` — form + conditional error message
- [ ] Implement `handleLoginPage` GET handler in `src/handlers/auth.ts` — render login page, pass error prop if `?error` query param present
- [ ] Update `POST /login` handler to redirect back to `GET /login?error=1` on auth failure (instead of returning a raw error response)
- [ ] Register `GET /login` route in `main.ts`
- [ ] Verify form renders correctly and submits to `POST /login`
- [ ] Verify error message appears after a failed login attempt
- [ ] Verify both fields are empty after a failed login re-render
- [ ] Verify successful login redirects to `/admin` and sets cookie
- [ ] Code review
