import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import { InternalServerError } from "@/infra/errors";

export async function runQueryClient<T>(callback: (db: NodePgDatabase, client: Client) => Promise<T> | T): Promise<T> {
  let client: Client | undefined;

  try {
    const newClient = await getNewClient();
    client = newClient.client;

    const res = await callback(newClient.db, newClient.client);

    return res;
  } catch (error) {
    throw new InternalServerError({ cause: error });
  } finally {
    await client?.end();
  }
}

export async function getNewClient() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: false,
  });

  await client.connect();
  const db = drizzle(client);

  return { db, client };
}
