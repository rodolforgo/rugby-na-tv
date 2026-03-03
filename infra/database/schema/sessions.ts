import { pgTable, uuid, timestamp, varchar } from "drizzle-orm/pg-core";
import { usersSchema } from "./users";

export const sessionSchema = pgTable("sessions", {
  id: uuid().defaultRandom().primaryKey(),
  sessionToken: varchar({ length: 255 }).notNull().unique(),
  userId: uuid()
    .notNull()
    .references(() => usersSchema.id, { onDelete: "cascade" }),
  expires: timestamp({ withTimezone: true }).notNull(),
});
