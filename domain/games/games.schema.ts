import { z } from "zod";

export const syncGamesSchema = z.object({
  date: z.string().date("Data inválida. Use o formato YYYY-MM-DD."),
});

export type SyncGamesSchema = z.infer<typeof syncGamesSchema>;
