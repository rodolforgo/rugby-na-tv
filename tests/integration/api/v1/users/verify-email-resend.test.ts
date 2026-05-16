import { db } from "@/infra/database";
import { verificationTokensSchema } from "@/infra/database/schema/verificationTokens";
import { eq } from "drizzle-orm";
import emailVerification from "@/models/emailVerification";
import users from "@/models/users";
import {
  cleanDb,
  clearMailcatcher,
  createTestUser,
  createTestUserViaApi,
  getLastVerificationToken,
  runMigrations,
  setTokenExpires,
  verifyUserEmail,
  waitWebServer,
} from "@/tests/helpers";

const RESEND_URL = "http://localhost:3000/api/v1/users/verify-email/resend";

beforeAll(async () => {
  await waitWebServer();
  await cleanDb();
  await runMigrations();
});

describe("POST /api/v1/users/verify-email/resend", () => {
  test("Reenvia email de verificação com sucesso", async () => {
    await clearMailcatcher();
    const { email } = await createTestUserViaApi();

    await setTokenExpires(email, new Date(Date.now() + 24 * 60 * 60 * 1000 - 2 * 60 * 1000));

    const response = await fetch(RESEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const responseBody = await response.json();

    expect(response.status).toBe(200);
    expect(responseBody.message).toBe("Email de verificação reenviado.");

    const newToken = await getLastVerificationToken(email);
    expect(newToken).toBeDefined();
  });

  test("Substitui token anterior pelo novo ao reenviar", async () => {
    const { email } = await createTestUserViaApi();

    const oldToken = await db.query.verificationTokensSchema.findFirst({
      where: eq(verificationTokensSchema.identifier, email),
    });

    await setTokenExpires(email, new Date(Date.now() + 24 * 60 * 60 * 1000 - 2 * 60 * 1000));

    await fetch(RESEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const newToken = await db.query.verificationTokensSchema.findFirst({
      where: eq(verificationTokensSchema.identifier, email),
    });

    expect(newToken?.token).not.toBe(oldToken?.token);
  });

  test("Retorna 400 dentro do cooldown", async () => {
    const { email } = await createTestUserViaApi();

    const response = await fetch(RESEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const responseBody = await response.json();

    expect(response.status).toBe(400);
    expect(responseBody.name).toBe("ValidationError");
  });

  test("Retorna 400 para email já verificado", async () => {
    const user = await createTestUser();

    await verifyUserEmail(user.id);

    const response = await fetch(RESEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: user.email }),
    });

    const responseBody = await response.json();

    expect(response.status).toBe(400);
    expect(responseBody.name).toBe("ValidationError");
  });

  test("Retorna 400 para email não cadastrado", async () => {
    const response = await fetch(RESEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "naoexiste@email.com" }),
    });

    const responseBody = await response.json();

    expect(response.status).toBe(400);
    expect(responseBody.name).toBe("ValidationError");
  });

  test("Retorna 400 sem body", async () => {
    const response = await fetch(RESEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const responseBody = await response.json();

    expect(response.status).toBe(400);
    expect(responseBody.name).toBe("ValidationError");
  });
});

describe("emailVerification.resendVerificationToken", () => {
  beforeEach(() => {
    jest.useFakeTimers({ doNotFake: ["nextTick", "setImmediate", "clearImmediate"] });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("Lança erro ao tentar reenviar dentro do cooldown", async () => {
    const t0 = new Date("2025-01-01T00:00:00Z");
    jest.setSystemTime(t0);

    const user = await createTestUser();
    await emailVerification.createVerificationToken(user.email);

    jest.setSystemTime(new Date("2025-01-01T00:00:30Z"));

    await expect(emailVerification.resendVerificationToken(user.email)).rejects.toThrow(
      "Aguarde antes de solicitar um novo link de verificação.",
    );
  });

  test("Permite reenvio após o cooldown expirar", async () => {
    const t0 = new Date("2025-01-01T00:00:00Z");
    jest.setSystemTime(t0);

    const user = await createTestUser();
    await emailVerification.createVerificationToken(user.email);

    jest.setSystemTime(new Date("2025-01-01T00:02:00Z"));

    const token = await emailVerification.resendVerificationToken(user.email);
    expect(token).toBeDefined();
  });

  test("Novo token expira exatamente em 24 horas", async () => {
    const t0 = new Date("2025-01-01T00:00:00Z");
    jest.setSystemTime(t0);

    const user = await createTestUser();
    const token = await emailVerification.resendVerificationToken(user.email);

    const tokenRecord = await db.query.verificationTokensSchema.findFirst({
      where: eq(verificationTokensSchema.token, token),
    });

    expect(tokenRecord?.expires).toEqual(new Date("2025-01-02T00:00:00Z"));
  });

  test("Readiciona feature read:activation_token após reenvio", async () => {
    jest.setSystemTime(new Date("2025-01-01T00:00:00Z"));

    const user = await createTestUser();
    await users.addFeatureToUser(user.id, "read:activation_token");
    await users.removeFeatureFromUser(user.id, "read:activation_token");

    expect(await users.hasFeature(user.id, "read:activation_token")).toBe(false);

    await emailVerification.resendVerificationToken(user.email);

    expect(await users.hasFeature(user.id, "read:activation_token")).toBe(true);
  });
});
