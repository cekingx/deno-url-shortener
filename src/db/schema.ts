import type { Database } from '@db/sqlite'

export function runMigrations(db: Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      username      TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS links (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      short_code      TEXT NOT NULL UNIQUE,
      destination_url TEXT NOT NULL,
      custom_alias    TEXT UNIQUE,
      expires_at      DATETIME,
      created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      click_count     INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS clicks (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      link_id    INTEGER NOT NULL REFERENCES links(id) ON DELETE CASCADE,
      clicked_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `)
}
