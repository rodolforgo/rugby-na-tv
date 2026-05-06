import users from "@/models/users";
import { cleanDb, createTestUser, runMigrations, waitWebServer } from "@/tests/orchestrator";

beforeAll(async () => {
  await waitWebServer();
  await cleanDb();
  await runMigrations();
});

describe("users.addFeatureToUser", () => {
  test("Adiciona feature ao usuário", async () => {
    const user = await createTestUser();

    await users.addFeatureToUser(user.id, "read:activation_token");

    const features = await users.getUserFeatures(user.id);
    expect(features).toContain("read:activation_token");
  });

  test("Adicionar feature duplicada mantém uma única ocorrência", async () => {
    const user = await createTestUser();

    await users.addFeatureToUser(user.id, "read:activation_token");
    await users.addFeatureToUser(user.id, "read:activation_token");

    const features = await users.getUserFeatures(user.id);
    expect(features).toEqual(["read:activation_token"]);
  });

  test("Lança erro ao tentar adicionar feature não cadastrada", async () => {
    const user = await createTestUser();

    await expect(users.addFeatureToUser(user.id, "feature:inexistente")).rejects.toThrow('Feature "feature:inexistente" não encontrada.');
  });
});

describe("users.removeFeatureFromUser", () => {
  test("Remove feature do usuário", async () => {
    const user = await createTestUser();
    await users.addFeatureToUser(user.id, "read:activation_token");

    await users.removeFeatureFromUser(user.id, "read:activation_token");

    const features = await users.getUserFeatures(user.id);
    expect(features).not.toContain("read:activation_token");
  });

  test("Remover feature inexistente não lança erro", async () => {
    const user = await createTestUser();

    await expect(users.removeFeatureFromUser(user.id, "read:activation_token")).resolves.not.toThrow();
  });
});

describe("users.getUserFeatures", () => {
  test("Retorna lista vazia quando usuário não tem features", async () => {
    const user = await createTestUser();

    const features = await users.getUserFeatures(user.id);
    expect(features).toEqual([]);
  });

  test("Retorna as features do usuário", async () => {
    const user = await createTestUser();
    await users.addFeatureToUser(user.id, "read:activation_token");

    const features = await users.getUserFeatures(user.id);
    expect(features).toEqual(["read:activation_token"]);
  });
});

describe("users.hasFeature", () => {
  test("Retorna true quando usuário tem a feature", async () => {
    const user = await createTestUser();
    await users.addFeatureToUser(user.id, "read:activation_token");

    expect(await users.hasFeature(user.id, "read:activation_token")).toBe(true);
  });

  test("Retorna false quando usuário não tem a feature", async () => {
    const user = await createTestUser();

    expect(await users.hasFeature(user.id, "read:activation_token")).toBe(false);
  });
});
