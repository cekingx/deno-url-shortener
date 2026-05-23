import { Database } from "@db/sqlite";
import { hash } from "@da/bcrypt";

const username = Deno.args[0];
const password = Deno.args[1];

if (!username || !password) {
  console.error("Usage: deno run -A scripts/add-user.ts <username> <password>");
  Deno.exit(1);
}

const dbPath = Deno.env.get("DB_PATH") ?? "./data/db.sqlite";
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    username      TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL
  )
`);

const passwordHash = await hash(password);

try {
  db.prepare("INSERT INTO users (username, password_hash) VALUES (?, ?)").run(
    username,
    passwordHash,
  );
  console.log(`User "${username}" created.`);
} catch (err) {
  if (
    err instanceof Error && err.message.includes("UNIQUE constraint failed")
  ) {
    console.error(`Error: username "${username}" is already taken.`);
    Deno.exit(1);
  }
  throw err;
} finally {
  db.close();
}
