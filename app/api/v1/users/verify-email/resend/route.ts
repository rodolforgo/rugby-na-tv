import { NextResponse } from "next/server";
import { methodNotAllowedResponse } from "@/infra/errors";
import controller from "@/infra/controller";
import validator from "@/models/validator";
import { resendEmailSchema } from "@/domain/users/users.schema";
import emailVerification from "@/models/emailVerification";
import mailer from "@/infra/mailer";

export const POST = controller.errorHandler(async (req) => {
  const body = await req.json();

  validator.validateBody(resendEmailSchema, body);

  const token = await emailVerification.resendVerificationToken(body.email);
  await mailer.sendVerificationEmail(body.email, token);

  return NextResponse.json({ message: "Email de verificação reenviado." }, { status: 200 });
});

export const GET = methodNotAllowedResponse;
export const PUT = methodNotAllowedResponse;
export const DELETE = methodNotAllowedResponse;
export const PATCH = methodNotAllowedResponse;
