import type { Database } from "@db/sqlite";
import { Link } from "../domain/link.ts";

interface LinkRow {
  id: number;
  short_code: string;
  destination_url: string;
  custom_alias: string | null;
  expires_at: string | null;
  created_at: string;
  click_count: number;
}

export interface LinkRepository {
  create(
    params: Pick<Link, "shortCode" | "destinationUrl" | "customAlias" | "expiresAt">,
  ): Link;
  findAll(): Link[];
  findByShortCode(code: string): Link | undefined;
}

export class SqliteLinkRepository implements LinkRepository {
  constructor(private db: Database) {}

  create(
    params: Pick<Link, "shortCode" | "destinationUrl" | "customAlias" | "expiresAt">,
  ): Link {
    const row = this.db
      .prepare(
        `INSERT INTO links (short_code, destination_url, custom_alias, expires_at)
         VALUES (?, ?, ?, ?)
         RETURNING id, short_code, destination_url, custom_alias, expires_at, created_at, click_count`,
      )
      .get<LinkRow>(
        params.shortCode,
        params.destinationUrl,
        params.customAlias ?? null,
        params.expiresAt ?? null,
      );

    if (!row) throw new Error("Insert did not return a row");
    return rowToLink(row);
  }

  findAll(): Link[] {
    const rows = this.db
      .prepare(
        `SELECT id, short_code, destination_url, custom_alias, expires_at, created_at, click_count
         FROM links ORDER BY created_at DESC`,
      )
      .all<LinkRow>();
    return rows.map(rowToLink);
  }

  findByShortCode(code: string): Link | undefined {
    const row = this.db
      .prepare(
        `SELECT id, short_code, destination_url, custom_alias, expires_at, created_at, click_count
         FROM links WHERE short_code = ?`,
      )
      .get<LinkRow>(code);
    return row ? rowToLink(row) : undefined;
  }
}

function rowToLink(row: LinkRow): Link {
  return new Link(
    row.id,
    row.short_code,
    row.destination_url,
    row.custom_alias,
    row.expires_at,
    row.created_at,
    row.click_count,
  );
}
