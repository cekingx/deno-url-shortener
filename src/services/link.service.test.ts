import { expect } from "@std/expect";
import { LinkService } from "./link.service.ts";
import type { LinkRepository } from "../repositories/link.repository.ts";
import { Link } from "../domain/link.ts";

const makeLink = (overrides?: Partial<Link>): Link =>
  new Link(
    overrides?.id ?? 1,
    overrides?.shortCode ?? "abc123",
    overrides?.destinationUrl ?? "https://example.com",
    overrides?.customAlias ?? null,
    overrides?.expiresAt ?? null,
    overrides?.createdAt ?? "2026-01-01T00:00:00",
    overrides?.clickCount ?? 0,
  );

const makeRepo = (overrides?: Partial<LinkRepository>): LinkRepository => ({
  create: () => makeLink(),
  findAll: () => [],
  findById: () => undefined,
  findByShortCode: () => undefined,
  update: () => makeLink(),
  ...overrides,
});

Deno.test("create - returns error for invalid URL (no protocol)", () => {
  const service = new LinkService(makeRepo());
  const result = service.create("example.com");
  expect(result).toBeInstanceOf(Error);
  expect((result as Error).message).toBe("invalid_url");
});

Deno.test("create - returns error for invalid URL (ftp protocol)", () => {
  const service = new LinkService(makeRepo());
  const result = service.create("ftp://example.com");
  expect(result).toBeInstanceOf(Error);
  expect((result as Error).message).toBe("invalid_url");
});

Deno.test("create - returns error for duplicate alias", () => {
  const repo = makeRepo({ findByShortCode: () => makeLink() });
  const service = new LinkService(repo);
  const result = service.create("https://example.com", "my-alias");
  expect(result).toBeInstanceOf(Error);
  expect((result as Error).message).toBe("duplicate_alias");
});

Deno.test("create - succeeds with valid URL and no alias", () => {
  const created = makeLink({ shortCode: "xyz789" });
  const repo = makeRepo({ create: () => created });
  const service = new LinkService(repo);
  const result = service.create("https://example.com");
  expect(result).toBeInstanceOf(Link);
  expect((result as Link).destinationUrl).toBe("https://example.com");
});

Deno.test("create - succeeds with valid URL and unique alias", () => {
  const created = makeLink({ shortCode: "my-alias", customAlias: "my-alias" });
  const repo = makeRepo({
    findByShortCode: () => undefined,
    create: () => created,
  });
  const service = new LinkService(repo);
  const result = service.create("https://example.com", "my-alias");
  expect(result).toBeInstanceOf(Link);
  expect((result as Link).shortCode).toBe("my-alias");
});

Deno.test("create - passes alias as customAlias and shortCode to repo", () => {
  let captured: Parameters<LinkRepository["create"]>[0] | undefined;
  const repo = makeRepo({
    findByShortCode: () => undefined,
    create: (params) => {
      captured = params;
      return makeLink();
    },
  });
  const service = new LinkService(repo);
  service.create("https://example.com", "vanity");
  expect(captured?.shortCode).toBe("vanity");
  expect(captured?.customAlias).toBe("vanity");
});

Deno.test("create - passes null customAlias when no alias given", () => {
  let captured: Parameters<LinkRepository["create"]>[0] | undefined;
  const repo = makeRepo({
    create: (params) => {
      captured = params;
      return makeLink();
    },
  });
  const service = new LinkService(repo);
  service.create("https://example.com");
  expect(captured?.customAlias).toBeNull();
});

Deno.test("create - passes expiresAt to repo when provided", () => {
  let captured: Parameters<LinkRepository["create"]>[0] | undefined;
  const repo = makeRepo({
    create: (params) => {
      captured = params;
      return makeLink();
    },
  });
  const service = new LinkService(repo);
  service.create("https://example.com", undefined, "2026-12-31T23:59");
  expect(captured?.expiresAt).toBe("2026-12-31T23:59");
});

Deno.test("create - treats repo unique violation as duplicate_alias error", () => {
  const repo = makeRepo({
    findByShortCode: () => undefined,
    create: () => { throw new Error("UNIQUE constraint failed"); },
  });
  const service = new LinkService(repo);
  const result = service.create("https://example.com", "taken");
  expect(result).toBeInstanceOf(Error);
  expect((result as Error).message).toBe("duplicate_alias");
});

Deno.test("findAll - delegates to repo", () => {
  const links = [makeLink({ id: 1 }), makeLink({ id: 2 })];
  const repo = makeRepo({ findAll: () => links });
  const service = new LinkService(repo);
  expect(service.findAll()).toEqual(links);
});

// update tests

Deno.test("update - returns error for invalid URL", () => {
  const current = makeLink({ id: 1, shortCode: "abc123" });
  const repo = makeRepo({ findById: () => current });
  const service = new LinkService(repo);
  const result = service.update(1, "not-a-url", null, null);
  expect(result).toBeInstanceOf(Error);
  expect((result as Error).message).toBe("invalid_url");
});

Deno.test("update - returns error when link not found", () => {
  const repo = makeRepo({ findById: () => undefined });
  const service = new LinkService(repo);
  const result = service.update(99, "https://example.com", null, null);
  expect(result).toBeInstanceOf(Error);
  expect((result as Error).message).toBe("not_found");
});

Deno.test("update - returns error when alias is taken by a different link", () => {
  const current = makeLink({ id: 1, shortCode: "abc123" });
  const other = makeLink({ id: 2, shortCode: "taken" });
  const repo = makeRepo({
    findById: () => current,
    findByShortCode: () => other,
  });
  const service = new LinkService(repo);
  const result = service.update(1, "https://example.com", "taken", null);
  expect(result).toBeInstanceOf(Error);
  expect((result as Error).message).toBe("duplicate_alias");
});

Deno.test("update - same alias on same link is valid (no duplicate check trip)", () => {
  const current = makeLink({ id: 1, shortCode: "my-alias", customAlias: "my-alias" });
  const updated = makeLink({ id: 1, shortCode: "my-alias", destinationUrl: "https://new.com", customAlias: "my-alias" });
  const repo = makeRepo({
    findById: () => current,
    findByShortCode: () => current,
    update: () => updated,
  });
  const service = new LinkService(repo);
  const result = service.update(1, "https://new.com", "my-alias", null);
  expect(result).toBeInstanceOf(Link);
  expect((result as Link).destinationUrl).toBe("https://new.com");
});

Deno.test("update - succeeds with new alias", () => {
  const current = makeLink({ id: 1, shortCode: "abc123" });
  const updated = makeLink({ id: 1, shortCode: "new-alias", customAlias: "new-alias" });
  const repo = makeRepo({
    findById: () => current,
    findByShortCode: () => undefined,
    update: () => updated,
  });
  const service = new LinkService(repo);
  const result = service.update(1, "https://example.com", "new-alias", null);
  expect(result).toBeInstanceOf(Link);
  expect((result as Link).shortCode).toBe("new-alias");
});

Deno.test("update - clearing alias keeps existing short_code", () => {
  const current = makeLink({ id: 1, shortCode: "abc123", customAlias: "old-alias" });
  let captured: Parameters<LinkRepository["update"]>[1] | undefined;
  const repo = makeRepo({
    findById: () => current,
    update: (_id, fields) => {
      captured = fields;
      return makeLink({ ...fields, id: 1 });
    },
  });
  const service = new LinkService(repo);
  service.update(1, "https://example.com", null, null);
  expect(captured?.shortCode).toBe("abc123");
  expect(captured?.customAlias).toBeNull();
});

Deno.test("update - clearing expiresAt passes null to repo", () => {
  const current = makeLink({ id: 1, shortCode: "abc123", expiresAt: "2026-12-31" });
  let captured: Parameters<LinkRepository["update"]>[1] | undefined;
  const repo = makeRepo({
    findById: () => current,
    update: (_id, fields) => {
      captured = fields;
      return makeLink();
    },
  });
  const service = new LinkService(repo);
  service.update(1, "https://example.com", null, null);
  expect(captured?.expiresAt).toBeNull();
});
