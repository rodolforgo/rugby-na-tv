import { runQueryClient } from "@/infra/database/client";
import migrator from "@/models/migrator";
import users from "@/models/users";

export async function waitWebServer() {
  await fetchStatusPage();
}

async function fetchStatusPage() {
  const res = await fetch("http://localhost:3000/api/v1/status");

  if (res.status !== 200) {
    throw Error();
  }
}

export async function cleanDb() {
  await runQueryClient(async (db) => {
    await db.execute("DROP SCHEMA PUBLIC CASCADE; CREATE SCHEMA PUBLIC;");
    await db.execute('DROP TABLE IF EXISTS "drizzle"."__drizzle_migrations"');
  });
}

export async function runMigrations() {
  await migrator.runMigrations();
}

export async function createTestUser(options?: { email?: string; password?: string }) {
  const email = options?.email || `user_${crypto.randomUUID()}@email.com`;
  const password = options?.password || "Password123!";
  
  const user = await users.createNewUser({ email, password });
  
  return { ...user, rawPassword: password };
}
