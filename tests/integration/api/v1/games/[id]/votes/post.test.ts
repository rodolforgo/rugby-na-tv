import { cleanDb, runMigrations, waitWebServer, createAuthenticatedUser, createTestGame, createTestChannel } from "@/tests/helpers";

const BASE_URL = "http://localhost:3000/api/v1/games";

beforeAll(async () => {
  await waitWebServer();
  await cleanDb();
  await runMigrations();
});

describe("POST /api/v1/games/[id]/votes", () => {
  test("Retorna 401 sem cookie de sessão", async () => {
    const game = await createTestGame({ homeTeamName: "Team A", awayTeamName: "Team B", date: new Date() });
    const channel = await createTestChannel();

    const response = await fetch(`${BASE_URL}/${game.id}/votes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channelId: channel.id, voteType: "upvote" }),
    });

    expect(response.status).toBe(401);
  });

  test("Retorna 400 com voteType inválido", async () => {
    const game = await createTestGame({ homeTeamName: "Team A", awayTeamName: "Team B", date: new Date() });
    const channel = await createTestChannel();
    const user = await createAuthenticatedUser();

    const response = await fetch(`${BASE_URL}/${game.id}/votes`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: `session_token=${user.sessionToken}` },
      body: JSON.stringify({ channelId: channel.id, voteType: "invalid" }),
    });

    expect(response.status).toBe(400);
  });

  test("Retorna 400 com canal inexistente", async () => {
    const game = await createTestGame({ homeTeamName: "Team A", awayTeamName: "Team B", date: new Date() });
    const user = await createAuthenticatedUser();

    const response = await fetch(`${BASE_URL}/${game.id}/votes`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: `session_token=${user.sessionToken}` },
      body: JSON.stringify({ channelId: crypto.randomUUID(), voteType: "upvote" }),
    });

    expect(response.status).toBe(400);
  });

  test("Registra upvote e retorna contagens corretas", async () => {
    const game = await createTestGame({ homeTeamName: "Team A", awayTeamName: "Team B", date: new Date() });
    const channel = await createTestChannel();
    const user = await createAuthenticatedUser();

    const response = await fetch(`${BASE_URL}/${game.id}/votes`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: `session_token=${user.sessionToken}` },
      body: JSON.stringify({ channelId: channel.id, voteType: "upvote" }),
    });

    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.votes).toEqual(
      expect.arrayContaining([expect.objectContaining({ channelId: channel.id, upvoteCount: 1, downvoteCount: 0 })]),
    );
    expect(body.userVotes[channel.id]).toBe("upvote");
  });

  test("Registra downvote e retorna contagens corretas", async () => {
    const game = await createTestGame({ homeTeamName: "Team A", awayTeamName: "Team B", date: new Date() });
    const channel = await createTestChannel();
    const user = await createAuthenticatedUser();

    const response = await fetch(`${BASE_URL}/${game.id}/votes`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: `session_token=${user.sessionToken}` },
      body: JSON.stringify({ channelId: channel.id, voteType: "downvote" }),
    });

    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.votes).toEqual(
      expect.arrayContaining([expect.objectContaining({ channelId: channel.id, upvoteCount: 0, downvoteCount: 1 })]),
    );
    expect(body.userVotes[channel.id]).toBe("downvote");
  });

  test("Toggle: segundo POST com mesmo tipo remove o voto", async () => {
    const game = await createTestGame({ homeTeamName: "Team A", awayTeamName: "Team B", date: new Date() });
    const channel = await createTestChannel();
    const user = await createAuthenticatedUser();

    const opts = {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: `session_token=${user.sessionToken}` },
      body: JSON.stringify({ channelId: channel.id, voteType: "upvote" }),
    };

    await fetch(`${BASE_URL}/${game.id}/votes`, opts);
    const response = await fetch(`${BASE_URL}/${game.id}/votes`, opts);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.votes).toEqual([]);
    expect(body.userVotes[channel.id]).toBeUndefined();
  });

  test("Troca de tipo: upvote seguido de downvote registra downvote", async () => {
    const game = await createTestGame({ homeTeamName: "Team A", awayTeamName: "Team B", date: new Date() });
    const channel = await createTestChannel();
    const user = await createAuthenticatedUser();

    const headers = { "Content-Type": "application/json", Cookie: `session_token=${user.sessionToken}` };

    await fetch(`${BASE_URL}/${game.id}/votes`, {
      method: "POST",
      headers,
      body: JSON.stringify({ channelId: channel.id, voteType: "upvote" }),
    });

    const response = await fetch(`${BASE_URL}/${game.id}/votes`, {
      method: "POST",
      headers,
      body: JSON.stringify({ channelId: channel.id, voteType: "downvote" }),
    });

    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.votes).toEqual(
      expect.arrayContaining([expect.objectContaining({ channelId: channel.id, upvoteCount: 0, downvoteCount: 1 })]),
    );
    expect(body.userVotes[channel.id]).toBe("downvote");
  });
});
