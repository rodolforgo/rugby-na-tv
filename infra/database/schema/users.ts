import { pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core";

export const usersSchema = pgTable("users", {
  id: uuid().defaultRandom().primaryKey(),
  email: varchar({ length: 254 }).notNull().unique(),
  password: varchar({ length: 60 }).notNull(),
  emailVerified: timestamp({ withTimezone: true }),
  created_at: timestamp({ withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp({ withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});
