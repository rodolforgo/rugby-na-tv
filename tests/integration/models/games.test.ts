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
