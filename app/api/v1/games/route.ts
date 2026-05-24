import { NextResponse } from "next/server";
import { methodNotAllowedResponse } from "@/infra/errors";
import controller from "@/infra/controller";
import validator from "@/models/validator";
import users from "@/models/users";
import games from "@/models/games";
import { createUserGameSchema } from "@/domain/games/games.schema";

export const revalidate = 1800;

export const GET = controller.errorHandler(async () => {
  const result = await games.listForDisplay();

  return NextResponse.json(result);
});

export const POST = controller.errorHandler(async (req) => {
  const userId = await users.requireFeature("create:user_game");
  const body = await req.json();
  const data = validator.validateBody(createUserGameSchema, body);
  const game = await games.createUserGame(userId, data);

  return NextResponse.json(game, { status: 201 });
});

export const PUT = methodNotAllowedResponse;
export const DELETE = methodNotAllowedResponse;
export const PATCH = methodNotAllowedResponse;
