import type { ApiGame, Game } from "@/domain/games/games.types";
import { db } from "@/infra/database";
import { gamesSchema } from "@/infra/database/schema/games";

const RUGBY_API_BASE_URL = "https://v1.rugby.api-sports.io";

async function fetchByDate(date: string): Promise<Game[]> {
  const response = await fetch(`${RUGBY_API_BASE_URL}/games?date=${date}`, {
    headers: {
      "x-apisports-key": process.env.RUGBY_API_KEY as string,
    },
  });

  const data: { response: ApiGame[] } = await response.json();

  return data.response.map((game) => ({
    id: game.id,
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

async function upsertGame(game: Game): Promise<void> {
  await db
    .insert(gamesSchema)
    .values({
      id: game.id,
      date: new Date(game.date),
      timestamp: game.timestamp,
      countryName: game.country.name,
      countryFlag: game.country.flag,
      leagueName: game.league.name,
      leagueLogo: game.league.logo,
      homeTeamName: game.teams.home.name,
      homeTeamLogo: game.teams.home.logo,
      awayTeamName: game.teams.away.name,
      awayTeamLogo: game.teams.away.logo,
      scoresHome: game.scores.home,
      scoresAway: game.scores.away,
    })
    .onConflictDoUpdate({
      target: gamesSchema.id,
      set: {
        scoresHome: game.scores.home,
        scoresAway: game.scores.away,
        updated_at: new Date(),
      },
    });
}

async function saveGames(gamesList: Game[]): Promise<void> {
  for (const game of gamesList) {
    await upsertGame(game);
  }
}

async function findById(id: number) {
  return await db.query.gamesSchema.findFirst({
    where: (games, { eq }) => eq(games.id, id),
  });
}

const games = {
  fetchByDate,
  saveGames,
  findById,
};

export default games;
