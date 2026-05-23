import { Database } from '@db/sqlite'

const dbPath = Deno.env.get('DB_PATH') ?? './data/db.sqlite'
export const db = new Database(dbPath)
