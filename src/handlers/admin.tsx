import type { Context } from "hono";
import { DashboardPage } from "../views/dashboard.tsx";

export function handleDashboard(c: Context) {
  return c.html(<DashboardPage />);
}
