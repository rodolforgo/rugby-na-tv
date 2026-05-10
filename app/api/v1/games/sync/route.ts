import { NextResponse } from "next/server";
import { methodNotAllowedResponse, UnauthorizedError } from "@/infra/errors";
import controller from "@/infra/controller";
import validator from "@/models/validator";
import { syncGamesSchema } from "@/domain/games/games.schema";
import games from "@/models/games";

export const POST = controller.errorHandler(async (req) => {
  const token = req.headers.get("Authorization")?.replace("Bearer ", "");

  if (!process.env.SYNC_SECRET || token !== process.env.SYNC_SECRET) {
    throw new UnauthorizedError();
  }

  const body = await req.json();

  validator.validateBody(syncGamesSchema, body);

  const result = await games.syncByDate(body.date);

  return NextResponse.json({ synced: result.gamesTotal }, { status: 200 });
});

export const GET = methodNotAllowedResponse;
export const PUT = methodNotAllowedResponse;
export const DELETE = methodNotAllowedResponse;
export const PATCH = methodNotAllowedResponse;
