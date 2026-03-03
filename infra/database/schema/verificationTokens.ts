import { pgTable, timestamp, varchar, primaryKey } from "drizzle-orm/pg-core";

export const verificationTokensSchema = pgTable(
  "verification_tokens",
  {
    identifier: varchar({ length: 254 }).notNull(),
    token: varchar({ length: 255 }).notNull().unique(),
    expires: timestamp({ withTimezone: true }).notNull(),
  },
  (verificationToken) => [
    {
      compositePk: primaryKey({
        columns: [verificationToken.identifier, verificationToken.token],
      }),
    },
  ],
);
