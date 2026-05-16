import { cleanDb, createTestGame, runMigrations, waitWebServer } from "@/tests/helpers";
import { db } from "@/infra/database";
import { channelsSchema } from "@/infra/database/schema/channels";
import { gameChannelsSchema } from "@/infra/database/schema/gameChannels";

const GAMES_URL = "http://localhost:3000/api/v1/games";

beforeAll(async () => {
  await waitWebServer();
  await cleanDb();
  await runMigrations();
});

describe("GET /api/v1/games", () => {
  test("Retorna array vazio quando não há jogos no período", async () => {
    const response = await fetch(GAMES_URL);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(body)).toBe(true);
    expect(body).toHaveLength(0);
  });

  test("Retorna jogo de hoje com campos esperados", async () => {
    await createTestGame({
      homeTeamName: "Bordeaux",
      awayTeamName: "Clermont",
      date: new Date(),
    });

    const response = await fetch(GAMES_URL);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.length).toBeGreaterThan(0);
    expect(body[0]).toMatchObject({
      id: expect.any(String),
      date: expect.any(String),
      homeTeamName: "Bordeaux",
      awayTeamName: "Clermont",
      leagueName: expect.any(String),
      channels: expect.any(Array),
    });
  });

  test("Retorna canais vinculados ao jogo", async () => {
    const game = await createTestGame({
      homeTeamName: "Bath",
      awayTeamName: "Leicester",
      date: new Date(),
    });

    const [channel] = await db.insert(channelsSchema).values({ name: "ESPN" }).returning();
    await db.insert(gameChannelsSchema).values({ gameId: game.id, channelId: channel.id });

    const response = await fetch(GAMES_URL);
    const body = await response.json();

    const gameWithChannel = body.find((g: { awayTeamName: string }) => g.awayTeamName === "Leicester");

    expect(gameWithChannel.channels).toHaveLength(1);
    expect(gameWithChannel.channels[0].name).toBe("ESPN");
  });

  test("Inclui jogo de ontem e de amanhã no retorno", async () => {
    const yesterday = new Date();
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);

    const tomorrow = new Date();
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

    await createTestGame({ homeTeamName: "Ontem A", awayTeamName: "Ontem B", date: yesterday });
    await createTestGame({ homeTeamName: "Amanhã A", awayTeamName: "Amanhã B", date: tomorrow });

    const response = await fetch(GAMES_URL);
    const body = await response.json();

    const names = body.map((g: { homeTeamName: string }) => g.homeTeamName);
    expect(names).toContain("Ontem A");
    expect(names).toContain("Amanhã A");
  });
});
