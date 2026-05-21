import { pgTable, uuid, varchar, timestamp, unique } from "drizzle-orm/pg-core";
import { usersSchema } from "./users";
import { gamesSchema } from "./games";
import { channelsSchema } from "./channels";

export const userGameChannelVotesSchema = pgTable(
  "user_game_channel_votes",
  {
    id: uuid().defaultRandom().primaryKey(),
    userId: uuid()
      .notNull()
      .references(() => usersSchema.id, { onDelete: "cascade" }),
    gameId: uuid()
      .notNull()
      .references(() => gamesSchema.id, { onDelete: "cascade" }),
    channelId: uuid()
      .notNull()
      .references(() => channelsSchema.id, { onDelete: "cascade" }),
    voteType: varchar({ length: 10 }).notNull(),
    created_at: timestamp({ withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp({ withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (t) => [unique().on(t.userId, t.gameId, t.channelId)],
);
