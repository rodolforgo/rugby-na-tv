import { NextResponse } from "next/server";
import { methodNotAllowedResponse, UnauthorizedError, ValidationError } from "@/infra/errors";
import controller from "@/infra/controller";
import games from "@/models/games";

export const GET = controller.errorHandler(async (req) => {
  const token = req.headers.get("Authorization")?.replace("Bearer ", "");

  if (!process.env.SYNC_SECRET || token !== process.env.SYNC_SECRET) {
    throw new UnauthorizedError();
  }

  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");

  if (!date) {
    throw new ValidationError("O parâmetro date é obrigatório.", {
      action: "Informe uma data no formato YYYY-MM-DD.",
    });
  }

  const result = await games.compareBroadcasts(date);

  return NextResponse.json(result);
});

export const POST = methodNotAllowedResponse;
export const PUT = methodNotAllowedResponse;
export const DELETE = methodNotAllowedResponse;
export const PATCH = methodNotAllowedResponse;
