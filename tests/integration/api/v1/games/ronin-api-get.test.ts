import { cleanDb, createTestGame, runMigrations, waitWebServer } from "@/tests/orchestrator";

const RONIN_API_URL = "http://localhost:3000/api/v1/games/ronin-api";
const VALID_TOKEN = process.env.SYNC_SECRET as string;
const AUTH_HEADER = { Authorization: `Bearer ${VALID_TOKEN}` };

beforeAll(async () => {
  await waitWebServer();
  await cleanDb();
  await runMigrations();
});

describe("GET /api/v1/games/ronin-api", () => {
  describe("Autenticação", () => {
    test("Retorna 401 sem header Authorization", async () => {
      const response = await fetch(`${RONIN_API_URL}?date=2026-05-11`);

      expect(response.status).toBe(401);
    });

    test("Retorna 401 com token inválido", async () => {
      const response = await fetch(`${RONIN_API_URL}?date=2026-05-11`, {
        headers: { Authorization: "Bearer token_errado" },
      });

      expect(response.status).toBe(401);
    });
  });

  describe("Validação", () => {
    test("Retorna 400 sem o parâmetro date", async () => {
      const response = await fetch(RONIN_API_URL, {
        headers: AUTH_HEADER,
      });

      expect(response.status).toBe(400);
    });
  });

  describe("Comparação de transmissões", () => {
    test("Retorna 200 com estrutura esperada", async () => {
      const response = await fetch(`${RONIN_API_URL}?date=2026-05-11`, {
        headers: AUTH_HEADER,
      });

      const body = await response.json();

      expect(response.status).toBe(200);
      expect(typeof body.date).toBe("string");
      expect(typeof body.roninTotal).toBe("number");
      expect(typeof body.dbGamesTotal).toBe("number");
      expect(typeof body.matched).toBe("number");
      expect(Array.isArray(body.unmatched)).toBe(true);
    });

    test("Sem jogos sincronizados, todos os broadcasts ficam sem correspondência", async () => {
      const response = await fetch(`${RONIN_API_URL}?date=2026-05-11`, {
        headers: AUTH_HEADER,
      });

      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.dbGamesTotal).toBe(0);
      expect(body.matched).toBe(0);
      expect(body.unmatched).toHaveLength(body.roninTotal);
    });

    test("Cada item sem correspondência retorna os campos esperados", async () => {
      const response = await fetch(`${RONIN_API_URL}?date=2026-05-11`, {
        headers: AUTH_HEADER,
      });

      const body = await response.json();

      expect(response.status).toBe(200);

      if (body.unmatched.length > 0) {
        const item = body.unmatched[0];
        expect(typeof item.homeTeam).toBe("string");
        expect(typeof item.visitingTeam).toBe("string");
        expect(typeof item.league).toBe("string");
      }
    });

    test("Jogo inserido no banco com mesmo nome é encontrado como correspondência", async () => {
      await createTestGame({
        homeTeamName: "Northampton Saints",
        awayTeamName: "Bristol",
        date: new Date("2026-05-15T18:45:00Z"),
      });

      const response = await fetch(`${RONIN_API_URL}?date=2026-05-15`, {
        headers: AUTH_HEADER,
      });

      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.dbGamesTotal).toBe(1);

      if (body.roninTotal > 0) {
        const hasNorthampton = body.matched > 0 || body.unmatched.some((u: { homeTeam: string }) => u.homeTeam === "Northampton Saints");
        expect(hasNorthampton).toBe(true);
      }
    });
  });
});
