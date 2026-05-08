import type { ApiGame, GameData } from "@/domain/games/games.types";
import { db } from "@/infra/database";
import { gamesSchema } from "@/infra/database/schema/games";

const RUGBY_API_BASE_URL = "https://v1.rugby.api-sports.io";

async function fetchByDate(date: string): Promise<GameData[]> {
  const response = await fetch(`${RUGBY_API_BASE_URL}/games?date=${date}`, {
    headers: {
      "x-apisports-key": process.env.RUGBY_API_KEY as string,
    },
  });

  const data: { response: ApiGame[] } = await response.json();

  return data.response.map((game) => ({
    apiId: game.id,
    date: game.date,
    timestamp: game.timestamp,
    country: {
      name: game.country.name,
      flag: game.country.flag,
    },
    league: {
      name: game.league.name,
      logo: game.league.logo,
    },
    teams: {
      home: {
        name: game.teams.home.name,
        logo: game.teams.home.logo,
      },
      away: {
        name: game.teams.away.name,
        logo: game.teams.away.logo,
      },
    },
    scores: {
      home: game.scores.home,
      away: game.scores.away,
    },
  }));
}

async function createGame(data: GameData) {
  const [created] = await db
    .insert(gamesSchema)
    .values({
      apiId: data.apiId,
      date: new Date(data.date),
      timestamp: data.timestamp,
      countryName: data.country.name,
      countryFlag: data.country.flag,
      leagueName: data.league.name,
      leagueLogo: data.league.logo,
      homeTeamName: data.teams.home.name,
      homeTeamLogo: data.teams.home.logo,
      awayTeamName: data.teams.away.name,
      awayTeamLogo: data.teams.away.logo,
      scoresHome: data.scores.home,
      scoresAway: data.scores.away,
    })
    .onConflictDoUpdate({
      target: gamesSchema.apiId,
      set: {
        scoresHome: data.scores.home,
        scoresAway: data.scores.away,
        updated_at: new Date(),
      },
    })
    .returning();
  return created;
}

async function saveGames(gamesList: GameData[]): Promise<void> {
  for (const game of gamesList) {
    await createGame(game);
  }
}

async function findById(id: string) {
  return await db.query.gamesSchema.findFirst({
    where: (games, { eq }) => eq(games.id, id),
  });
}

async function findByApiId(apiId: number) {
  return await db.query.gamesSchema.findFirst({
    where: (games, { eq }) => eq(games.apiId, apiId),
  });
}

const games = {
  fetchByDate,
  saveGames,
  createGame,
  findById,
  findByApiId,
};

export default games;
