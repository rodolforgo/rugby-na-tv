import { cleanDb, runMigrations, waitWebServer } from "@/tests/helpers";

const API_SPORTS_URL = "http://localhost:3000/api/v1/games/api-sports";
const VALID_TOKEN = process.env.SYNC_SECRET as string;
const AUTH_HEADER = { Authorization: `Bearer ${VALID_TOKEN}` };

beforeAll(async () => {
  await waitWebServer();
  await cleanDb();
  await runMigrations();
});

describe("POST /api/v1/games/api-sports", () => {
  describe("Autenticação", () => {
    test("Retorna 401 sem header Authorization", async () => {
      const response = await fetch(API_SPORTS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: "2026-05-07" }),
      });

      expect(response.status).toBe(401);
    });

    test("Retorna 401 com token inválido", async () => {
      const response = await fetch(API_SPORTS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer token_errado" },
        body: JSON.stringify({ date: "2026-05-07" }),
      });

      expect(response.status).toBe(401);
    });
  });

  describe("Sincronização de jogos", () => {
    test("Sincroniza jogos de uma data e retorna total", async () => {
      const response = await fetch(API_SPORTS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...AUTH_HEADER },
        body: JSON.stringify({ date: "2026-05-07" }),
      });

      const body = await response.json();

      expect(response.status).toBe(200);
      expect(typeof body.synced).toBe("number");
    });

    test("Retorna 400 com data em formato inválido", async () => {
      const response = await fetch(API_SPORTS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...AUTH_HEADER },
        body: JSON.stringify({ date: "07-05-2026" }),
      });

      expect(response.status).toBe(400);
    });

    test("Retorna 400 com data inexistente", async () => {
      const response = await fetch(API_SPORTS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...AUTH_HEADER },
        body: JSON.stringify({ date: "2026-02-30" }),
      });

      expect(response.status).toBe(400);
    });

    test("Retorna 400 sem body", async () => {
      const response = await fetch(API_SPORTS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...AUTH_HEADER },
      });

      expect(response.status).toBe(400);
    });
  });
});
