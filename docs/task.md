## User Story: Delete a Short Link — Backend

**Layer**: Backend

---

### User Story Context

**As an** owner
**I want to** delete a short link
**So that** I can permanently remove links I no longer need and keep my dashboard clean

---

### Technical Scope

#### Endpoint

**POST** `/admin/links/:id/delete` — Delete a link and all its associated click records

- **Authentication**: Required (JWT cookie via existing auth middleware)
- **Request**: HTML form POST (no body fields — the link `id` comes from the URL param)
- **Response (302)**: Redirect to `/admin?deleted=1` on success
- **Error Codes**:
  - `302` → `/admin?error=not_found` — Link with given `id` does not exist
  - `302` → `/admin?error=delete_failed` — Unexpected DB error during deletion

#### Repository

- Add `delete(id: number): boolean` to the `LinkRepository` interface in `src/repositories/link.repository.ts`
- Implement in `SqliteLinkRepository`: run a single transaction that deletes all rows in `clicks` where `link_id = id`, then deletes the row in `links` where `id = id`. Return `true` if a row was deleted, `false` if no row matched.

#### Service

- Add `delete(id: number): true | Error` to `LinkService` in `src/services/link.service.ts`
- Call `repo.findById(id)` first; return `new Error("not_found")` if missing
- Call `repo.delete(id)`; return `true` on success

#### Handler

- Add `handleDeleteLink` to `src/handlers/links.tsx`
- Parse `:id` param as integer; reject non-numeric ids with a redirect to `/admin?error=not_found`
- Call `c.var.linkService.delete(id)`
- On `instanceof Error`: redirect to `/admin?error=not_found`
- On success: redirect to `/admin?deleted=1`

#### Route registration

- Register `POST /admin/links/:id/delete` in `main.ts` pointing to `handleDeleteLink`, behind the existing auth middleware

#### Database Changes

- No schema changes — `clicks` rows are deleted in the same transaction via `WHERE link_id = ?`; no `ON DELETE CASCADE` constraint is needed in the schema since the repository handles it explicitly

---

### Notes

- The existing auth middleware on `/admin/*` already covers this route — no extra auth work required
- Use a transaction for the two-step delete (clicks → link) to avoid orphaned click rows if the link delete fails
- No `id` validation beyond integer parsing is needed — a missing link is handled as `not_found`
- The redirect handler (`GET /:code`) already returns 404 for unknown short codes, so no changes are needed there after deletion
- This task must be completed before the Frontend task, as the form action URL depends on this endpoint existing

---

### Implementation Tasks

- [ ] Add `delete(id: number): boolean` to `LinkRepository` interface
- [ ] Implement `SqliteLinkRepository.delete` with a transaction (delete clicks, then link)
- [ ] Add `delete(id: number): true | Error` to `LinkService`
- [ ] Write unit tests for `LinkService.delete` in `link.service.test.ts` (not found, success)
- [ ] Add `handleDeleteLink` handler in `src/handlers/links.tsx`
- [ ] Register `POST /admin/links/:id/delete` route in `main.ts`
- [ ] Verify that visiting the deleted short code returns 404 via the existing redirect handler

---

## User Story: Delete a Short Link — Frontend

**Layer**: Frontend

---

### User Story Context

**As an** owner
**I want to** delete a short link
**So that** I can permanently remove links I no longer need and keep my dashboard clean

---

### Technical Scope

#### Components

- `LinkRow` in `src/views/dashboard.tsx` — currently renders a disabled `<button>` for Delete. Replace it with a `<form method="post" action="/admin/links/:id/delete">` wrapping a submit button. Add an `onclick="return confirm('Delete this link? This cannot be undone.')"` on the button to trigger the native browser confirmation dialog before submitting.

- `DashboardPage` in `src/views/dashboard.tsx` — extend `error` prop type to include `"not_found"` and `"delete_failed"`. Add a `deleted` boolean prop (mirrors `success` but for deletions). Render a success banner when `deleted` is true and an error banner for the new error codes.

#### Handler update

- `handleDashboard` in `src/handlers/admin.tsx` — read `deleted` query param (`?deleted=1`) and the new error values (`not_found`, `delete_failed`) from the query string and pass them to `DashboardPage`.

#### UX Considerations

- The native `confirm()` dialog is sufficient — no custom modal needed (per PRD notes)
- Cancelling the dialog must not submit the form; `onclick="return confirm(...)"` achieves this
- After a successful deletion the dashboard reloads without the deleted row; no client-side state update is needed since the page is fully server-rendered
- The delete success banner should be visually distinct from the create success banner (same green style is fine, different copy: "Link deleted.")
- The delete button is currently styled as `text-red-400 hover:text-red-600` — keep that styling; just remove the `disabled` attribute and wrap in a form

---

### Notes

- Depends on the Backend task: the form `action` URL (`/admin/links/:id/delete`) must exist before this can be tested end-to-end
- HTML forms only support GET and POST — `POST /admin/links/:id/delete` follows the same pattern already used for create (`POST /admin/links`) and edit (`POST /admin/links/:id`)
- No JavaScript beyond the inline `confirm()` call is needed — consistent with the project's server-rendered, no-build-pipeline approach

---

### Implementation Tasks

- [ ] Replace the disabled delete `<button>` in `LinkRow` with a `<form>` posting to `/admin/links/:id/delete`
- [ ] Add `onclick="return confirm(...)"` to the delete submit button
- [ ] Add `deleted` boolean prop to `DashboardPage` and render a success banner
- [ ] Extend `error` prop type in `DashboardPage` to include `"not_found"` and `"delete_failed"`
- [ ] Render error banners for `not_found` and `delete_failed` in `DashboardPage`
- [ ] Update `handleDashboard` in `src/handlers/admin.tsx` to read `deleted` and new error query params
- [ ] Manual test: delete a link, confirm dialog appears, link disappears from list, short URL returns 404
- [ ] Manual test: cancel the confirmation dialog, link remains intact
