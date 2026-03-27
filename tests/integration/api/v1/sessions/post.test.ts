import { cleanDb, runMigrations, waitWebServer, createTestUser } from "@/tests/orchestrator";

beforeAll(async () => {
  await waitWebServer();
  await cleanDb();
  await runMigrations();
});

describe("POST /api/v1/sessions", () => {
  describe("Usuário anônimo", () => {
    test("Cria sessão com credenciais válidas e define cookie de 7 dias", async () => {
      const user = await createTestUser();

      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          password: user.rawPassword,
        }),
      });

      const responseBody = await response.json();

      expect(response.status).toBe(201);
      expect(responseBody.session_token).toBeDefined();

      const setCookieHeader = response.headers.get("Set-Cookie");
      expect(setCookieHeader).not.toBeNull();

      expect(setCookieHeader).not.toBeNull();
      if (!setCookieHeader) return;

      const expiresMatch = setCookieHeader.match(/Expires=([^;]+)/i);

      expect(expiresMatch).not.toBeNull();
      if (!expiresMatch) return;

      const expiresDate = new Date(expiresMatch[1]).getTime();
      const diffDays = (expiresDate - Date.now()) / 1000 / 60 / 60 / 24;
      expect(diffDays).toBeGreaterThan(6.9);
      expect(diffDays).toBeLessThan(7.1);
    });

    test("Retorna 400 ao enviar body nulo", async () => {
      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      expect(response.status).toBe(400);
    });

    test("Retorna 400 com email inválido", async () => {
      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "não-é-email", password: "Senha123!" }),
      });

      expect(response.status).toBe(400);
    });

    test("Retorna 401 com senha incorreta", async () => {
      const user = await createTestUser();

      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, password: "SenhaErrada!" }),
      });

      expect(response.status).toBe(401);
    });
  });
});
