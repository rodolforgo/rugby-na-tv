import { migrate } from "drizzle-orm/postgres-js/migrator";
import { getNewClient } from "@/infra/database/client";
import type { Client } from "pg";
import path from "node:path";
import { sql } from "drizzle-orm";

async function runMigrations() {
  let client: Client | undefined;

  try {
    const newClient = await getNewClient();
    client = newClient.client;

    const migrationsPath = path.resolve(process.cwd(), "infra/database/migrations");

    await migrate(newClient.db, {
      migrationsFolder: migrationsPath,
    });

    const res = await newClient.db.execute(sql`SELECT COUNT(*) AS total FROM drizzle.__drizzle_migrations;`);

    console.log("Migrations executadas com sucesso. Total de migrations aplicadas:", res.rows[0]?.total);
  } catch (error) {
    console.error("Erro ao executar as migrations:", error);
    throw error;
  } finally {
    await client?.end();
  }
}

const migrator = {
  runMigrations,
};

export default migrator;
