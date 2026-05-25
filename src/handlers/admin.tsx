import type { Context } from "hono";
import type { Variables } from "../context.ts";
import { DashboardPage } from "../views/dashboard.tsx";

export function handleDashboard(c: Context<{ Variables: Variables }>) {
  const success = c.req.query("success") === "1";
  const rawError = c.req.query("error");
  const error =
    rawError === "invalid_url" || rawError === "duplicate_alias"
      ? rawError
      : undefined;

  const formValues = error
    ? {
        destination: c.req.query("destination"),
        alias: c.req.query("alias"),
        expiresAt: c.req.query("expires_at"),
      }
    : undefined;

  const links = c.var.linkService.findAll();
  const baseUrl = new URL(c.req.url).origin;

  return c.html(
    <DashboardPage
      success={success}
      error={error}
      formValues={formValues}
      links={links}
      baseUrl={baseUrl}
    />,
  );
}
