import { db } from "@/infra/database";
import { and, eq } from "drizzle-orm";
import { usersSchema } from "@/infra/database/schema/users";
import { featuresSchema } from "@/infra/database/schema/features";
import { userFeaturesSchema } from "@/infra/database/schema/userFeatures";
import { sessionSchema } from "@/infra/database/schema/sessions";
import { ValidationError, UnauthorizedError } from "@/infra/errors";
import type { CreateUserSchema } from "@/domain/users/users.schema";
import bcrypt from "bcrypt";
import { cookies } from "next/headers";

async function validateUniqueEmail(email: string) {
  const existingUser = await db.query.usersSchema.findFirst({
    where: eq(usersSchema.email, email),
  });

  if (existingUser) {
    throw new ValidationError("Não foi possível concluir o cadastro.", {
      action: "Verifique os dados informados e tente novamente.",
    });
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

async function addFeatureToUser(userId: string, featureName: string) {
  const feature = await db.query.featuresSchema.findFirst({
    where: eq(featuresSchema.name, featureName),
  });

  if (!feature) {
    throw new ValidationError(`Feature "${featureName}" não encontrada.`, {
      action: "Utilize apenas features cadastradas no sistema.",
    });
  }

  await db.insert(userFeaturesSchema).values({ userId, featureId: feature.id }).onConflictDoNothing();
}

async function removeFeatureFromUser(userId: string, featureName: string) {
  const feature = await db.query.featuresSchema.findFirst({
    where: eq(featuresSchema.name, featureName),
  });

  if (!feature) return;

  await db.delete(userFeaturesSchema).where(and(eq(userFeaturesSchema.userId, userId), eq(userFeaturesSchema.featureId, feature.id)));
}

async function getUserFeatures(userId: string): Promise<string[]> {
  const results = await db
    .select({ name: featuresSchema.name })
    .from(userFeaturesSchema)
    .innerJoin(featuresSchema, eq(userFeaturesSchema.featureId, featuresSchema.id))
    .where(eq(userFeaturesSchema.userId, userId));

  return results.map((r) => r.name);
}

async function hasFeature(userId: string, featureName: string): Promise<boolean> {
  const features = await getUserFeatures(userId);
  return features.includes(featureName);
}

async function requireFeature(featureName: string): Promise<string> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  if (!token) throw new UnauthorizedError();

  const session = await db.query.sessionSchema.findFirst({
    where: eq(sessionSchema.sessionToken, token),
  });

  if (!session || session.expires < new Date()) throw new UnauthorizedError();

  const allowed = await hasFeature(session.userId, featureName);
  if (!allowed) throw new UnauthorizedError();

  return session.userId;
}

const users = {
  validateUniqueEmail,
  createNewUser,
  getAllUsers,
  getUserByEmail,
  addFeatureToUser,
  removeFeatureFromUser,
  getUserFeatures,
  hasFeature,
  requireFeature,
};

export default users;
