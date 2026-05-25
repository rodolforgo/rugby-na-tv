import { pgTable, integer, varchar, timestamp, uuid } from "drizzle-orm/pg-core";
import { usersSchema } from "@/infra/database/schema/users";

export const gamesSchema = pgTable("games", {
  id: uuid().defaultRandom().primaryKey(),
  apiId: integer().unique(),
  date: timestamp({ withTimezone: true }).notNull(),
  timestamp: integer().notNull(),
  countryName: varchar({ length: 255 }).notNull(),
  leagueName: varchar({ length: 255 }).notNull(),
  homeTeamName: varchar({ length: 255 }).notNull(),
  awayTeamName: varchar({ length: 255 }).notNull(),
  scoresHome: integer(),
  scoresAway: integer(),
  createdByUserId: uuid().references(() => usersSchema.id, { onDelete: "set null" }),
  created_at: timestamp({ withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp({ withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});
