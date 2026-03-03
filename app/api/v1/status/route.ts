import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { runQueryClient } from "@/infra/database/client";
import { methodNotAllowedResponse } from "@/infra/errors";
import controller from "@/infra/controller";

export const GET = controller.errorHandler(async () => {
  const updatedAt = new Date().toISOString();
  const databaseName = process.env.POSTGRES_DB;

  const dbResponse = await runQueryClient(async (db) => {
    const version = await db.execute(sql`SHOW server_version;`);
    const maxConnections = await db.execute(sql`SHOW max_connections;`);
    const openedConnections = await db.execute(
      sql`SELECT count(*)::int AS total 
     FROM pg_stat_activity 
     WHERE datname = ${databaseName}`,
    );
    return { version, maxConnections, openedConnections };
  });

  const res = {
    updated_at: updatedAt,
    database: {
      version: dbResponse.version.rows[0]?.server_version,
      maxConnections: dbResponse.maxConnections.rows[0]?.max_connections,
      openedConnections: dbResponse.openedConnections.rows[0]?.total,
    },
  };

  return NextResponse.json(res);
});

export const POST = methodNotAllowedResponse;
export const PUT = methodNotAllowedResponse;
export const DELETE = methodNotAllowedResponse;
export const PATCH = methodNotAllowedResponse;
