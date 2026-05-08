import { NextResponse } from "next/server";
import { ValidationError, methodNotAllowedResponse } from "@/infra/errors";
import controller from "@/infra/controller";
import emailVerification from "@/models/emailVerification";

export const GET = controller.errorHandler(async (req) => {
  const token = new URL(req.url).searchParams.get("token");

  if (!token) {
    throw new ValidationError("O campo token está inválido.", {
      action: "Verifique os dados enviados e tente novamente.",
    });
  }

  await emailVerification.verifyEmailToken(token);

  return NextResponse.json({ message: "Email verificado com sucesso." }, { status: 200 });
});

export const POST = methodNotAllowedResponse;
export const PUT = methodNotAllowedResponse;
export const DELETE = methodNotAllowedResponse;
export const PATCH = methodNotAllowedResponse;
