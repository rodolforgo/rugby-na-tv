import games from "@/models/games";
import { cleanDb, runMigrations } from "@/tests/orchestrator";
import { mockGame } from "@/tests/fixtures/games";
import gamesByDateFixture from "@/tests/fixtures/api-responses/games-by-date.json";

describe("games.fetchByDate()", () => {
  beforeEach(() => {
    jest.spyOn(global, "fetch").mockResolvedValue({
      json: async () => gamesByDateFixture,
    } as Response);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("Retorna jogos da API no formato Game", async () => {
    const result = await games.fetchByDate("2026-05-07");

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);

    expect(result[0]).toMatchObject({
      id: expect.any(Number),
      date: expect.any(String),
      timestamp: expect.any(Number),
      country: { name: expect.any(String), flag: expect.any(String) },
      league: { name: expect.any(String), logo: expect.any(String) },
      teams: {
        home: { name: expect.any(String), logo: expect.any(String) },
        away: { name: expect.any(String), logo: expect.any(String) },
      },
      scores: {
        home: expect.anything(),
        away: expect.anything(),
      },
    });
  });
});

describe("games.saveGames()", () => {
  beforeEach(async () => {
    await cleanDb();
    await runMigrations();
  });

  test("Insere novos jogos no banco", async () => {
    await games.saveGames([mockGame]);

    const saved = await games.findById(mockGame.id);

    expect(saved).toBeDefined();
    expect(saved?.homeTeamName).toBe("Bordeaux Begles");
    expect(saved?.awayTeamName).toBe("Clermont");
    expect(saved?.scoresHome).toBe(23);
    expect(saved?.scoresAway).toBe(19);
  });

  test("Atualiza apenas os scores quando o jogo já existe", async () => {
    await games.saveGames([mockGame]);

    const updatedGame = {
      ...mockGame,
      scores: { home: 30, away: 25 },
      teams: {
        ...mockGame.teams,
        home: { ...mockGame.teams.home, name: "Nome Diferente" },
      },
    };

    await games.saveGames([updatedGame]);

    const saved = await games.findById(mockGame.id);

    expect(saved?.scoresHome).toBe(30);
    expect(saved?.scoresAway).toBe(25);
    expect(saved?.homeTeamName).toBe("Bordeaux Begles");
  });
});
