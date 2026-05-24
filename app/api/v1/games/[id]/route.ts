import { NextResponse } from "next/server";
import { methodNotAllowedResponse } from "@/infra/errors";
import controller from "@/infra/controller";
import sessions from "@/models/sessions";
import games from "@/models/games";

type RouteContext = { params: Promise<{ id: string }> };

export const DELETE = controller.errorHandler(async (_req, context) => {
  const userId = await sessions.requireSession();
  const { id: gameId } = await (context as RouteContext).params;

  await games.deleteUserGame(userId, gameId);

  return NextResponse.json({ deleted: true });
});

export const GET = methodNotAllowedResponse;
export const POST = methodNotAllowedResponse;
export const PUT = methodNotAllowedResponse;
export const PATCH = methodNotAllowedResponse;
