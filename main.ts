import { Hono } from "hono";
import { compare } from "@da/bcrypt";
import { db } from "./src/db/client.ts";
import { runMigrations } from "./src/db/schema.ts";
import { signJwt, verifyJwt } from "./src/utils/jwt.ts";
import { SqliteUserRepository } from "./src/repositories/user.repository.ts";
import { AuthService } from "./src/services/auth.service.ts";
import type { Variables } from "./src/context.ts";
import { authMiddleware } from "./src/middleware/auth.ts";
import {
  handleLogin,
  handleLoginPage,
  handleLogout,
} from "./src/handlers/auth.tsx";
import { handleDashboard } from "./src/handlers/admin.tsx";

runMigrations(db);

const authService = new AuthService(
  new SqliteUserRepository(db),
  { sign: signJwt, verify: verifyJwt },
  { compare },
);

const app = new Hono<{ Variables: Variables }>();

app.use("*", (c, next) => {
  c.set("authService", authService);
  return next();
});

app.get("/login", handleLoginPage);
app.post("/login", handleLogin);
app.post("/logout", handleLogout);

app.use("/admin/*", authMiddleware);
app.use("/api/*", authMiddleware);

app.get("/admin", handleDashboard);

Deno.serve({ port: 8001 }, app.fetch);
