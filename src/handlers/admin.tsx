import type { Context } from "hono";
import { DashboardPage } from "../views/dashboard.tsx";

export function handleDashboard(c: Context) {
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

  return c.html(<DashboardPage success={success} error={error} formValues={formValues} />);
}
