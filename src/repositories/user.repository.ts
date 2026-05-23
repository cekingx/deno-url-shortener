import type { Database } from '@db/sqlite'

export interface UserRow {
  id: number
  password_hash: string
}

export interface UserRepository {
  findByUsername(username: string): UserRow | undefined
}

export class SqliteUserRepository implements UserRepository {
  constructor(private db: Database) {}

  findByUsername(username: string): UserRow | undefined {
    return this.db
      .prepare('SELECT id, password_hash FROM users WHERE username = ?')
      .get<UserRow>(username)
  }
}
