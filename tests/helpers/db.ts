import { runQueryClient } from "@/infra/database/client";
import migrator from "@/models/migrator";
import seed from "@/infra/database/seed";

export async function cleanDb() {
  await runQueryClient(async (db) => {
    await db.execute("DROP SCHEMA PUBLIC CASCADE; CREATE SCHEMA PUBLIC;");
    await db.execute('DROP TABLE IF EXISTS "drizzle"."__drizzle_migrations"');
  });
}

export async function runMigrations() {
  await migrator.runMigrations();
  await seed.seedFeatures();
}
