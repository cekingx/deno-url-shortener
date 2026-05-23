import type { Context } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import type { Variables } from "../context.ts";
import { LoginPage } from "../views/login.tsx";

export async function handleLoginPage(c: Context<{ Variables: Variables }>) {
  const token = getCookie(c, "token");
  if (token) {
    const result = await c.var.authService.verifyToken(token);
    if (!(result instanceof Error)) return c.redirect("/admin", 302);
  }

  const error = c.req.query("error")
    ? "Invalid username or password"
    : undefined;
  return c.html(<LoginPage error={error} />);
}

export async function handleLogin(c: Context<{ Variables: Variables }>) {
  const { username, password } = await c.req.parseBody<{
    username: string;
    password: string;
  }>();

  const result = await c.var.authService.login(username, password);
  if (result instanceof Error) return c.redirect("/login?error=1", 302);

  setCookie(c, "token", result, {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
    maxAge: 604800,
    path: "/",
  });
  return c.redirect("/admin", 302);
}

export function handleLogout(c: Context) {
  setCookie(c, "token", "", {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
    maxAge: 0,
    path: "/",
  });
  return c.redirect("/login", 302);
}
