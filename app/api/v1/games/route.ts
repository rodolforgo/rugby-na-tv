import { NextResponse } from "next/server";
import { methodNotAllowedResponse } from "@/infra/errors";
import controller from "@/infra/controller";
import games from "@/models/games";

export const revalidate = 1800;

export const GET = controller.errorHandler(async () => {
  const result = await games.listForDisplay();

  return NextResponse.json(result);
});

export const POST = methodNotAllowedResponse;
export const PUT = methodNotAllowedResponse;
export const DELETE = methodNotAllowedResponse;
export const PATCH = methodNotAllowedResponse;
