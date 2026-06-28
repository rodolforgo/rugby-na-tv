import games from "@/models/games";
import users from "@/models/users";
import { cleanDb, createTestGame, createTestUser, runMigrations, waitWebServer } from "@/tests/helpers";
import { mockGameData } from "@/tests/fixtures/games";
import gamesByDateFixture from "@/tests/fixtures/api-responses/games-by-date.json";
import roninBroadcastsFixture from "@/tests/fixtures/api-responses/ronin-broadcasts.json";
import roninBroadcastsFuzzyFixture from "@/tests/fixtures/api-responses/ronin-broadcasts-fuzzy.json";
import roninBroadcastsTranslationFixture from "@/tests/fixtures/api-responses/ronin-broadcasts-translation.json";
import roninBroadcastsNullTeamsFixture from "@/tests/fixtures/api-responses/ronin-broadcasts-null-teams.json";
import roninBroadcastsNullTeamsMultipleFixture from "@/tests/fixtures/api-responses/ronin-broadcasts-null-teams-multiple.json";
import { db } from "@/infra/database";
import { ValidationError, UnauthorizedError } from "@/infra/errors";

beforeAll(async () => {
  await waitWebServer();
});

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
      country: { name: expect.any(String) },
      league: { name: expect.any(String) },
      teams: {
        home: { name: expect.any(String) },
        away: { name: expect.any(String) },
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
      date: new Date("2026-05-15T13:00:00Z"),
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

  test("Sobrescreve o horário do jogo com o horário da Ronin ao encontrar correspondência", async () => {
    const originalDate = new Date("2026-05-15T15:00:00Z");
    const game = await createTestGame({
      homeTeamName: "Northampton Saints",
      awayTeamName: "Bristol",
      date: originalDate,
    });

    jest.spyOn(global, "fetch").mockResolvedValueOnce({
      json: async () => roninBroadcastsFixture,
    } as Response);

    await games.compareBroadcasts("2026-05-15");

    const updated = await games.findById(game.id);
    const expectedDate = new Date("2026-05-15T21:45:00Z"); // 18:45 Brasília = 21:45 UTC

    expect(updated?.date).toEqual(expectedDate);
    expect(updated?.timestamp).toBe(Math.floor(expectedDate.getTime() / 1000));
  });

  test("Fixture com times nulos não dá match em jogo existente", async () => {
    await createTestGame({
      homeTeamName: "Canada 7s W",
      awayTeamName: "Spain 7s",
      leagueName: "Seven's World Series Women",
      date: new Date("2026-05-15T11:00:00Z"),
    });

    jest.spyOn(global, "fetch").mockResolvedValueOnce({
      json: async () => roninBroadcastsNullTeamsFixture,
    } as Response);

    const result = await games.compareBroadcasts("2026-05-15");

    expect(result.matched).toBe(0);
    expect(result.created).toBe(1);
  });

  test("Fixture com times nulos é criado como novo jogo no banco", async () => {
    jest.spyOn(global, "fetch").mockResolvedValueOnce({
      json: async () => roninBroadcastsNullTeamsFixture,
    } as Response);

    const result = await games.compareBroadcasts("2026-05-15");

    expect(result.created).toBe(1);

    const created = await db.query.gamesSchema.findFirst({
      where: (g, { eq }) => eq(g.leagueName, "World Rugby Sevens Series"),
    });

    expect(created).toBeDefined();
    expect(created?.homeTeamName).toBe("");
    expect(created?.awayTeamName).toBe("");
  });

  test("Fixture com times nulos dá match em jogo nulo existente sem criar duplicata", async () => {
    await createTestGame({
      homeTeamName: "",
      awayTeamName: "",
      leagueName: "World Rugby Sevens Series",
      date: new Date("2026-05-15T08:00:00.000Z"),
    });

    jest.spyOn(global, "fetch").mockResolvedValueOnce({
      json: async () => roninBroadcastsNullTeamsFixture,
    } as Response);

    const result = await games.compareBroadcasts("2026-05-15");

    expect(result.matched).toBe(1);
    expect(result.created).toBe(0);
  });

  test("Jogo com times criado pela Ronin não é duplicado em sync seguinte", async () => {
    jest.spyOn(global, "fetch").mockResolvedValue({
      json: async () => roninBroadcastsFixture,
    } as Response);

    const first = await games.compareBroadcasts("2026-05-15");
    expect(first.created).toBe(1);
    expect(first.matched).toBe(0);

    const second = await games.compareBroadcasts("2026-05-15");
    expect(second.created).toBe(0);
    expect(second.matched).toBe(1);

    const all = await games.findGamesByDate("2026-05-15");
    expect(all).toHaveLength(1);
  });

  test("Múltiplas fixtures sem times na mesma liga não duplicam no mesmo sync", async () => {
    jest.spyOn(global, "fetch").mockResolvedValueOnce({
      json: async () => roninBroadcastsNullTeamsMultipleFixture,
    } as Response);

    const result = await games.compareBroadcasts("2026-05-15");

    expect(result.created).toBe(1);

    const all = await games.findGamesByDate("2026-05-15");
    expect(all).toHaveLength(1);
  });

  test("Encontra correspondência quando nomes dos times estão em português e liga está reordenada", async () => {
    await createTestGame({
      homeTeamName: "Wales W",
      awayTeamName: "Italy W",
      leagueName: "Six Nations Women",
      date: new Date("2026-05-17T11:15:00Z"),
    });

    jest.spyOn(global, "fetch").mockResolvedValueOnce({
      json: async () => roninBroadcastsTranslationFixture,
    } as Response);

    const result = await games.compareBroadcasts("2026-05-17");

    expect(result.matched).toBe(1);
    expect(result.unmatched).toHaveLength(0);

    const channel = await db.query.channelsSchema.findFirst({
      where: (c, { eq }) => eq(c.name, "Canal W"),
    });

    expect(channel).toBeDefined();
  });
});

describe("games.createUserGame()", () => {
  beforeEach(async () => {
    await cleanDb();
    await runMigrations();
  });

  test("Cria jogo com os dados fornecidos e retorna o jogo criado", async () => {
    const user = await createTestUser();

    const game = await games.createUserGame(user.id, {
      homeTeamName: "Time A",
      awayTeamName: "Time B",
      leagueName: "Liga Teste",
      date: "2026-07-10",
      time: "15:00",
      channelName: "Canal Teste",
    });

    expect(game.homeTeamName).toBe("Time A");
    expect(game.awayTeamName).toBe("Time B");
    expect(game.leagueName).toBe("Liga Teste");
    expect(game.createdByUserId).toBe(user.id);
    expect(game.date).toEqual(new Date("2026-07-10T18:00:00Z"));
  });

  test("Canal criado é vinculado ao jogo com voteable false", async () => {
    const user = await createTestUser();

    const game = await games.createUserGame(user.id, {
      homeTeamName: "Time A",
      awayTeamName: "Time B",
      leagueName: "Liga Teste",
      date: "2026-07-10",
      time: "15:00",
      channelName: "Canal Exclusivo",
    });

    const gameChannel = await db.query.gameChannelsSchema.findFirst({
      where: (gc, { eq }) => eq(gc.gameId, game.id),
    });

    expect(gameChannel).toBeDefined();
    expect(gameChannel?.voteable).toBe(false);
  });

  test("Lança ValidationError se userId não existe", async () => {
    await expect(
      games.createUserGame("00000000-0000-0000-0000-000000000000", {
        homeTeamName: "Time A",
        awayTeamName: "Time B",
        leagueName: "Liga",
        date: "2026-07-10",
        time: "15:00",
        channelName: "Canal",
      }),
    ).rejects.toThrow(ValidationError);
  });
});

describe("games.deleteUserGame()", () => {
  beforeEach(async () => {
    await cleanDb();
    await runMigrations();
  });

  test("Criador consegue deletar seu próprio jogo", async () => {
    const user = await createTestUser();

    const game = await games.createUserGame(user.id, {
      homeTeamName: "Time A",
      awayTeamName: "Time B",
      leagueName: "Liga",
      date: "2026-07-10",
      time: "15:00",
      channelName: "Canal",
    });

    await games.deleteUserGame(user.id, game.id);

    const found = await games.findById(game.id);
    expect(found).toBeUndefined();
  });

  test("Admin com delete:any_user_game consegue deletar jogo de outro usuário", async () => {
    const creator = await createTestUser();
    const admin = await createTestUser();
    await users.addFeatureToUser(admin.id, "delete:any_user_game");

    const game = await games.createUserGame(creator.id, {
      homeTeamName: "Time A",
      awayTeamName: "Time B",
      leagueName: "Liga",
      date: "2026-07-10",
      time: "15:00",
      channelName: "Canal",
    });

    await games.deleteUserGame(admin.id, game.id);

    const found = await games.findById(game.id);
    expect(found).toBeUndefined();
  });

  test("Usuário sem permissão não pode deletar jogo de outro", async () => {
    const creator = await createTestUser();
    const other = await createTestUser();

    const game = await games.createUserGame(creator.id, {
      homeTeamName: "Time A",
      awayTeamName: "Time B",
      leagueName: "Liga",
      date: "2026-07-10",
      time: "15:00",
      channelName: "Canal",
    });

    await expect(games.deleteUserGame(other.id, game.id)).rejects.toThrow(UnauthorizedError);
  });

  test("Lança ValidationError se jogo não existe", async () => {
    const user = await createTestUser();
    await expect(games.deleteUserGame(user.id, "00000000-0000-0000-0000-000000000000")).rejects.toThrow(ValidationError);
  });

  test("Lança UnauthorizedError ao tentar deletar jogo sincronizado pela plataforma", async () => {
    const apiGame = await createTestGame({
      homeTeamName: "Time A",
      awayTeamName: "Time B",
      date: new Date("2026-06-01T15:00:00Z"),
    });
    const user = await createTestUser();

    await expect(games.deleteUserGame(user.id, apiGame.id)).rejects.toThrow(UnauthorizedError);
  });
});

describe("games.listByUser()", () => {
  beforeEach(async () => {
    await cleanDb();
    await runMigrations();
  });

  test("Retorna apenas jogos criados pelo usuário", async () => {
    const userA = await createTestUser();
    const userB = await createTestUser();

    await games.createUserGame(userA.id, {
      homeTeamName: "Time A",
      awayTeamName: "Time B",
      leagueName: "Liga",
      date: "2026-07-10",
      time: "15:00",
      channelName: "Canal A",
    });

    await games.createUserGame(userB.id, {
      homeTeamName: "Time C",
      awayTeamName: "Time D",
      leagueName: "Liga",
      date: "2026-07-11",
      time: "16:00",
      channelName: "Canal B",
    });

    const result = await games.listByUser(userA.id);

    expect(result).toHaveLength(1);
    expect(result[0].homeTeamName).toBe("Time A");
    expect(result[0].createdByUserId).toBe(userA.id);
  });

  test("Retorna array vazio quando usuário não tem jogos", async () => {
    const user = await createTestUser();
    const result = await games.listByUser(user.id);
    expect(result).toHaveLength(0);
  });

  test("Inclui canal com voteable false no jogo listado", async () => {
    const user = await createTestUser();

    await games.createUserGame(user.id, {
      homeTeamName: "Time A",
      awayTeamName: "Time B",
      leagueName: "Liga",
      date: "2026-07-10",
      time: "15:00",
      channelName: "Meu Canal",
    });

    const result = await games.listByUser(user.id);

    expect(result[0].channels).toHaveLength(1);
    expect(result[0].channels[0].name).toBe("Meu Canal");
    expect(result[0].channels[0].voteable).toBe(false);
  });
});
