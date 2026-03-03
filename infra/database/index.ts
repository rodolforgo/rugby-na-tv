import { drizzle } from "drizzle-orm/node-postgres";
import { Pool, type PoolClient } from "pg";
import { InternalServerError } from "@/infra/errors";
import { schema } from "./schema";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
  max: 10,
  idleTimeoutMillis: 30000,
});

export const db = drizzle(pool, { schema });

export async function runQueryPool<T>(callback: (client: PoolClient) => Promise<T> | T): Promise<T> {
  let client: PoolClient | undefined;

  try {
    client = await pool.connect();
    const res = await callback(client);
    return res;
  } catch (error) {
    throw new InternalServerError({ cause: error });
  } finally {
    client?.release();
  }
}
