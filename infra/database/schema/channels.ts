import { pgTable, uuid, varchar, timestamp, unique } from "drizzle-orm/pg-core";

export const channelsSchema = pgTable(
  "channels",
  {
    id: uuid().defaultRandom().primaryKey(),
    name: varchar({ length: 255 }).notNull(),
    url: varchar({ length: 500 }),
    created_at: timestamp({ withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [unique().on(t.name)],
);
