import { cleanDb, runMigrations, waitWebServer } from "@/tests/orchestrator";

const BROADCASTS_URL = "http://localhost:3000/api/v1/games/broadcasts";
const VALID_TOKEN = process.env.SYNC_SECRET as string;
const AUTH_HEADER = { Authorization: `Bearer ${VALID_TOKEN}` };

beforeAll(async () => {
  await waitWebServer();
  await cleanDb();
  await runMigrations();
});

describe("GET /api/v1/games/broadcasts", () => {
  describe("Autenticação", () => {
    test("Retorna 401 sem header Authorization", async () => {
      const response = await fetch(`${BROADCASTS_URL}?date=2026-05-11`);

      expect(response.status).toBe(401);
    });

    test("Retorna 401 com token inválido", async () => {
      const response = await fetch(`${BROADCASTS_URL}?date=2026-05-11`, {
        headers: { Authorization: "Bearer token_errado" },
      });

      expect(response.status).toBe(401);
    });
  });

  describe("Validação", () => {
    test("Retorna 400 sem o parâmetro date", async () => {
      const response = await fetch(BROADCASTS_URL, {
        headers: AUTH_HEADER,
      });

      expect(response.status).toBe(400);
    });
  });

  describe("Busca de transmissões", () => {
    test("Retorna 200 com array de transmissões para uma data", async () => {
      const response = await fetch(`${BROADCASTS_URL}?date=2026-05-11`, {
        headers: AUTH_HEADER,
      });

      const body = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(body)).toBe(true);
    });

    test("Cada transmissão retorna os campos esperados", async () => {
      const response = await fetch(`${BROADCASTS_URL}?date=2026-05-11`, {
        headers: AUTH_HEADER,
      });

      const body = await response.json();

      expect(response.status).toBe(200);

      if (body.length > 0) {
        const broadcast = body[0];
        expect(typeof broadcast.id).toBe("number");
        expect(typeof broadcast.date).toBe("string");
        expect(typeof broadcast.homeTeam).toBe("string");
        expect(typeof broadcast.visitingTeam).toBe("string");
        expect(typeof broadcast.league).toBe("string");
        expect(Array.isArray(broadcast.channels)).toBe(true);

        if (broadcast.channels.length > 0) {
          expect(typeof broadcast.channels[0].name).toBe("string");
        }
      }
    });
  });
});
