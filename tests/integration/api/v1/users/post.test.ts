import { cleanDb, runMigrations, waitWebServer } from "@/tests/orchestrator";

beforeAll(async () => {
  await waitWebServer();
  await cleanDb();
  await runMigrations();
});

describe("POST /api/v1/users", () => {
  test("cria um novo usuário", async () => {
    const response = await fetch("http://localhost:3000/api/v1/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "novoUsuario@gmail.com",
        password: "NovoUsuario!",
      }),
    });

    const responseBody = await response.json();

    expect(response.status).toBe(201);

    expect(responseBody).toEqual({
      id: responseBody.id,
      email: "novoUsuario@gmail.com",
      password: responseBody.password,
      emailVerified: null,
      created_at: responseBody.created_at,
      updated_at: responseBody.updated_at,
    });

    expect(responseBody.password).not.toBe("NovoUsuario!");
  });
});

describe("POST /api/v1/users", () => {
  test("Com email duplicado", async () => {
    const response = await fetch("http://localhost:3000/api/v1/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "novoEmail1@gmail.com",
        password: "NovoUsuario!",
      }),
    });

    expect(response.status).toBe(201);

    const response2 = await fetch("http://localhost:3000/api/v1/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "novoEmail1@gmail.com",
        password: "NovoUsuario!",
      }),
    });

    expect(response2.status).toBe(400);
  });
});
