import type { ApiGame, Broadcast, BroadcastCompareResult, GameData, RoninApiResponse } from "@/domain/games/games.types";
import { db } from "@/infra/database";
import { gamesSchema } from "@/infra/database/schema/games";
import { channelsSchema } from "@/infra/database/schema/channels";
import { gameChannelsSchema } from "@/infra/database/schema/gameChannels";
import { syncLogsSchema } from "@/infra/database/schema/syncLogs";
import { and, gte, lt, desc } from "drizzle-orm";

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

async function syncByDate(date: string) {
  const gamesList = await fetchByDate(date);
  await saveGames(gamesList);

  const [log] = await db.insert(syncLogsSchema).values({ syncedDate: date, gamesTotal: gamesList.length, status: "success" }).returning();

  return { date, gamesTotal: gamesList.length, syncedAt: log.created_at };
}

async function getLastSync() {
  return await db.query.syncLogsSchema.findFirst({
    orderBy: [desc(syncLogsSchema.created_at)],
  });
}

async function findGamesByDate(date: string) {
  const start = new Date(`${date}T00:00:00Z`);
  const end = new Date(`${date}T00:00:00Z`);
  end.setUTCDate(end.getUTCDate() + 1);

  return await db
    .select()
    .from(gamesSchema)
    .where(and(gte(gamesSchema.date, start), lt(gamesSchema.date, end)));
}

async function findOrCreateChannel(name: string): Promise<string> {
  const existing = await db.query.channelsSchema.findFirst({
    where: (c, { eq }) => eq(c.name, name),
  });

  if (existing) return existing.id;

  const [created] = await db.insert(channelsSchema).values({ name }).returning();
  return created.id;
}

async function compareBroadcasts(date: string): Promise<BroadcastCompareResult> {
  const [broadcasts, dbGames] = await Promise.all([fetchBroadcastsByDate(date), findGamesByDate(date)]);

  const normalize = (s: string) => s.toLowerCase().trim();
  const unmatched: BroadcastCompareResult["unmatched"] = [];
  let matched = 0;

  for (const broadcast of broadcasts) {
    const game = dbGames.find(
      (g) => normalize(broadcast.homeTeam) === normalize(g.homeTeamName) && normalize(broadcast.visitingTeam) === normalize(g.awayTeamName),
    );

    if (game) {
      matched++;
      for (const channel of broadcast.channels) {
        const channelId = await findOrCreateChannel(channel.name);
        await db.insert(gameChannelsSchema).values({ gameId: game.id, channelId }).onConflictDoNothing();
      }
    } else {
      unmatched.push({ homeTeam: broadcast.homeTeam, visitingTeam: broadcast.visitingTeam, league: broadcast.league });
    }
  }

  return { date, roninTotal: broadcasts.length, dbGamesTotal: dbGames.length, matched, unmatched };
}

async function fetchBroadcastsByDate(date: string): Promise<Broadcast[]> {
  const url = `https://api2.roninmedia.io/2/fixtures/grouped?token=${process.env.RONIN_API_TOKEN}&day=${date}&dayBreakHour=0&tz=America/Sao_Paulo&sportId=8`;
  const response = await fetch(url);
  const data: RoninApiResponse = await response.json();

  return (data?.[0]?.sports?.[0] ?? []).flatMap((day) =>
    day.sports.flatMap((sport) =>
      sport.leagues.flatMap((league) =>
        [...(league.oldFixtures ?? []), ...(league.fixtures ?? [])].map((f) => ({
          id: f.fixture_id,
          date: f.date,
          homeTeam: f.home_team,
          visitingTeam: f.visiting_team,
          league: f.league,
          channels: f.channels.map((c) => ({ name: c.name })),
        })),
      ),
    ),
  );
}

const games = {
  fetchByDate,
  saveGames,
  createGame,
  findById,
  findByApiId,
  findGamesByDate,
  syncByDate,
  getLastSync,
  fetchBroadcastsByDate,
  compareBroadcasts,
};

export default games;
