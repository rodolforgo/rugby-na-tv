import { pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core";

export const featuresSchema = pgTable("features", {
  id: uuid().defaultRandom().primaryKey(),
  name: varchar({ length: 255 }).notNull().unique(),
  description: varchar({ length: 500 }),
  created_at: timestamp({ withTimezone: true }).defaultNow().notNull(),
});
