import { NextResponse } from "next/server";
import { methodNotAllowedResponse } from "@/infra/errors";
import controller from "@/infra/controller";
import validator from "@/models/validator";
import { createUserSchema } from "@/domain/users/users.schema";
import users from "@/models/users";

export const GET = controller.errorHandler(async () => {
  const allUsers = await users.getAllUsers();

  return NextResponse.json(allUsers, { status: 200 });
});

export const POST = controller.errorHandler(async (req) => {
  const body = await req.json();

  validator.validateBody(createUserSchema, body);

  const newUser = await users.createNewUser(body);

  return NextResponse.json(newUser, { status: 201 });
});

export const PUT = methodNotAllowedResponse;
export const DELETE = methodNotAllowedResponse;
export const PATCH = methodNotAllowedResponse;
