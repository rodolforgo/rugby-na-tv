import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { and, eq, gt } from "drizzle-orm";
import { db } from "@/infra/database";
import { sessionSchema } from "@/infra/database/schema/sessions";
import games from "@/models/games";
import MyGamesSection from "@/app/components/MyGamesSection";

export default async function MeusJogosPage() {
  const token = (await cookies()).get("session_token")?.value;
  if (!token) redirect("/?modal=login");

  const session = await db.query.sessionSchema.findFirst({
    where: and(eq(sessionSchema.sessionToken, token), gt(sessionSchema.expires, new Date())),
  });

  if (!session) redirect("/?modal=login");

  const userGames = await games.listByUser(session.userId);

  return (
    <main className="max-w-5xl mx-auto px-6 py-8">
      <h1 className="text-xl font-bold text-base-content mb-6">Meus jogos</h1>
      <MyGamesSection games={userGames} />
    </main>
  );
}
