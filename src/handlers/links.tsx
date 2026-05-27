import type { Context } from "hono";
import type { Variables } from "../context.ts";
import { EditLinkPage } from "../views/edit.tsx";

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

export function handleEditLinkPage(c: Context<{ Variables: Variables }>) {
  const id = Number(c.req.param("id"));
  const link = c.var.linkService.findById(id);
  if (!link) return c.notFound();
  return c.html(<EditLinkPage link={link} />);
}

export async function handleEditLink(c: Context<{ Variables: Variables }>) {
  const id = Number(c.req.param("id"));
  const link = c.var.linkService.findById(id);
  if (!link) return c.notFound();

  const body = await c.req.parseBody<{
    destination: string;
    alias?: string;
    expires_at?: string;
  }>();

  const destination = body.destination ?? "";
  const alias = body.alias?.trim() || null;
  const expiresAt = body.expires_at?.trim() || null;

  const result = c.var.linkService.update(id, destination, alias, expiresAt);

  if (result instanceof Error) {
    return c.html(
      <EditLinkPage
        link={link}
        error={result.message as "invalid_url" | "duplicate_alias" | "invalid_alias"}
        formValues={{ destination, alias: alias ?? "", expiresAt: expiresAt ?? "" }}
      />,
    );
  }

  return c.redirect("/admin", 302);
}
