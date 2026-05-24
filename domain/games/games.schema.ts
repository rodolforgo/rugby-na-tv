import z from "zod";

export const createUserGameSchema = z.object({
  homeTeamName: z
    .string()
    .min(1, { message: "Nome do time mandante é obrigatório." })
    .max(255, { message: "Nome do time mandante deve ter no máximo 255 caracteres." }),
  awayTeamName: z
    .string()
    .min(1, { message: "Nome do time visitante é obrigatório." })
    .max(255, { message: "Nome do time visitante deve ter no máximo 255 caracteres." }),
  leagueName: z
    .string()
    .min(1, { message: "Nome do campeonato é obrigatório." })
    .max(255, { message: "Nome do campeonato deve ter no máximo 255 caracteres." }),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Data inválida. Use o formato YYYY-MM-DD." }),
  time: z.string().regex(/^\d{2}:\d{2}$/, { message: "Hora inválida. Use o formato HH:MM." }),
  channelName: z
    .string()
    .min(1, { message: "Nome do canal é obrigatório." })
    .max(255, { message: "Nome do canal deve ter no máximo 255 caracteres." }),
});

export type CreateUserGameData = z.infer<typeof createUserGameSchema>;

export const syncGamesSchema = z.object({
  date: z.string().date({ message: "Data inválida. Use o formato YYYY-MM-DD." }),
});

export type SyncGamesSchema = z.infer<typeof syncGamesSchema>;

export const castVoteSchema = z.object({
  channelId: z.string().uuid("channelId inválido."),
  voteType: z.enum(["upvote", "downvote"]),
});

export type CastVoteSchema = z.infer<typeof castVoteSchema>;
