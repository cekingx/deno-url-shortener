# Tasks

---

## User Story: Edit a Short Link

**As an** owner
**I want to** edit an existing short link
**So that** I can update where it points, change its alias, or adjust its expiration without deleting and recreating it

---

### Task 1: Repository & Service — Edit Link

**Layer**: Backend (Repository + Service)

---

#### Technical Scope

##### Repository Changes (`src/repositories/link.repository.ts`)

- `findById(id: number): Link | undefined` — fetch a single link row by primary key and map it to a `Link` domain object; used to pre-populate the edit form and validate the link exists before updating
- `update(id: number, fields: { destinationUrl: string; customAlias: string | null; expiresAt: Date | null }): Link | Error` — execute an `UPDATE` on the `links` row for the given id, setting `destination_url`, `custom_alias`, `expires_at`, and `updated_at`; the alias uniqueness check (`custom_alias` unique constraint) must exclude the row being updated (i.e. `WHERE id != :id`)

##### Service Changes (`src/services/link.service.ts`)

- `updateLink(id: number, destinationUrl: string, customAlias: string | null, expiresAt: Date | null): Promise<Link | Error>` — orchestrates the edit flow:
  1. Validate `destinationUrl` is a valid absolute URL (`http://` or `https://`); return `Error` if not
  2. If `customAlias` is provided, check it is not already used by a different link; return `Error` if duplicate
  3. Call `LinkRepository.update` and return the updated `Link` or propagate the `Error`
  4. Must follow the `T | Error` return convention — never throw for business failures

##### Database Changes

- No schema changes — `links` table already has all required columns (`destination_url`, `custom_alias`, `expires_at`, `updated_at`)

---

#### Notes

- `findById` is also needed by the handler to load the current link data before rendering the edit form; add it to the `LinkRepository` interface
- The alias uniqueness check on update must use `WHERE custom_alias = :alias AND id != :id` — not just the unique constraint — to distinguish "same alias, same link" (valid) from "alias taken by another link" (error)
- Setting `customAlias` to `null` (form field left blank) must clear the `custom_alias` column and allow the `short_code` to remain as the original generated code
- Setting `expiresAt` to `null` (form field cleared) must write `NULL` to `expires_at` — make sure the SQL binding handles `null` correctly with the SQLite driver

---

#### Implementation Tasks

- [ ] Add `findById(id: number): Link | undefined` to `LinkRepository` interface and `SqliteLinkRepository`
- [ ] Add `update(id, fields)` to `LinkRepository` interface and `SqliteLinkRepository`
- [ ] Add `updateLink(id, destinationUrl, customAlias, expiresAt)` to `LinkService`
- [ ] Validate absolute URL in `updateLink` (reuse existing validation logic if present)
- [ ] Implement alias-uniqueness check excluding current link id
- [ ] Handle `null` alias and `null` expiresAt correctly in the SQL binding
- [ ] Write unit tests for `updateLink` in `link.service.test.ts` covering: success, invalid URL, duplicate alias (different link), same alias (same link, valid), clear expiry date

---

### Task 2: Handler & View — Edit Link Page

**Layer**: Frontend (Handler + Hono JSX View)

---

#### Technical Scope

##### Handler Changes (`src/handlers/admin.ts` or `src/handlers/links.ts`)

- `GET /admin/links/:id/edit` — protected by auth middleware; call `LinkService.findById` (or `LinkRepository.findById` via service), render `EditLinkPage` with the link's current values pre-populated; return 404 if the link does not exist
- `POST /admin/links/:id/edit` — protected by auth middleware; parse `destination_url`, `custom_alias`, and `expires_at` from the form body; call `LinkService.updateLink`; on success redirect to `/admin`; on `Error` re-render `EditLinkPage` with the submitted values and an inline error message

##### View (`src/views/edit.tsx`)

- `EditLinkPage` — Hono JSX page using the shared `Layout`; renders an edit form with:
  - `destination_url` text input, pre-populated with the current destination URL
  - `custom_alias` text input, pre-populated with the current alias (empty if none)
  - `expires_at` date input, pre-populated with the current expiry (empty if none)
  - A save button that submits `POST /admin/links/:id/edit`
  - Inline error message area shown when a validation error is passed from the handler
  - A cancel link back to `/admin`

##### Dashboard Changes (`src/views/dashboard.tsx`)

- Add an "Edit" button/link on each link row pointing to `/admin/links/:id/edit`

---

#### Notes

- The form `action` must include the link id: `action="/admin/links/{id}/edit"`
- On validation error, the handler must pass back the submitted field values (not the DB values) so the form stays populated with what the user typed
- The `expires_at` date input value must be formatted as `YYYY-MM-DD` for the HTML `<input type="date">` element; parse it back to a `Date` (or `null`) on POST
- An empty string from the `custom_alias` or `expires_at` fields must be treated as `null` in the handler before passing to the service
- Auth middleware already covers all `/admin/*` routes — no extra middleware wiring needed
- Depends on Task 1 (`findById`, `updateLink`) being complete before the handler can be wired

---

#### Implementation Tasks

- [ ] Register `GET /admin/links/:id/edit` route in the Hono app (`main.ts` or route file)
- [ ] Register `POST /admin/links/:id/edit` route
- [ ] Implement `GET` handler: load link by id, 404 if not found, render edit form
- [ ] Implement `POST` handler: parse form body, call `updateLink`, redirect or re-render with error
- [ ] Normalize empty strings to `null` for alias and expiry in the POST handler
- [ ] Format `expires_at` as `YYYY-MM-DD` string for the date input pre-population
- [ ] Create `src/views/edit.tsx` — `EditLinkPage` component with pre-populated form and error display
- [ ] Add "Edit" button to each row in `dashboard.tsx` linking to `/admin/links/:id/edit`
- [ ] Manual test: pre-population correct, save redirects, validation errors shown, clearing expiry persists null
