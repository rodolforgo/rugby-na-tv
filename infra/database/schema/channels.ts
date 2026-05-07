import { pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core";

export const channelsSchema = pgTable("channels", {
  id: uuid().defaultRandom().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  logo: varchar({ length: 500 }),
  url: varchar({ length: 500 }),
  created_at: timestamp({ withTimezone: true }).defaultNow().notNull(),
});
