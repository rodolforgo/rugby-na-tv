import { db } from "@/infra/database";
import { eq } from "drizzle-orm";
import { usersSchema } from "@/infra/database/schema/users";
import { ValidationError, UnauthorizedError } from "@/infra/errors";
import type { CreateUserSchema } from "@/domain/users/users.schema";
import bcrypt from "bcrypt";

async function validateUniqueEmail(email: string) {
  const existingUser = await db.query.usersSchema.findFirst({
    where: eq(usersSchema.email, email),
  });

  if (existingUser) {
    throw new ValidationError("O e-mail já está em uso.", { action: "Utilize outro e-mail para cadastrar o usuário." });
  }
}

async function getUserByEmail(email: string) {
  const user = await db.query.usersSchema.findFirst({
    where: eq(usersSchema.email, email),
  });

  if (!user) {
    throw new UnauthorizedError();
  }

  return user;
}

async function getAllUsers() {
  return await db.query.usersSchema.findMany();
}

async function createNewUser(userInputValues: CreateUserSchema) {
  await validateUniqueEmail(userInputValues.email);

  const hashedPassword = await bcrypt.hash(userInputValues.password, 10);

  const newUser = await db
    .insert(usersSchema)
    .values({
      email: userInputValues.email,
      password: hashedPassword,
      emailVerified: null,
    })
    .returning();

  return newUser[0];
}

const users = { validateUniqueEmail, createNewUser, getAllUsers, getUserByEmail };

export default users;
