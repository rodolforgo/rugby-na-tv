import { NextResponse } from "next/server";
import { methodNotAllowedResponse } from "@/infra/errors";
import controller from "@/infra/controller";
import validator from "@/models/validator";
import { syncGamesSchema } from "@/domain/games/games.schema";
import games from "@/models/games";

export const POST = controller.errorHandler(async (req) => {
  const body = await req.json();

  validator.validateBody(syncGamesSchema, body);

  const result = await games.syncByDate(body.date);

  return NextResponse.json(result, { status: 200 });
});

export const GET = methodNotAllowedResponse;
export const PUT = methodNotAllowedResponse;
export const DELETE = methodNotAllowedResponse;
export const PATCH = methodNotAllowedResponse;
