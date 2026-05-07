import { db } from "@/infra/database";
import { verificationTokensSchema } from "@/infra/database/schema/verificationTokens";
import { usersSchema } from "@/infra/database/schema/users";
import { ValidationError } from "@/infra/errors";
import { eq } from "drizzle-orm";
import users from "@/models/users";

const TOKEN_EXPIRATION_MS = 24 * 60 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;

async function createVerificationToken(email: string): Promise<string> {
  const token = crypto.randomUUID();
  const expires = new Date(Date.now() + TOKEN_EXPIRATION_MS);

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

async function resendVerificationToken(email: string): Promise<string> {
  const user = await db.query.usersSchema.findFirst({
    where: eq(usersSchema.email, email),
  });

  if (!user) {
    throw new ValidationError("Não foi possível processar a solicitação.", {
      action: "Verifique o email informado e tente novamente.",
    });
  }

  if (user.emailVerified) {
    throw new ValidationError("Email já verificado.", {
      action: "Faça login para acessar sua conta.",
    });
  }

  const existingToken = await db.query.verificationTokensSchema.findFirst({
    where: eq(verificationTokensSchema.identifier, email),
  });

  if (existingToken) {
    const tokenCreatedAt = existingToken.expires.getTime() - TOKEN_EXPIRATION_MS;
    const cooldownEnd = tokenCreatedAt + RESEND_COOLDOWN_MS;

    if (Date.now() < cooldownEnd) {
      throw new ValidationError("Aguarde antes de solicitar um novo link de verificação.", {
        action: "Verifique sua caixa de entrada ou tente novamente em instantes.",
      });
    }

    await db.delete(verificationTokensSchema).where(eq(verificationTokensSchema.identifier, email));
  }

  const token = await createVerificationToken(email);

  await users.addFeatureToUser(user.id, "read:activation_token");

  return token;
}

const emailVerification = { createVerificationToken, verifyEmailToken, resendVerificationToken };

export default emailVerification;
