import { db } from "@/infra/database";
import { verificationTokensSchema } from "@/infra/database/schema/verificationTokens";
import { usersSchema } from "@/infra/database/schema/users";
import { eq } from "drizzle-orm";
import { cleanDb, clearMailcatcher, createTestUser, createTestUserViaApi, getLastVerificationToken, runMigrations, waitWebServer } from "@/tests/orchestrator";

beforeAll(async () => {
  await waitWebServer();
  await cleanDb();
  await runMigrations();
});

describe("GET /api/v1/users/verify-email", () => {
  test("Fluxo completo: cria usuário, captura token do email e verifica o cadastro", async () => {
    await clearMailcatcher();

    const { email } = await createTestUserViaApi();
    const token = await getLastVerificationToken(email);

    const response = await fetch(`http://localhost:3000/api/v1/users/verify-email?token=${token}`);
    const responseBody = await response.json();

    expect(response.status).toBe(200);
    expect(responseBody.message).toBe("Email verificado com sucesso.");

    const updatedUser = await db.query.usersSchema.findFirst({
      where: eq(usersSchema.email, email),
    });

    expect(updatedUser?.emailVerified).not.toBeNull();
  });

  test("Com token válido verifica o email do usuário", async () => {
    const user = await createTestUser();
    const token = crypto.randomUUID();
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await db.insert(verificationTokensSchema).values({
      identifier: user.email,
      token,
      expires,
    });

    const response = await fetch(`http://localhost:3000/api/v1/users/verify-email?token=${token}`);
    const responseBody = await response.json();

    expect(response.status).toBe(200);
    expect(responseBody.message).toBe("Email verificado com sucesso.");

    const updatedUser = await db.query.usersSchema.findFirst({
      where: eq(usersSchema.id, user.id),
    });

    expect(updatedUser?.emailVerified).not.toBeNull();
  });

  test("Com token inexistente retorna 400", async () => {
    const response = await fetch(`http://localhost:3000/api/v1/users/verify-email?token=${crypto.randomUUID()}`);
    const responseBody = await response.json();

    expect(response.status).toBe(400);
    expect(responseBody.name).toBe("ValidationError");
  });

  test("Com token expirado retorna 400 e remove o token do banco", async () => {
    const user = await createTestUser();
    const token = crypto.randomUUID();
    const expires = new Date(Date.now() - 1000);

    await db.insert(verificationTokensSchema).values({
      identifier: user.email,
      token,
      expires,
    });

    const response = await fetch(`http://localhost:3000/api/v1/users/verify-email?token=${token}`);
    const responseBody = await response.json();

    expect(response.status).toBe(400);
    expect(responseBody.name).toBe("ValidationError");

    const deletedToken = await db.query.verificationTokensSchema.findFirst({
      where: eq(verificationTokensSchema.token, token),
    });

    expect(deletedToken).toBeUndefined();
  });

  test("Sem token retorna 400", async () => {
    const response = await fetch("http://localhost:3000/api/v1/users/verify-email");
    const responseBody = await response.json();

    expect(response.status).toBe(400);
    expect(responseBody.name).toBe("ValidationError");
  });
});
