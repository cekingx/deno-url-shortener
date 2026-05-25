# Task Decomposition — Create a Short Link

---

## Task 1: Backend — Domain, Repository, and Service for Link Creation

**Layer**: Backend

---

### User Story Context

**As an** owner
**I want to** create a short link from a destination URL
**So that** I can share a short, memorable link that redirects to any long URL I choose

---

### Technical Scope

#### New Files

- `src/domain/link.ts` — `Link` domain class with properties: `id`, `shortCode`, `destinationUrl`, `customAlias`, `expiresAt`, `createdAt`, `clickCount`. No framework or DB imports.
- `src/repositories/link.repository.ts` — `LinkRepository` interface and `SqliteLinkRepository` implementation.
- `src/services/link.service.ts` — `LinkService` with link creation business logic.
- `src/utils/codegen.ts` — Random 6-character alphanumeric short code generator (already listed in architecture doc, must be created).
- `src/services/link.service.test.ts` — Unit tests for `LinkService`.

#### Repository Methods (`LinkRepository`)

- `create(link: Omit<Link, 'id' | 'createdAt' | 'clickCount'>): Link` — Inserts a new row into `links`, returns the created `Link` domain object.
- `findAll(): Link[]` — Returns all links ordered by `created_at DESC`.
- `findByShortCode(code: string): Link | undefined` — Used by service to check alias uniqueness before insert.

#### Service Method (`LinkService`)

- `create(destination: string, alias?: string, expiresAt?: string): Promise<Link | Error>`
  - Returns `Error('invalid_url')` if `destination` is not a valid absolute URL (must start with `http://` or `https://`).
  - If `alias` is provided, checks uniqueness via `findByShortCode`; returns `Error('duplicate_alias')` if taken.
  - If no alias, generates a 6-character random code via `codegen.ts`.
  - Calls `repo.create(...)` and returns the new `Link`.

#### Constructor Dependencies (`LinkService`)

- `LinkRepository` — injected interface
- No direct DB, no HTTP, no Hono imports — keeps the service unit-testable with stubs.

#### Database Changes

- No schema changes needed — `links` table already exists in `src/db/schema.ts`.

---

### Notes

- Follow the existing stub-factory pattern from `auth.service.test.ts` for unit tests — no mocking library, plain inline objects.
- The `findByShortCode` uniqueness check is a best-effort pre-check; the `UNIQUE` constraint on `short_code` in SQLite is the authoritative guard. The service should treat a DB-level unique violation as `Error('duplicate_alias')` as well.
- `expiresAt` arrives as a string from the form (`datetime-local` input). The service should pass it through as-is to the repository; the repository stores it in SQLite as a DATETIME string.
- This task blocks Task 2 (handler cannot call a service that doesn't exist).

---

### Implementation Tasks

- [ ] Create `src/domain/link.ts` with the `Link` class
- [ ] Create `src/utils/codegen.ts` with a `generateShortCode(): string` function (6 random alphanumeric chars)
- [ ] Create `src/repositories/link.repository.ts` with `LinkRepository` interface and `SqliteLinkRepository`
- [ ] Implement `create`, `findAll`, and `findByShortCode` repository methods
- [ ] Create `src/services/link.service.ts` with `LinkService` constructor accepting `LinkRepository`
- [ ] Implement `create` method with URL validation, alias uniqueness check, code generation, and repo call
- [ ] Write unit tests in `src/services/link.service.test.ts` covering: valid creation with alias, valid creation without alias (auto-code), invalid URL, duplicate alias
- [ ] Run `deno task test` and confirm all tests pass

---

## Task 2: Backend — HTTP Handler for Link Creation

**Layer**: Backend

---

### User Story Context

**As an** owner
**I want to** create a short link from a destination URL
**So that** I can share a short, memorable link that redirects to any long URL I choose

---

### Technical Scope

#### New Endpoint

**POST** `/admin/links` — Create a short link (form submission)

- **Authentication**: Required — already enforced by `authMiddleware` on all `/admin/*` routes
- **Request**: `application/x-www-form-urlencoded` form body
  ```
  destination  string, required — the destination URL
  alias        string, optional — custom short code alias
  expires_at   string, optional — datetime-local value (e.g. "2026-12-31T23:59")
  ```
- **Response (success)**: `302` redirect to `/admin?success=1`
- **Response (invalid_url)**: `302` redirect to `/admin?error=invalid_url&destination=<value>&alias=<value>&expires_at=<value>`
- **Response (duplicate_alias)**: `302` redirect to `/admin?error=duplicate_alias&destination=<value>&alias=<value>&expires_at=<value>`

#### Updated Endpoint

**GET** `/admin` — Dashboard page (already exists in `src/handlers/admin.tsx`)

- Update `handleDashboard` to call `linkService.findAll()` and pass the link list to `DashboardPage`.
- `DashboardPage` will be updated in Task 3 to render the list.

#### Files to Create / Modify

- `src/handlers/links.ts` — New file. `handleCreateLink(c: Context)` handler: parses form body, calls `c.var.linkService.create(...)`, redirects based on result.
- `src/handlers/admin.tsx` — Update `handleDashboard` to fetch links from `c.var.linkService` and forward them as a prop to `DashboardPage`.
- `src/context.ts` — Add `linkService: LinkService` to the `Variables` interface.
- `main.ts` — Instantiate `SqliteLinkRepository` and `LinkService`, inject into Hono context via middleware, register `POST /admin/links` route.

---

### Notes

- Preserve the existing redirect-with-form-values pattern already wired in `handleDashboard` — it re-populates the form on error. The form values must be URL-encoded when appended to the redirect query string.
- `handleCreateLink` follows the same error-as-value pattern as `AuthService`: check `instanceof Error`, then branch on `result.message` to pick the right error key.
- `linkService` must be added to `Variables` in `src/context.ts` so TypeScript resolves `c.var.linkService` correctly in handlers.
- Depends on Task 1 being completed first.

---

### Implementation Tasks

- [ ] Add `linkService: LinkService` to `Variables` in `src/context.ts`
- [ ] Instantiate `SqliteLinkRepository` and `LinkService` in `main.ts` and inject into context
- [ ] Create `src/handlers/links.ts` with `handleCreateLink` handler
- [ ] Parse `destination`, `alias`, and `expires_at` from the form body in the handler
- [ ] Call `c.var.linkService.create(...)` and redirect based on `Error` result or success
- [ ] URL-encode form values in the redirect query string on error so the form re-populates correctly
- [ ] Register `app.post('/admin/links', handleCreateLink)` in `main.ts`
- [ ] Update `handleDashboard` to call `linkService.findAll()` and pass links to `DashboardPage`
- [ ] Manual smoke test: submit valid URL, submit invalid URL, submit duplicate alias — verify correct redirects and form re-population

---

## Task 3: Frontend — Dashboard Link List View

**Layer**: Frontend

---

### User Story Context

**As an** owner
**I want to** create a short link from a destination URL
**So that** I can share a short, memorable link that redirects to any long URL I choose

---

### Technical Scope

#### Components to Modify

- `src/views/dashboard.tsx` — `DashboardPage`
  - Accept a `links: Link[]` prop (imported from `src/domain/link.ts`).
  - Replace the placeholder `<section>` ("No links yet...") with a dynamic link list.
  - When `links` is empty, render an empty state message directing the owner to the create form above.
  - When `links` is non-empty, render a table with one row per link.

#### Link Table Columns (per PRD acceptance criteria)

- **Short URL** — full short URL as a clickable link opening in a new tab. Constructed from the request host + `link.shortCode`. Pass the base URL as a prop from the handler.
- **Destination** — destination URL, visually truncated if long (CSS `truncate` / `max-w-*`), full URL in the underlying `<a>` href.
- **Clicks** — `link.clickCount` as a plain number.
- **Expires** — `link.expiresAt` formatted as a date string, or "Never" if null. Show an "Expired" badge if `expiresAt` is in the past.
- **Actions** — Edit button (links to `/admin/links/:id/edit`, placeholder for now) and Delete button (placeholder for now; wired in a future story).

#### UX Details

- New link should appear at the top of the list (repository `findAll` returns links in `created_at DESC` order — no extra sorting needed in the view).
- After a successful creation, the success banner is shown (already implemented) and the new link is visible at the top of the list.
- The form section and link list section are visually separated (already uses `<section>` cards with `mb-8`).

---

### Notes

- The base URL for constructing short URLs must be passed from the handler (available via `c.req.url` or a configured env var) — avoid hardcoding it in the view.
- Destination URL truncation should be CSS-only (Tailwind `truncate` class on a fixed-width cell) — no JavaScript needed.
- The "Expired" badge logic compares `link.expiresAt` against the current date at render time (server-side, so `new Date()` in the JSX).
- Edit and Delete buttons can render as unstyled anchors/forms with placeholder hrefs for now; they will be wired in the Edit and Delete user stories.
- Depends on Tasks 1 and 2 (needs the `Link` domain type and the handler passing `links` as a prop).

---

### Implementation Tasks

- [ ] Add `links: Link[]` and `baseUrl: string` props to `DashboardPageProps` in `src/views/dashboard.tsx`
- [ ] Render empty state message when `links.length === 0`
- [ ] Render the link table when `links.length > 0`
- [ ] Implement each table column: short URL (clickable, new tab), destination (truncated), clicks, expiry (with "Expired" badge), actions (edit/delete placeholders)
- [ ] Pass `baseUrl` from `handleDashboard` in `src/handlers/admin.tsx` using `new URL(c.req.url).origin`
- [ ] Verify the success banner appears above the list after a successful creation
- [ ] Verify the most recently created link appears first in the list
- [ ] Visual check: long destination URLs are truncated without breaking the table layout
- [ ] Visual check: expired links show the "Expired" badge
