import type { Context } from "hono";
import type { Variables } from "../context.ts";
import { DashboardPage } from "../views/dashboard.tsx";

type KnownError =
  | "invalid_url"
  | "duplicate_alias"
  | "invalid_alias"
  | "not_found"
  | "delete_failed";

const knownErrors = new Set<KnownError>([
  "invalid_url",
  "duplicate_alias",
  "invalid_alias",
  "not_found",
  "delete_failed",
]);

const createFormErrors = new Set<KnownError>([
  "invalid_url",
  "duplicate_alias",
  "invalid_alias",
]);

export function handleDashboard(c: Context<{ Variables: Variables }>) {
  const success = c.req.query("success") === "1";
  const deleted = c.req.query("deleted") === "1";

  const rawError = c.req.query("error");
  let error: KnownError | undefined;
  if (knownErrors.has(rawError as KnownError)) {
    error = rawError as KnownError;
  }

  let formValues: { destination?: string; alias?: string; expiresAt?: string } | undefined;
  if (error && createFormErrors.has(error)) {
    formValues = {
      destination: c.req.query("destination"),
      alias: c.req.query("alias"),
      expiresAt: c.req.query("expires_at"),
    };
  }

  const links = c.var.linkService.findAll();
  const baseUrl = new URL(c.req.url).origin;

  return c.html(
    <DashboardPage
      success={success}
      deleted={deleted}
      error={error}
      formValues={formValues}
      links={links}
      baseUrl={baseUrl}
    />,
  );
}
