## User Story: Owner Logout

**Layer**: Backend

---

### User Story Context

**As an** owner\
**I want to** log out of the admin dashboard\
**So that** my session is ended and my links are protected on shared or
untrusted devices

---

### Technical Scope

#### Endpoints

**POST** `/auth/logout` — Clears the JWT cookie and ends the session

- **Authentication**: Required (JWT cookie must be present, but failure should
  still clear cookie and redirect)
- **Request**: No body
- **Response (302)**: Redirect to `/login`
- **Error Codes**:
  - `302` — Always redirects to `/login`; no error state exposed to the client

#### Cookie Handling

- Overwrite the `token` httpOnly cookie with an expired value (`Max-Age=0` or
  `expires` in the past)
- Cookie attributes must match the original: `httpOnly`, `Secure`,
  `SameSite=Strict`

#### Database Changes

- None — no server-side session table exists; session state lives entirely in
  the cookie and JWT claims

---

### Notes

- Cookie expiry is the sole invalidation mechanism — there is no server-side
  revocation list
- The logout handler must clear the cookie even if the JWT is already expired or
  invalid; the handler should not reject the request due to a bad token
- Auth middleware on `/admin/*` and `/api/*` routes already enforces that
  expired/missing cookies redirect to `/login`, so a cleared cookie immediately
  prevents further access on any tab upon the next request
- "Logout on one tab prevents access on other tabs without a page reload
  revealing protected content" is handled naturally by the cookie being cleared
  — next navigation or API call from any tab will fail auth

---

### Implementation Tasks

- [ ] Add `POST /auth/logout` route to the Hono app (e.g. in
      `src/handlers/auth.tsx`)
- [ ] Implement logout handler: overwrite `token` cookie with expired value,
      then redirect 302 to `/login`
- [ ] Ensure cookie attributes (`httpOnly`, `Secure`, `SameSite=Strict`) match
      those set at login
- [ ] Register the route in `main.ts` (or wherever auth routes are mounted)
- [ ] Verify auth middleware still blocks `/admin` after cookie is cleared

---

## User Story: Owner Logout

**Layer**: Frontend

---

### User Story Context

**As an** owner\
**I want to** log out of the admin dashboard\
**So that** my session is ended and my links are protected on shared or
untrusted devices

---

### Technical Scope

#### Components

- `dashboard.tsx` (or `layout.tsx`) — Add a logout button visible on the admin
  dashboard at all times
  - The button must submit a `POST` request to `/auth/logout`
  - Implement as an HTML `<form method="POST" action="/auth/logout">` with a
    submit button — no JavaScript required
  - Button should be clearly labelled "Logout" and placed in a consistent,
    discoverable location (e.g. top navigation bar or header)

---

### Notes

- No JavaScript is needed; a plain HTML form POST is sufficient given the
  SSR-only frontend
- Depends on the Backend task: `/auth/logout` endpoint must exist before the
  button can be wired up
- The form POST approach also works correctly when JavaScript is disabled in the
  browser

---

### Implementation Tasks

- [ ] Add logout `<form>` with a submit button to the admin dashboard layout
      (`layout.tsx` or `dashboard.tsx`)
- [ ] Confirm the button is visible on all admin pages that use the shared
      layout
- [ ] Manually verify: click logout → redirected to `/login` → visiting `/admin`
      redirects back to `/login`
