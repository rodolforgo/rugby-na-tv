import games from "@/models/games";

const mockApiResponse = {
  results: 1,
  response: [
    {
      id: 8279,
      date: "2018-09-22T12:45:00+00:00",
      time: "12:45",
      timestamp: 1537620300,
      timezone: "UTC",
      week: "5",
      status: { long: "Finished", short: "FT" },
      country: { id: 7, name: "France", code: "FR", flag: "https://media.api-sports.io/flags/fr.svg" },
      league: { id: 16, name: "Top 14", type: "League", logo: "https://media.api-sports.io/rugby/leagues/16.png", season: 2018 },
      teams: {
        home: { id: 96, name: "Bordeaux Begles", logo: "https://media.api-sports.io/rugby/teams/96.png" },
        away: { id: 99, name: "Clermont", logo: "https://media.api-sports.io/rugby/teams/99.png" },
      },
      scores: { home: 23, away: 19 },
      periods: {
        first: { home: 13, away: 9 },
        second: { home: 10, away: 10 },
        overtime: { home: null, away: null },
        second_overtime: { home: null, away: null },
      },
    },
  ],
};

describe("games.fetchByDate()", () => {
  beforeEach(() => {
    jest.spyOn(global, "fetch").mockResolvedValue({
      json: async () => mockApiResponse,
    } as Response);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("Retorna uma lista de jogos no formato Game", async () => {
    const result = await games.fetchByDate("2026-05-07");

    expect(Array.isArray(result)).toBe(true);

    if (result.length > 0) {
      expect(result[0]).toMatchObject({
        id: expect.any(Number),
        date: expect.any(String),
        timestamp: expect.any(Number),
        country: { name: expect.any(String), flag: expect.any(String) },
        league: { name: expect.any(String), logo: expect.any(String) },
        teams: {
          home: { name: expect.any(String), logo: expect.any(String) },
          away: { logo: expect.any(String) },
        },
      });
    }
  });
});
