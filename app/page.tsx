import { cookies } from "next/headers";
import { and, eq, gt } from "drizzle-orm";
import { db } from "@/infra/database";
import { sessionSchema } from "@/infra/database/schema/sessions";
import games from "@/models/games";
import GamesSection from "./components/GamesSection";

export default async function Home() {
  const token = (await cookies()).get("session_token")?.value;
  let userId: string | undefined;

  if (token) {
    const session = await db.query.sessionSchema.findFirst({
      where: and(eq(sessionSchema.sessionToken, token), gt(sessionSchema.expires, new Date())),
    });
    userId = session?.userId;
  }

  const allGames = await games.listWithVotesForDisplay(userId);

  return <GamesSection games={allGames} isLoggedIn={!!userId} />;
}
