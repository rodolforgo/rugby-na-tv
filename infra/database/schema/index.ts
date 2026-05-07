import { sessionSchema } from "./sessions";
import { usersSchema } from "./users";
import { verificationTokensSchema } from "./verificationTokens";
import { featuresSchema } from "./features";
import { userFeaturesSchema } from "./userFeatures";
import { gamesSchema } from "./games";

export const schema = {
  usersSchema,
  sessionSchema,
  verificationTokensSchema,
  featuresSchema,
  userFeaturesSchema,
  gamesSchema,
};
