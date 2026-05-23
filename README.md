# url-shortener

A personal URL shortener built with Deno and Hono. Converts long URLs into
short, shareable links with an admin dashboard to manage them.

## Features

- Create short links with auto-generated or custom aliases
- Edit destination URL or alias after creation
- Optional link expiration dates
- Click count and timestamp tracking per link
- Server-rendered admin UI (no frontend build step)
- Single-user authentication via JWT cookie

## Tech Stack

- **Runtime:** Deno
- **Framework:** Hono (with JSX SSR)
- **Database:** SQLite
- **Deployment:** Docker Compose + nginx-proxy-manager

## Getting Started

### Prerequisites

- [Deno](https://deno.com) installed
- Docker & Docker Compose (for production)

### Development

```bash
deno task dev
```

The app runs at `http://localhost:8001` with file watching enabled.

### Production

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

Then start the stack:

```bash
docker compose up -d
```

Point your nginx-proxy-manager proxy host to the container on port `8001`.

## Environment Variables

| Variable              | Description                                |
| --------------------- | ------------------------------------------ |
| `JWT_SECRET`          | Secret key used to sign JWT session tokens |
| `ADMIN_USERNAME`      | Pre-populated admin username               |
| `ADMIN_PASSWORD_HASH` | bcrypt hash of the admin password          |

## Project Structure

```
url-shortener/
├── main.ts               # Application entry point
├── deno.json             # Deno config and task definitions
├── docker-compose.yml    # Production stack definition
├── Dockerfile            # Container image
├── src/
│   ├── db/               # SQLite client and schema init
│   ├── middleware/        # JWT auth middleware
│   ├── handlers/          # Route handlers (auth, redirect, links, admin)
│   ├── views/             # Hono JSX page templates
│   └── utils/             # Short code generation, JWT helpers
└── docs/
    └── technical-architecture.md
```

## Documentation

See [docs/technical-architecture.md](docs/technical-architecture.md) for a full
system design overview.
