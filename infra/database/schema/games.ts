import { pgTable, integer, varchar, timestamp } from "drizzle-orm/pg-core";

export const gamesSchema = pgTable("games", {
  id: integer().primaryKey(),
  date: timestamp({ withTimezone: true }).notNull(),
  timestamp: integer().notNull(),
  countryName: varchar({ length: 255 }).notNull(),
  countryFlag: varchar({ length: 500 }).notNull(),
  leagueName: varchar({ length: 255 }).notNull(),
  leagueLogo: varchar({ length: 500 }).notNull(),
  homeTeamName: varchar({ length: 255 }).notNull(),
  homeTeamLogo: varchar({ length: 500 }).notNull(),
  awayTeamName: varchar({ length: 255 }).notNull(),
  awayTeamLogo: varchar({ length: 500 }).notNull(),
  scoresHome: integer(),
  scoresAway: integer(),
  created_at: timestamp({ withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp({ withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});
