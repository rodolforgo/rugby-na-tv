import { db } from "@/infra/database";
import { sessionSchema } from "@/infra/database/schema/sessions";
import type { CreateSessionSchema } from "@/domain/sessions/sessions.schema";
import users from "@/models/users";
import authorization from "@/models/authorization";

async function createSession(credentials: CreateSessionSchema) {
  const user = await users.getUserByEmail(credentials.email);

  await authorization.verifyPassword(credentials.password, user.password);

  const sessionToken = crypto.randomUUID();

  const expires = new Date();
  expires.setDate(expires.getDate() + 7);

  const newSession = await db.insert(sessionSchema).values({ sessionToken, userId: user.id, expires }).returning();

  return newSession[0];
}

const sessions = { createSession };

export default sessions;
