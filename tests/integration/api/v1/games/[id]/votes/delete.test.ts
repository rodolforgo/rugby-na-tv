import { cleanDb, runMigrations, waitWebServer, createAuthenticatedUser, createTestGame, createTestChannel } from "@/tests/helpers";

const BASE_URL = "http://localhost:3000/api/v1/games";

beforeAll(async () => {
  await waitWebServer();
  await cleanDb();
  await runMigrations();
});

describe("DELETE /api/v1/games/[id]/votes", () => {
  test("Retorna 401 sem cookie de sessão", async () => {
    const game = await createTestGame({ homeTeamName: "Team A", awayTeamName: "Team B", date: new Date() });
    const channel = await createTestChannel();

    const response = await fetch(`${BASE_URL}/${game.id}/votes?channelId=${channel.id}`, {
      method: "DELETE",
    });

    expect(response.status).toBe(401);
  });

  test("Remove voto existente e retorna contagens zeradas", async () => {
    const game = await createTestGame({ homeTeamName: "Team A", awayTeamName: "Team B", date: new Date() });
    const channel = await createTestChannel();
    const user = await createAuthenticatedUser();
    const headers = { "Content-Type": "application/json", Cookie: `session_token=${user.sessionToken}` };

    await fetch(`${BASE_URL}/${game.id}/votes`, {
      method: "POST",
      headers,
      body: JSON.stringify({ channelId: channel.id, voteType: "upvote" }),
    });

    const response = await fetch(`${BASE_URL}/${game.id}/votes?channelId=${channel.id}`, {
      method: "DELETE",
      headers,
    });

    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.votes).toEqual([]);
    expect(body.userVotes[channel.id]).toBeUndefined();
  });

  test("Retorna 200 mesmo sem voto prévio", async () => {
    const game = await createTestGame({ homeTeamName: "Team A", awayTeamName: "Team B", date: new Date() });
    const channel = await createTestChannel();
    const user = await createAuthenticatedUser();

    const response = await fetch(`${BASE_URL}/${game.id}/votes?channelId=${channel.id}`, {
      method: "DELETE",
      headers: { Cookie: `session_token=${user.sessionToken}` },
    });

    expect(response.status).toBe(200);
  });
});
