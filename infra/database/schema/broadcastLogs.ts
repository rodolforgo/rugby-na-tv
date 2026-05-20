import { pgTable, uuid, integer, timestamp, date, jsonb } from "drizzle-orm/pg-core";

export const broadcastLogsSchema = pgTable("broadcast_logs", {
  id: uuid().defaultRandom().primaryKey(),
  syncedDate: date().notNull(),
  roninTotal: integer().notNull(),
  dbGamesTotal: integer().notNull(),
  matched: integer().notNull(),
  unmatched: jsonb().$type<{ homeTeam: string; visitingTeam: string; league: string }[]>().notNull(),
  created_at: timestamp({ withTimezone: true }).defaultNow().notNull(),
});
