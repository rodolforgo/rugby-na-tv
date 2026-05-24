import { pgTable, uuid, unique, boolean } from "drizzle-orm/pg-core";
import { gamesSchema } from "./games";
import { channelsSchema } from "./channels";

export const gameChannelsSchema = pgTable(
  "game_channels",
  {
    id: uuid().defaultRandom().primaryKey(),
    gameId: uuid()
      .notNull()
      .references(() => gamesSchema.id, { onDelete: "cascade" }),
    channelId: uuid()
      .notNull()
      .references(() => channelsSchema.id, { onDelete: "cascade" }),
    voteable: boolean().notNull().default(true),
  },
  (t) => [unique().on(t.gameId, t.channelId)],
);
