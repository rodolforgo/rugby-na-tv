import type { ApiGame, Game } from "@/domain/games/games.types";

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

const games = {
  fetchByDate,
};

export default games;
