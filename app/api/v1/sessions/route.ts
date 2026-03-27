import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { methodNotAllowedResponse } from "@/infra/errors";
import controller from "@/infra/controller";
import validator from "@/models/validator";
import { createSessionSchema } from "@/domain/sessions/sessions.schema";
import sessions from "@/models/sessions";

export const POST = controller.errorHandler(async (req) => {
  const body = await req.json();

  validator.validateBody(createSessionSchema, body);

  const newSession = await sessions.createSession(body);

  const cookieStore = await cookies();
  cookieStore.set("session_token", newSession.sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: newSession.expires,
  });

  return NextResponse.json({ session_token: newSession.sessionToken }, { status: 201 });
});

export const GET = methodNotAllowedResponse;
export const PUT = methodNotAllowedResponse;
export const DELETE = methodNotAllowedResponse;
export const PATCH = methodNotAllowedResponse;
