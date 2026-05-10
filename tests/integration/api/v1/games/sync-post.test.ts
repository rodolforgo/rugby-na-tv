import { cleanDb, runMigrations, waitWebServer } from "@/tests/orchestrator";

const SYNC_URL = "http://localhost:3000/api/v1/games/sync";

beforeAll(async () => {
  await waitWebServer();
  await cleanDb();
  await runMigrations();
});

describe("POST /api/v1/games/sync", () => {
  describe("Sincronização de jogos", () => {
    test("Sincroniza jogos de uma data e retorna resumo", async () => {
      const response = await fetch(SYNC_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: "2026-05-07" }),
      });

      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.date).toBe("2026-05-07");
      expect(typeof body.gamesTotal).toBe("number");
      expect(body.syncedAt).toBeDefined();
    });

    test("Retorna 400 com data em formato inválido", async () => {
      const response = await fetch(SYNC_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: "07-05-2026" }),
      });

      expect(response.status).toBe(400);
    });

    test("Retorna 400 com data inexistente", async () => {
      const response = await fetch(SYNC_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: "2026-02-30" }),
      });

      expect(response.status).toBe(400);
    });

    test("Retorna 400 sem body", async () => {
      const response = await fetch(SYNC_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      expect(response.status).toBe(400);
    });
  });
});
