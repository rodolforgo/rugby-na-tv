import { relations } from "drizzle-orm";
import { gamesSchema } from "./games";
import { channelsSchema } from "./channels";
import { gameChannelsSchema } from "./gameChannels";
import { userGameChannelVotesSchema } from "./userGameChannelVotes";
import { usersSchema } from "./users";

export const gamesRelations = relations(gamesSchema, ({ many }) => ({
  gameChannels: many(gameChannelsSchema),
  channelVotes: many(userGameChannelVotesSchema),
}));

export const channelsRelations = relations(channelsSchema, ({ many }) => ({
  gameChannels: many(gameChannelsSchema),
  channelVotes: many(userGameChannelVotesSchema),
}));

export const gameChannelsRelations = relations(gameChannelsSchema, ({ one }) => ({
  game: one(gamesSchema, { fields: [gameChannelsSchema.gameId], references: [gamesSchema.id] }),
  channel: one(channelsSchema, { fields: [gameChannelsSchema.channelId], references: [channelsSchema.id] }),
}));

export const userGameChannelVotesRelations = relations(userGameChannelVotesSchema, ({ one }) => ({
  user: one(usersSchema, { fields: [userGameChannelVotesSchema.userId], references: [usersSchema.id] }),
  game: one(gamesSchema, { fields: [userGameChannelVotesSchema.gameId], references: [gamesSchema.id] }),
  channel: one(channelsSchema, { fields: [userGameChannelVotesSchema.channelId], references: [channelsSchema.id] }),
}));
