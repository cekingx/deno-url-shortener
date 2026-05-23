# Product Requirements Document — URL Shortener

---

## Epic: Authentication

### Epic Description

Provide a secure login and logout flow so that the single owner of the URL
shortener can access the admin dashboard and manage their links. Credentials are
pre-seeded in the database — there is no self-registration UI.

### Business Value

Without authentication, the admin dashboard and link management API would be
publicly accessible. This epic establishes the security boundary that protects
the owner's data and prevents unauthorized creation, editing, or deletion of
short links.

### Goals

- Owner can log in with a username and password
- Authenticated session persists across browser tabs and page refreshes for 7
  days
- Owner can log out and invalidate the session
- All protected routes reject unauthenticated access and redirect to the login
  page

### Non-Goals

- No self-registration UI — credentials are managed via a separate database seed
  script
- No password reset or "forgot password" flow
- No multi-user or role-based access control
- No OAuth or third-party identity provider integration
- No session revocation list or forced logout from other devices

---

## User Story: Owner Login

**As an** owner\
**I want to** log in with my username and password\
**So that** I can access the admin dashboard to manage my short links

**Priority**: High\
**Estimate**: 3 story points

---

### Acceptance Criteria (User Perspective)

- [x] Owner can see a login form with a username field, a password field, and a
      submit button
- [x] Owner is redirected to `/admin` dashboard after submitting valid
      credentials
- [ ] Owner sees a generic "Invalid username or password" message when
      submitting incorrect credentials — no hint about which field is wrong
- [ ] Owner remains on the `/login` page after a failed login attempt, with the
      form ready to retry
- [ ] Owner visiting a protected route (e.g. `/admin`) without being logged in
      is redirected to `/login`
- [ ] Owner's session persists for 7 days without needing to log in again

---

### Notes

- The JWT is stored in an httpOnly, Secure, SameSite=Strict cookie — it is never
  accessible to JavaScript
- Credentials are validated against a bcrypt-hashed password stored in the
  `users` table
- The JWT payload carries the user ID and an expiry claim; no other sensitive
  data

---

### Definition of Done

- [ ] All related implementation tasks completed
- [ ] All acceptance criteria met
- [ ] Code reviewed and merged
- [ ] Tested in staging environment

---

## User Story: Owner Logout

**As an** owner\
**I want to** log out of the admin dashboard\
**So that** my session is ended and my links are protected on shared or
untrusted devices

**Priority**: High\
**Estimate**: 1 story point

---

### Acceptance Criteria (User Perspective)

- [ ] Owner can see a logout button while on the admin dashboard
- [ ] Clicking logout immediately ends the session and redirects the owner to
      `/login`
- [ ] After logging out, visiting `/admin` redirects back to `/login` — the
      previous session is no longer valid
- [ ] Logging out on one tab prevents access on other tabs without a page reload
      revealing protected content

---

### Notes

- Logout clears the JWT cookie by overwriting it with an expired value
- No server-side session table is used; expiry is enforced solely by the cookie
  and JWT claims

---

### Definition of Done

- [ ] All related implementation tasks completed
- [ ] All acceptance criteria met
- [ ] Code reviewed and merged
- [ ] Tested in staging environment

---

## Epic: Link Management

### Epic Description

Allow the owner to create, view, edit, and delete short links from the admin
dashboard. This is the core functional value of the URL shortener — without it,
the system has nothing to redirect.

### Business Value

The entire purpose of the system is to produce short links the owner controls.
This epic delivers the primary workflow: turn a long URL into a short one,
optionally with a custom alias and expiry, and manage those links over time.

### Goals

- Owner can create a short link from a destination URL
- Auto-generated short codes are 6 random alphanumeric characters
- Owner can optionally specify a custom alias and/or an expiration date at
  creation time
- Owner sees immediate feedback on success or validation failure
- Owner can view all links on the dashboard

### Non-Goals

- No bulk import or CSV upload
- No link analytics beyond click count (no per-click geographic or browser data
  in this epic)
- No link categories, tags, or folders
- No public-facing link preview page

---

## User Story: Create a Short Link

**As an** owner\
**I want to** create a short link from a destination URL\
**So that** I can share a short, memorable link that redirects to any long URL I
choose

**Priority**: High\
**Estimate**: 3 story points

---

### Acceptance Criteria (User Perspective)

- [ ] Owner can see a create form on the `/admin` dashboard with a destination
      URL field, an optional custom alias field, and an optional expiration date
      field
- [ ] Submitting the form with a valid destination URL and no alias creates a
      short link with a 6-character auto-generated code
- [ ] Submitting the form with a valid destination URL and a custom alias
      creates a short link using that alias as the short code
- [ ] Submitting the form with an optional expiration date records that expiry
      on the new link
- [ ] After a successful creation, the form is cleared, a success message is
      shown, and the new link appears at the top of the link list
- [ ] Submitting a destination URL that is not a valid absolute URL (missing
      http:// or https://) shows an inline error message and keeps the form
      populated with the entered values
- [ ] Submitting a custom alias that is already in use by another link shows an
      inline error message and keeps the form populated with the entered values

---

### Notes

- Custom alias, if provided, is used as the short code; otherwise a random
  6-character alphanumeric code is generated
- Destination URL must be a valid absolute URL — validation runs on the server
- Alias uniqueness is enforced at the database level (`short_code` unique
  constraint)

---

### Definition of Done

- [ ] All related implementation tasks completed
- [ ] All acceptance criteria met
- [ ] Code reviewed and merged
- [ ] Tested in staging environment

---

## User Story: Edit a Short Link

**As an** owner\
**I want to** edit an existing short link\
**So that** I can update where it points, change its alias, or adjust its
expiration without deleting and recreating it

**Priority**: High\
**Estimate**: 3 story points

---

### Acceptance Criteria (User Perspective)

- [ ] Owner can navigate to an edit page for any link in the dashboard list
- [ ] The edit form at `/admin/links/:id/edit` is pre-populated with the link's
      current destination URL, custom alias, and expiration date
- [ ] Owner can update any combination of the three fields and save the changes
- [ ] After a successful save, the owner is redirected to the `/admin` dashboard
      and the updated link reflects the new values
- [ ] Submitting a destination URL that is not a valid absolute URL (missing
      http:// or https://) shows an inline error message and keeps the form
      populated with the entered values
- [ ] Submitting a custom alias that is already in use by a different link shows
      an inline error message and keeps the form populated with the entered
      values
- [ ] Owner can clear the expiration date field to make a previously expiring
      link permanent, and the change is saved correctly

---

### Notes

- The edit page is separate from the dashboard at `/admin/links/:id/edit`
- Alias uniqueness check on edit must exclude the link being edited (same alias
  is valid if unchanged)
- Clearing the expiration date sets `expires_at` to null in the database

---

### Definition of Done

- [ ] All related implementation tasks completed
- [ ] All acceptance criteria met
- [ ] Code reviewed and merged
- [ ] Tested in staging environment

---

## User Story: Delete a Short Link

**As an** owner\
**I want to** delete a short link\
**So that** I can permanently remove links I no longer need and keep my
dashboard clean

**Priority**: High\
**Estimate**: 2 story points

---

### Acceptance Criteria (User Perspective)

- [ ] Owner can see a delete button on each link row in the `/admin` dashboard
- [ ] Clicking the delete button shows a confirmation dialog before any action
      is taken
- [ ] Cancelling the confirmation dialog leaves the link intact and unchanged
- [ ] Confirming the deletion removes the link from the dashboard list
- [ ] After a successful deletion, a success message is shown and the dashboard
      list is refreshed without the deleted link
- [ ] Visiting the deleted link's short URL after deletion returns a 404
      response

---

### Notes

- Deleting a link cascades to remove all associated click records in the
  `clicks` table
- The confirmation dialog can be a native browser `confirm()` prompt — no custom
  modal needed
- The redirect handler must return 404 for any short code that no longer exists
  in the database

---

### Definition of Done

- [ ] All related implementation tasks completed
- [ ] All acceptance criteria met
- [ ] Code reviewed and merged
- [ ] Tested in staging environment

---

## Epic: Public Redirect

### Epic Description

Provide the core public-facing behaviour of the URL shortener — resolving a
short code to its destination URL and redirecting the visitor. This epic
requires no authentication and is the primary value delivered to anyone who
receives a short link.

### Business Value

A URL shortener that doesn't redirect is useless. This epic is the single most
important user-facing feature: every short link shared by the owner depends on
it working correctly, quickly, and gracefully handling invalid or expired codes.

### Goals

- Visiting a valid short URL redirects the visitor to the destination via a 302
  response
- Each redirect is recorded as a click (timestamp + count)
- Expired links return a clear expired message
- Non-existent links return a clear not-found message

### Non-Goals

- No per-click analytics beyond timestamp and count (no IP, browser, or
  geographic data)
- No redirect preview or interstitial page before following the link
- No rate limiting on redirects in this epic

---

## User Story: Redirect a Short URL

**As a** visitor\
**I want to** follow a short URL and be sent to the destination\
**So that** I reach the intended page without needing to know the full URL

**Priority**: High\
**Estimate**: 2 story points

---

### Acceptance Criteria (User Perspective)

- [ ] Visiting a valid, non-expired short URL immediately redirects the visitor
      to the destination via a 302 response
- [ ] The redirect is always a 302 — browsers do not cache it, so destination
      changes take effect immediately for all visitors
- [ ] Visiting a short URL that does not exist shows a custom 404 page with a
      "link not found" message
- [ ] Visiting a short URL that has passed its expiration date shows the same
      custom 404 page with a distinct "this link has expired" message
- [ ] Each successful redirect records a click — the link's click count
      increments and a click timestamp is stored
- [ ] If click recording fails, the visitor is still redirected — a tracking
      failure never blocks the redirect

---

### Notes

- Click recording inserts a row into `clicks` and increments `click_count` on
  `links` in a single transaction
- No authentication is required for the redirect route — it is fully public
- The 302 response is intentional; a 301 would cause browsers to cache the
  destination and bypass future destination edits and click tracking

---

### Definition of Done

- [ ] All related implementation tasks completed
- [ ] All acceptance criteria met
- [ ] Code reviewed and merged
- [ ] Tested in staging environment

---

## User Story: View Link List

**As an** owner\
**I want to** see all my short links in one place\
**So that** I can monitor their click counts, check expiry status, and access
edit and delete actions quickly

**Priority**: High\
**Estimate**: 2 story points

---

### Acceptance Criteria (User Perspective)

- [ ] Owner sees a list of all short links on the `/admin` dashboard after
      logging in
- [ ] Each row displays: the full short URL as a clickable link (opens in new
      tab), the destination URL, the click count, the expiry date (or "Never" if
      no expiry is set), and edit and delete buttons
- [ ] Links are listed in descending order by creation date — most recently
      created link appears first
- [ ] Links that have passed their expiration date show an "Expired" badge in
      the expiry column
- [ ] All links are loaded at once — there is no pagination
- [ ] When no links have been created yet, the list area shows an empty state
      message prompting the owner to create their first link

---

### Notes

- The full short URL is constructed from the host and the link's `short_code`
- Destination URLs that exceed a readable length should be visually truncated in
  the table but remain the full URL in the underlying data
- The empty state message should direct the owner's attention to the create form
  above the list

---

### Definition of Done

- [ ] All related implementation tasks completed
- [ ] All acceptance criteria met
- [ ] Code reviewed and merged
- [ ] Tested in staging environment
