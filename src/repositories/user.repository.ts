import type { Database } from '@db/sqlite'
import { User } from '../domain/user.ts'

interface UserRow {
  id: number
  username: string
  password_hash: string
}

export interface UserRepository {
  findByUsername(username: string): User | undefined
}

export class SqliteUserRepository implements UserRepository {
  constructor(private db: Database) {}

  findByUsername(username: string): User | undefined {
    const row = this.db
      .prepare('SELECT id, username, password_hash FROM users WHERE username = ?')
      .get<UserRow>(username)
    if (!row) return undefined
    return new User(row.id, row.username, row.password_hash)
  }
}
