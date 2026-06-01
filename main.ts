import { Hono } from "hono";
import { serveStatic } from "hono/deno";
import { compare } from "@da/bcrypt";
import { db } from "./src/db/client.ts";
import { runMigrations } from "./src/db/schema.ts";
import { signJwt, verifyJwt } from "./src/utils/jwt.ts";
import { SqliteUserRepository } from "./src/repositories/user.repository.ts";
import { SqliteLinkRepository } from "./src/repositories/link.repository.ts";
import { AuthService } from "./src/services/auth.service.ts";
import { LinkService } from "./src/services/link.service.ts";
import type { Variables } from "./src/context.ts";
import { authMiddleware } from "./src/middleware/auth.ts";
import {
  handleLogin,
  handleLoginPage,
  handleLogout,
} from "./src/handlers/auth.tsx";
import { handleDashboard } from "./src/handlers/admin.tsx";
import {
  handleCreateLink,
  handleDeleteLink,
  handleEditLink,
  handleEditLinkPage,
} from "./src/handlers/links.tsx";

runMigrations(db);

const authService = new AuthService(
  new SqliteUserRepository(db),
  { sign: signJwt, verify: verifyJwt },
  { compare },
);

const linkService = new LinkService(new SqliteLinkRepository(db));

const app = new Hono<{ Variables: Variables }>();

app.use("*", (c, next) => {
  c.set("authService", authService);
  c.set("linkService", linkService);
  return next();
});

app.use("/static/*", serveStatic({ root: "./" }));

app.get("/login", handleLoginPage);
app.post("/login", handleLogin);
app.post("/logout", handleLogout);

app.use("/admin/*", authMiddleware);
app.use("/api/*", authMiddleware);

app.get("/admin", handleDashboard);
app.post("/admin/links", handleCreateLink);
app.get("/admin/links/:id/edit", handleEditLinkPage);
app.post("/admin/links/:id/edit", handleEditLink);
app.post("/admin/links/:id/delete", handleDeleteLink);

Deno.serve({ port: 8001 }, app.fetch);
