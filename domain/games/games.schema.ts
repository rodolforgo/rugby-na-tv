import { z } from "zod";

export const syncGamesSchema = z.object({
  date: z.string().date("Data inválida. Use o formato YYYY-MM-DD."),
});

export type SyncGamesSchema = z.infer<typeof syncGamesSchema>;

export const castVoteSchema = z.object({
  channelId: z.string().uuid("channelId inválido."),
  voteType: z.enum(["upvote", "downvote"]),
});

export type CastVoteSchema = z.infer<typeof castVoteSchema>;
