import type { Context } from "hono";
import type { Variables } from "../context.ts";

export async function handleCreateLink(
  c: Context<{ Variables: Variables }>,
) {
  const body = await c.req.parseBody<{
    destination: string;
    alias?: string;
    expires_at?: string;
  }>();

  const { destination, alias, expires_at } = body;

  const result = c.var.linkService.create(destination, alias, expires_at);

  if (result instanceof Error) {
    const params = new URLSearchParams({
      error: result.message,
      destination: destination ?? "",
      alias: alias ?? "",
      expires_at: expires_at ?? "",
    });
    return c.redirect(`/admin?${params}`, 302);
  }

  return c.redirect("/admin?success=1", 302);
}
