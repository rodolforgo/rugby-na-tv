import { sessionSchema } from "./sessions";
import { usersSchema } from "./users";
import { verificationTokensSchema } from "./verificationTokens";
import { featuresSchema } from "./features";
import { userFeaturesSchema } from "./userFeatures";
import { gamesSchema } from "./games";
import { channelsSchema } from "./channels";
import { gameChannelsSchema } from "./gameChannels";
import { syncLogsSchema } from "./syncLogs";
import { broadcastLogsSchema } from "./broadcastLogs";
import { gamesRelations, channelsRelations, gameChannelsRelations, userGameChannelVotesRelations } from "./relations";
import { userGameChannelVotesSchema } from "./userGameChannelVotes";

export const schema = {
  usersSchema,
  sessionSchema,
  verificationTokensSchema,
  featuresSchema,
  userFeaturesSchema,
  gamesSchema,
  channelsSchema,
  gameChannelsSchema,
  syncLogsSchema,
  broadcastLogsSchema,
  userGameChannelVotesSchema,
  gamesRelations,
  channelsRelations,
  gameChannelsRelations,
  userGameChannelVotesRelations,
};
