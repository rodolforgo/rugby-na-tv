import { runQueryClient } from "@/infra/database/client";
import migrator from "@/models/migrator";
import seed from "@/infra/database/seed";
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
  await seed.seedFeatures();
}

export async function clearMailcatcher() {
  await fetch("http://localhost:1080/messages", { method: "DELETE" });
}

export async function getLastVerificationToken(recipientEmail: string): Promise<string> {
  const response = await fetch("http://localhost:1080/messages");
  const messages = await response.json();

  const message = [...messages].reverse().find((m: { recipients: string[] }) => m.recipients.some((r) => r.includes(recipientEmail)));

  if (!message) throw new Error(`Nenhum email encontrado para ${recipientEmail}`);

  const bodyResponse = await fetch(`http://localhost:1080/messages/${message.id}.html`);
  const body = await bodyResponse.text();

  const match = body.match(/token=([a-f0-9-]+)/);
  if (!match) throw new Error("Token não encontrado no email");

  return match[1];
}

export async function createTestUserViaApi(options?: { email?: string; password?: string }) {
  const email = options?.email || `user_${crypto.randomUUID()}@email.com`;
  const password = options?.password || "Password123!";

  await fetch("http://localhost:3000/api/v1/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  return { email, rawPassword: password };
}

export async function createTestUser(options?: { email?: string; password?: string }) {
  const email = options?.email || `user_${crypto.randomUUID()}@email.com`;
  const password = options?.password || "Password123!";

  const user = await users.createNewUser({ email, password });

  return { ...user, rawPassword: password };
}
