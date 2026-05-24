import { db } from "@/infra/database";
import { sessionSchema } from "@/infra/database/schema/sessions";
import type { CreateSessionSchema } from "@/domain/sessions/sessions.schema";
import users from "@/models/users";
import authorization from "@/models/authorization";
import { UnauthorizedError } from "@/infra/errors";
import { cookies } from "next/headers";
import { and, eq, gt } from "drizzle-orm";

async function createSession(credentials: CreateSessionSchema) {
  const user = await users.getUserByEmail(credentials.email);

  await authorization.verifyPassword(credentials.password, user.password);

  if (!user.emailVerified) {
    throw new UnauthorizedError("E-mail não verificado. Verifique sua caixa de entrada.");
  }

  const sessionToken = crypto.randomUUID();

  const expires = new Date();
  expires.setDate(expires.getDate() + 7);

  const newSession = await db.insert(sessionSchema).values({ sessionToken, userId: user.id, expires }).returning();

  return newSession[0];
}

async function requireSession(): Promise<string> {
  const token = (await cookies()).get("session_token")?.value;
  if (!token) throw new UnauthorizedError();

  const session = await db.query.sessionSchema.findFirst({
    where: and(eq(sessionSchema.sessionToken, token), gt(sessionSchema.expires, new Date())),
  });

  if (!session) throw new UnauthorizedError();

  return session.userId;
}

const sessions = { createSession, requireSession };

export default sessions;
