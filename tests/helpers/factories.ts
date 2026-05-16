import { db } from "@/infra/database";
import { usersSchema } from "@/infra/database/schema/users";
import { verificationTokensSchema } from "@/infra/database/schema/verificationTokens";
import { gamesSchema } from "@/infra/database/schema/games";
import users from "@/models/users";
import { eq } from "drizzle-orm";

export async function createTestUser(options?: { email?: string; password?: string }) {
  const email = options?.email || `user_${crypto.randomUUID()}@email.com`;
  const password = options?.password || "Password123!";

  const user = await users.createNewUser({ email, password });

  return { ...user, rawPassword: password };
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

export async function verifyUserEmail(userId: string) {
  await db.update(usersSchema).set({ emailVerified: new Date() }).where(eq(usersSchema.id, userId));
}

export async function createTestToken(email: string, options?: { expiresAt?: Date }): Promise<string> {
  const token = crypto.randomUUID();
  const expires = options?.expiresAt ?? new Date(Date.now() + 24 * 60 * 60 * 1000);
  await db.insert(verificationTokensSchema).values({ identifier: email, token, expires });
  return token;
}

export async function setTokenExpires(email: string, expires: Date) {
  await db.update(verificationTokensSchema).set({ expires }).where(eq(verificationTokensSchema.identifier, email));
}

export async function createTestGame(options: { homeTeamName: string; awayTeamName: string; date: Date; leagueName?: string }) {
  const [game] = await db
    .insert(gamesSchema)
    .values({
      date: options.date,
      timestamp: Math.floor(options.date.getTime() / 1000),
      countryName: "Test",
      leagueName: options.leagueName ?? "Test League",
      homeTeamName: options.homeTeamName,
      awayTeamName: options.awayTeamName,
      scoresHome: null,
      scoresAway: null,
    })
    .returning();
  return game;
}
