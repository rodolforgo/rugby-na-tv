import { pgTable, integer, varchar, timestamp, uuid } from "drizzle-orm/pg-core";

export const gamesSchema = pgTable("games", {
  id: uuid().defaultRandom().primaryKey(),
  apiId: integer().unique(),
  date: timestamp({ withTimezone: true }).notNull(),
  timestamp: integer().notNull(),
  countryName: varchar({ length: 255 }).notNull(),
  countryFlag: varchar({ length: 500 }),
  leagueName: varchar({ length: 255 }).notNull(),
  leagueLogo: varchar({ length: 500 }),
  homeTeamName: varchar({ length: 255 }).notNull(),
  homeTeamLogo: varchar({ length: 500 }),
  awayTeamName: varchar({ length: 255 }).notNull(),
  awayTeamLogo: varchar({ length: 500 }),
  scoresHome: integer(),
  scoresAway: integer(),
  created_at: timestamp({ withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp({ withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});
