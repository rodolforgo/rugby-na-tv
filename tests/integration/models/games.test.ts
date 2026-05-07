// import games from "@/models/games";

// describe("games.fetchByDate()", () => {
//   test("Retorna jogos da API no formato Game", async () => {
//     const today = new Date().toISOString().split("T")[0];
//     const result = await games.fetchByDate(today);

//     expect(Array.isArray(result)).toBe(true);

//     if (result.length === 0) return;

//     expect(result[0]).toMatchObject({
//       id: expect.any(Number),
//       date: expect.any(String),
//       timestamp: expect.any(Number),
//       country: { name: expect.any(String), flag: expect.any(String) },
//       league: { name: expect.any(String), logo: expect.any(String) },
//       teams: {
//         home: { name: expect.any(String), logo: expect.any(String) },
//         away: { name: expect.any(String), logo: expect.any(String) },
//       },
//       scores: {
//         home: expect.anything(),
//         away: expect.anything(),
//       },
//     });
//   });
// });

import games from "@/models/games";
import { cleanDb, runMigrations } from "@/tests/orchestrator";
import { mockGame } from "@/tests/fixtures/games";

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
