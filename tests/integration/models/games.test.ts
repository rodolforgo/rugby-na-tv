import games from "@/models/games";
import { cleanDb, createTestGame, runMigrations } from "@/tests/orchestrator";
import { mockGameData } from "@/tests/fixtures/games";
import gamesByDateFixture from "@/tests/fixtures/api-responses/games-by-date.json";
import roninBroadcastsFixture from "@/tests/fixtures/api-responses/ronin-broadcasts.json";
import roninBroadcastsFuzzyFixture from "@/tests/fixtures/api-responses/ronin-broadcasts-fuzzy.json";
import { db } from "@/infra/database";

describe("games.fetchByDate()", () => {
  beforeEach(() => {
    jest.spyOn(global, "fetch").mockResolvedValue({
      json: async () => gamesByDateFixture,
    } as Response);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("Retorna jogos da API no formato GameData", async () => {
    const result = await games.fetchByDate("2026-05-07");

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);

    expect(result[0]).toMatchObject({
      apiId: expect.any(Number),
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
    await games.saveGames([mockGameData]);

    const saved = await games.findByApiId(mockGameData.apiId as number);

    expect(saved).toBeDefined();
    expect(saved?.homeTeamName).toBe("Bordeaux Begles");
    expect(saved?.awayTeamName).toBe("Clermont");
    expect(saved?.scoresHome).toBe(23);
    expect(saved?.scoresAway).toBe(19);
  });

  test("Atualiza apenas os scores quando o jogo já existe", async () => {
    await games.saveGames([mockGameData]);

    const updatedGame = {
      ...mockGameData,
      scores: { home: 30, away: 25 },
      teams: {
        ...mockGameData.teams,
        home: { ...mockGameData.teams.home, name: "Nome Diferente" },
      },
    };

    await games.saveGames([updatedGame]);

    const saved = await games.findByApiId(mockGameData.apiId as number);

    expect(saved?.scoresHome).toBe(30);
    expect(saved?.scoresAway).toBe(25);
    expect(saved?.homeTeamName).toBe("Bordeaux Begles");
  });
});

describe("games.createGame()", () => {
  beforeEach(async () => {
    await cleanDb();
    await runMigrations();
  });

  test("Insere um jogo sem id da API e retorna o jogo criado", async () => {
    const created = await games.createGame({ ...mockGameData, apiId: null });

    expect(created.id).toBeDefined();
    expect(created.apiId).toBeNull();
    expect(created.homeTeamName).toBe("Bordeaux Begles");
    expect(created.scoresHome).toBe(23);
  });

  test("Permite inserir múltiplos jogos sem id da API sem conflito", async () => {
    const first = await games.createGame({ ...mockGameData, apiId: null });
    const second = await games.createGame({ ...mockGameData, apiId: null });

    expect(first.id).not.toBe(second.id);
  });

  test("Insere um jogo com apiId e retorna o jogo criado", async () => {
    const created = await games.createGame(mockGameData);

    expect(created.id).toBeDefined();
    expect(created.apiId).toBe(mockGameData.apiId);
    expect(created.homeTeamName).toBe("Bordeaux Begles");
  });
});

describe("games.findById()", () => {
  beforeEach(async () => {
    await cleanDb();
    await runMigrations();
  });

  test("Retorna o jogo pelo id interno", async () => {
    const created = await games.createGame({ ...mockGameData, apiId: null });
    const found = await games.findById(created.id);

    expect(found).toBeDefined();
    expect(found?.homeTeamName).toBe("Bordeaux Begles");
  });
});

describe("games.compareBroadcasts()", () => {
  beforeEach(async () => {
    await cleanDb();
    await runMigrations();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("Salva canal e vínculo com o jogo no banco ao encontrar correspondência", async () => {
    await createTestGame({
      homeTeamName: "Northampton Saints",
      awayTeamName: "Bristol",
      date: new Date("2026-05-15T18:45:00Z"),
    });

    jest.spyOn(global, "fetch").mockResolvedValueOnce({
      json: async () => roninBroadcastsFixture,
    } as Response);

    const result = await games.compareBroadcasts("2026-05-15");

    expect(result.matched).toBe(1);
    expect(result.roninTotal).toBe(1);

    const channel = await db.query.channelsSchema.findFirst({
      where: (c, { eq }) => eq(c.name, "Disney+ Brasil"),
    });

    expect(channel).toBeDefined();
    expect(channel?.name).toBe("Disney+ Brasil");

    const gameChannel = await db.query.gameChannelsSchema.findFirst({
      where: (gc, { eq }) => eq(gc.channelId, channel?.id ?? ""),
    });

    expect(gameChannel).toBeDefined();
  });

  test("Encontra correspondência via fuzzy match quando nomes são parcialmente iguais", async () => {
    await createTestGame({
      homeTeamName: "Chiefs",
      awayTeamName: "Highlanders",
      leagueName: "Super Rugby Pacific",
      date: new Date("2026-05-15T00:00:00Z"),
    });

    jest.spyOn(global, "fetch").mockResolvedValueOnce({
      json: async () => roninBroadcastsFuzzyFixture,
    } as Response);

    const result = await games.compareBroadcasts("2026-05-15");

    expect(result.matched).toBe(1);
    expect(result.unmatched).toHaveLength(0);

    const channel = await db.query.channelsSchema.findFirst({
      where: (c, { eq }) => eq(c.name, "ESPN Brasil"),
    });

    expect(channel).toBeDefined();

    const gameChannel = await db.query.gameChannelsSchema.findFirst({
      where: (gc, { eq }) => eq(gc.channelId, channel?.id ?? ""),
    });

    expect(gameChannel).toBeDefined();
  });
});
