import games from "@/models/games";
import { mockApiResponse } from "@/tests/fixtures/games";

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
        apiId: expect.any(Number),
        date: expect.any(String),
        timestamp: expect.any(Number),
        country: { name: expect.any(String), flag: expect.any(String) },
        league: { name: expect.any(String), logo: expect.any(String) },
        teams: {
          home: { name: expect.any(String), logo: expect.any(String) },
          away: { name: expect.any(String), logo: expect.any(String) },
        },
      });
    }
  });
});
