import { pgTable, uuid, varchar, integer, timestamp, date } from "drizzle-orm/pg-core";

export const syncLogsSchema = pgTable("sync_logs", {
  id: uuid().defaultRandom().primaryKey(),
  syncedDate: date().notNull(),
  gamesTotal: integer().notNull(),
  status: varchar({ length: 20 }).notNull(),
  errorMessage: varchar({ length: 500 }),
  created_at: timestamp({ withTimezone: true }).defaultNow().notNull(),
});
