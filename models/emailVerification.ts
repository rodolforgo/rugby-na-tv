import { db } from "@/infra/database";
import { verificationTokensSchema } from "@/infra/database/schema/verificationTokens";
import { usersSchema } from "@/infra/database/schema/users";
import { ValidationError } from "@/infra/errors";
import { eq } from "drizzle-orm";
import users from "@/models/users";

async function createVerificationToken(email: string): Promise<string> {
  const token = crypto.randomUUID();
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await db.insert(verificationTokensSchema).values({ identifier: email, token, expires });

  return token;
}

async function verifyEmailToken(token: string) {
  const record = await db.query.verificationTokensSchema.findFirst({
    where: eq(verificationTokensSchema.token, token),
  });

  if (!record) {
    throw new ValidationError("Token de verificação inválido.", {
      action: "Solicite um novo link de verificação.",
    });
  }

  if (record.expires < new Date()) {
    await db.delete(verificationTokensSchema).where(eq(verificationTokensSchema.token, token));
    throw new ValidationError("Token de verificação expirado.", {
      action: "Solicite um novo link de verificação.",
    });
  }

  const [updatedUser] = await db
    .update(usersSchema)
    .set({ emailVerified: new Date() })
    .where(eq(usersSchema.email, record.identifier))
    .returning({ id: usersSchema.id });

  await db.delete(verificationTokensSchema).where(eq(verificationTokensSchema.token, token));

  await users.removeFeatureFromUser(updatedUser.id, "read:activation_token");
}

const emailVerification = { createVerificationToken, verifyEmailToken };

export default emailVerification;
