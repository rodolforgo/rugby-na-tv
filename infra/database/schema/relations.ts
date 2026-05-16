import { relations } from "drizzle-orm";
import { gamesSchema } from "./games";
import { channelsSchema } from "./channels";
import { gameChannelsSchema } from "./gameChannels";

export const gamesRelations = relations(gamesSchema, ({ many }) => ({
  gameChannels: many(gameChannelsSchema),
}));

export const channelsRelations = relations(channelsSchema, ({ many }) => ({
  gameChannels: many(gameChannelsSchema),
}));

export const gameChannelsRelations = relations(gameChannelsSchema, ({ one }) => ({
  game: one(gamesSchema, { fields: [gameChannelsSchema.gameId], references: [gamesSchema.id] }),
  channel: one(channelsSchema, { fields: [gameChannelsSchema.channelId], references: [channelsSchema.id] }),
}));
