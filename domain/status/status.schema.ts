import { z } from "zod";

export const statusResponseSchema = z.object({
  updated_at: z.string().refine((date) => !Number.isNaN(Date.parse(date)), { message: "Data inválida." }),

  database: z.object({
    version: z.string(),
    maxConnections: z.string(),
    openedConnections: z.number(),
  }),
});
