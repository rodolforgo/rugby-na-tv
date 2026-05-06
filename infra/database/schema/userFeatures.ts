import { pgTable, uuid, primaryKey } from "drizzle-orm/pg-core";
import { usersSchema } from "./users";
import { featuresSchema } from "./features";

export const userFeaturesSchema = pgTable(
  "user_features",
  {
    userId: uuid()
      .notNull()
      .references(() => usersSchema.id, { onDelete: "cascade" }),
    featureId: uuid()
      .notNull()
      .references(() => featuresSchema.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.userId, table.featureId] })],
);
