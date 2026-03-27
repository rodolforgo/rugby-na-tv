import { cleanDb, runMigrations, waitWebServer, createTestUser } from "@/tests/orchestrator";

beforeAll(async () => {
  await waitWebServer();
  await cleanDb();
  await runMigrations();
});

describe("GET /api/v1/users", () => {
  test("Retorna lista vazia quando não há usuários cadastrados", async () => {
    const response = await fetch("http://localhost:3000/api/v1/users");

    const responseBody = await response.json();

    expect(response.status).toBe(200);
    expect(responseBody).toEqual([]);
  });

  test("Retorna lista com usuários cadastrados", async () => {
    const user = await createTestUser();

    const response = await fetch("http://localhost:3000/api/v1/users");
    const responseBody = await response.json();

    expect(response.status).toBe(200);
    expect(responseBody).toHaveLength(1);
    expect(responseBody[0]).toEqual({
      id: user.id,
      email: user.email,
      password: user.password,
      emailVerified: null,
      created_at: responseBody[0].created_at,
      updated_at: responseBody[0].updated_at,
    });
  });
});
