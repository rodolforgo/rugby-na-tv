import { db } from "@/infra/database";
import { userGameChannelVotesSchema } from "@/infra/database/schema/userGameChannelVotes";
import { gamesSchema } from "@/infra/database/schema/games";
import { channelsSchema } from "@/infra/database/schema/channels";
import { ValidationError } from "@/infra/errors";
import { and, eq, sql } from "drizzle-orm";

async function cast(userId: string, gameId: string, channelId: string, voteType: "upvote" | "downvote"): Promise<void> {
  const game = await db.query.gamesSchema.findFirst({ where: eq(gamesSchema.id, gameId) });
  if (!game) {
    throw new ValidationError("Jogo não encontrado.", { action: "Verifique o id informado." });
  }

  const channel = await db.query.channelsSchema.findFirst({ where: eq(channelsSchema.id, channelId) });
  if (!channel) {
    throw new ValidationError("Canal não encontrado.", { action: "Verifique o id informado." });
  }

  const existing = await db.query.userGameChannelVotesSchema.findFirst({
    where: and(
      eq(userGameChannelVotesSchema.userId, userId),
      eq(userGameChannelVotesSchema.gameId, gameId),
      eq(userGameChannelVotesSchema.channelId, channelId),
    ),
  });

  if (existing) {
    await db.delete(userGameChannelVotesSchema).where(eq(userGameChannelVotesSchema.id, existing.id));
    if (existing.voteType !== voteType) {
      await db.insert(userGameChannelVotesSchema).values({ userId, gameId, channelId, voteType });
    }
    return;
  }

  await db.insert(userGameChannelVotesSchema).values({ userId, gameId, channelId, voteType });
}

async function remove(userId: string, gameId: string, channelId: string): Promise<void> {
  await db
    .delete(userGameChannelVotesSchema)
    .where(
      and(
        eq(userGameChannelVotesSchema.userId, userId),
        eq(userGameChannelVotesSchema.gameId, gameId),
        eq(userGameChannelVotesSchema.channelId, channelId),
      ),
    );
}

async function getForGame(gameId: string): Promise<Array<{ channelId: string; upvoteCount: number; downvoteCount: number }>> {
  const rows = await db
    .select({
      channelId: userGameChannelVotesSchema.channelId,
      upvoteCount: sql<number>`count(case when ${userGameChannelVotesSchema.voteType} = 'upvote' then 1 end)::int`,
      downvoteCount: sql<number>`count(case when ${userGameChannelVotesSchema.voteType} = 'downvote' then 1 end)::int`,
    })
    .from(userGameChannelVotesSchema)
    .where(eq(userGameChannelVotesSchema.gameId, gameId))
    .groupBy(userGameChannelVotesSchema.channelId);

  return rows;
}

async function getUserVotesForGame(userId: string, gameId: string): Promise<Record<string, "upvote" | "downvote">> {
  const rows = await db.query.userGameChannelVotesSchema.findMany({
    where: and(eq(userGameChannelVotesSchema.userId, userId), eq(userGameChannelVotesSchema.gameId, gameId)),
  });

  return Object.fromEntries(rows.map((r) => [r.channelId, r.voteType as "upvote" | "downvote"]));
}

const votes = { cast, remove, getForGame, getUserVotesForGame };

export default votes;
