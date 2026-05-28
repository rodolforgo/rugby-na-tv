import type {
  ApiGame,
  Broadcast,
  BroadcastCompareResult,
  GameData,
  GameWithChannels,
  GameWithVotes,
  RoninApiResponse,
} from "@/domain/games/games.types";
import type { CreateUserGameData } from "@/domain/games/games.schema";
import votes from "@/models/votes";
import users from "@/models/users";
import { translateTeamName, tokenMatch } from "@/domain/games/translations";
import { db } from "@/infra/database";
import { gamesSchema } from "@/infra/database/schema/games";
import { channelsSchema } from "@/infra/database/schema/channels";
import { gameChannelsSchema } from "@/infra/database/schema/gameChannels";
import { syncLogsSchema } from "@/infra/database/schema/syncLogs";
import { broadcastLogsSchema } from "@/infra/database/schema/broadcastLogs";
import { and, eq, gte, lt, desc } from "drizzle-orm";
import { ValidationError, UnauthorizedError } from "@/infra/errors";

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
    country: { name: game.country.name },
    league: { name: game.league.name },
    teams: {
      home: { name: game.teams.home.name },
      away: { name: game.teams.away.name },
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
      leagueName: data.league.name,
      homeTeamName: data.teams.home.name,
      awayTeamName: data.teams.away.name,
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

async function syncByDate(date: string) {
  const gamesList = await fetchByDate(date);
  await saveGames(gamesList);

  const [log] = await db.insert(syncLogsSchema).values({ syncedDate: date, gamesTotal: gamesList.length, status: "success" }).returning();

  return { date, gamesTotal: gamesList.length, syncedAt: log.created_at };
}

async function listForDisplay(): Promise<GameWithChannels[]> {
  const today = new Date();
  const start = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - 1));
  const end = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + 2));

  const rows = await db.query.gamesSchema.findMany({
    where: (g, { and, gte, lt }) => and(gte(g.date, start), lt(g.date, end)),
    orderBy: (g, { asc }) => [asc(g.date)],
    with: {
      gameChannels: {
        with: { channel: true },
      },
    },
  });

  return rows.map((game) => ({
    id: game.id,
    date: game.date,
    leagueName: game.leagueName,
    countryName: game.countryName,
    homeTeamName: game.homeTeamName,
    awayTeamName: game.awayTeamName,
    scoresHome: game.scoresHome,
    scoresAway: game.scoresAway,
    createdByUserId: game.createdByUserId ?? null,
    channels: game.gameChannels.map((gc) => ({
      id: gc.channel.id,
      name: gc.channel.name,
      url: gc.channel.url,
      voteable: gc.voteable,
    })),
  }));
}

async function findById(id: string) {
  return await db.query.gamesSchema.findFirst({
    where: (games, { eq }) => eq(games.id, id),
  });
}

async function getGameById(id: string) {
  const game = await findById(id);

  if (!game) {
    throw new ValidationError("Jogo não encontrado.", { action: "Verifique o id informado." });
  }

  return game;
}

async function findByApiId(apiId: number) {
  return await db.query.gamesSchema.findFirst({
    where: (games, { eq }) => eq(games.apiId, apiId),
  });
}

async function findGamesByDate(date: string) {
  const start = new Date(`${date}T03:00:00Z`);
  const end = new Date(`${date}T03:00:00Z`);
  end.setUTCDate(end.getUTCDate() + 1);

  return await db
    .select()
    .from(gamesSchema)
    .where(and(gte(gamesSchema.date, start), lt(gamesSchema.date, end)));
}

async function getLastSync() {
  return await db.query.syncLogsSchema.findFirst({
    orderBy: [desc(syncLogsSchema.created_at)],
  });
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
          channels: (f.channels ?? []).map((c) => ({ name: c.name })),
        })),
      ),
    ),
  );
}

async function findOrCreateChannel(name: string): Promise<string> {
  const existing = await db.query.channelsSchema.findFirst({
    where: (c, { eq }) => eq(c.name, name),
  });

  if (existing) return existing.id;

  const [created] = await db.insert(channelsSchema).values({ name }).returning();
  return created.id;
}

function normalize(s: string): string {
  return s.toLowerCase().trim();
}

function scoreMatch(broadcast: Broadcast, game: { homeTeamName: string; awayTeamName: string; leagueName: string; date: Date }): number {
  let score = 0;
  const partial = (a: string, b: string) => normalize(a).includes(normalize(b)) || normalize(b).includes(normalize(a));
  const teamMatch = (broadcastName: string, dbName: string) =>
    partial(broadcastName, dbName) || translateTeamName(broadcastName) === translateTeamName(dbName);

  if (teamMatch(broadcast.homeTeam, game.homeTeamName)) score++;
  if (teamMatch(broadcast.visitingTeam, game.awayTeamName)) score++;
  if (partial(broadcast.league, game.leagueName) || tokenMatch(broadcast.league, game.leagueName)) score++;

  const broadcastTime = broadcast.date.slice(11, 16);
  const dbHour = game.date.getUTCHours().toString().padStart(2, "0");
  const dbMinute = game.date.getUTCMinutes().toString().padStart(2, "0");
  if (broadcastTime === `${dbHour}:${dbMinute}`) score++;

  return score;
}

async function compareBroadcasts(date: string): Promise<BroadcastCompareResult> {
  const [broadcasts, dbGames] = await Promise.all([fetchBroadcastsByDate(date), findGamesByDate(date)]);

  const unmatched: BroadcastCompareResult["unmatched"] = [];
  let matched = 0;

  for (const broadcast of broadcasts) {
    let game = dbGames.find(
      (g) => normalize(broadcast.homeTeam) === normalize(g.homeTeamName) && normalize(broadcast.visitingTeam) === normalize(g.awayTeamName),
    );

    if (!game) {
      let bestScore = 0;
      let bestGame: (typeof dbGames)[number] | undefined;
      for (const candidate of dbGames) {
        const score = scoreMatch(broadcast, candidate);
        if (score > bestScore) {
          bestScore = score;
          bestGame = candidate;
        }
      }
      if (bestScore >= 3) game = bestGame;
    }

    if (game) {
      matched++;

      const roninDate = new Date(broadcast.date);
      if (!Number.isNaN(roninDate.getTime())) {
        await db
          .update(gamesSchema)
          .set({ date: roninDate, timestamp: Math.floor(roninDate.getTime() / 1000) })
          .where(eq(gamesSchema.id, game.id));
      }

      for (const channel of broadcast.channels) {
        const channelId = await findOrCreateChannel(channel.name);
        await db.insert(gameChannelsSchema).values({ gameId: game.id, channelId }).onConflictDoNothing();
      }
    } else {
      unmatched.push({ homeTeam: broadcast.homeTeam, visitingTeam: broadcast.visitingTeam, league: broadcast.league });
    }
  }

  const result = { date, roninTotal: broadcasts.length, dbGamesTotal: dbGames.length, matched, unmatched };

  await db.insert(broadcastLogsSchema).values({
    syncedDate: date,
    roninTotal: result.roninTotal,
    dbGamesTotal: result.dbGamesTotal,
    matched: result.matched,
    unmatched: result.unmatched,
  });

  return result;
}

async function createUserGame(userId: string, data: CreateUserGameData) {
  await users.getUserById(userId);

  const date = new Date(`${data.date}T${data.time}:00-03:00`);

  if (Number.isNaN(date.getTime())) {
    throw new ValidationError("Data ou hora inválida.", { action: "Use o formato YYYY-MM-DD para data e HH:MM para hora." });
  }

  const brDateStr = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
  const todayBRT = new Date(`${brDateStr}T00:00:00-03:00`);
  if (date < todayBRT) {
    throw new ValidationError("Não é possível adicionar jogos com data anterior à atual.", {
      action: "Informe uma data de hoje ou futura.",
    });
  }

  const [game] = await db
    .insert(gamesSchema)
    .values({
      date,
      timestamp: Math.floor(date.getTime() / 1000),
      homeTeamName: data.homeTeamName,
      awayTeamName: data.awayTeamName,
      leagueName: data.leagueName,
      countryName: "",
      createdByUserId: userId,
    })
    .returning();

  const channelId = await findOrCreateChannel(data.channelName);
  await db.insert(gameChannelsSchema).values({ gameId: game.id, channelId, voteable: false }).onConflictDoNothing();

  return game;
}

async function deleteUserGame(userId: string, gameId: string) {
  const game = await getGameById(gameId);

  if (!game.createdByUserId) {
    throw new UnauthorizedError("Não é possível deletar jogos sincronizados pela plataforma.");
  }

  const isCreator = game.createdByUserId === userId;
  const isAdmin = await users.hasFeature(userId, "delete:any_user_game");

  if (!isCreator && !isAdmin) {
    throw new UnauthorizedError("Você não tem permissão para deletar este jogo.");
  }

  await db.delete(gamesSchema).where(eq(gamesSchema.id, gameId));
}

async function listByUser(userId: string): Promise<GameWithChannels[]> {
  const rows = await db.query.gamesSchema.findMany({
    where: (g, { eq }) => eq(g.createdByUserId, userId),
    orderBy: (g, { desc }) => [desc(g.date)],
    with: { gameChannels: { with: { channel: true } } },
  });

  return rows.map((game) => ({
    id: game.id,
    date: game.date,
    leagueName: game.leagueName,
    countryName: game.countryName,
    homeTeamName: game.homeTeamName,
    awayTeamName: game.awayTeamName,
    scoresHome: game.scoresHome,
    scoresAway: game.scoresAway,
    createdByUserId: game.createdByUserId ?? null,
    channels: game.gameChannels.map((gc) => ({
      id: gc.channel.id,
      name: gc.channel.name,
      url: gc.channel.url,
      voteable: gc.voteable,
    })),
  }));
}

async function getLastBroadcastLog() {
  return await db.query.broadcastLogsSchema.findFirst({
    orderBy: [desc(broadcastLogsSchema.created_at)],
  });
}

async function listWithVotesForDisplay(userId?: string): Promise<GameWithVotes[]> {
  const [gamesList, allChannels] = await Promise.all([listForDisplay(), db.query.channelsSchema.findMany()]);

  const gameIds = gamesList.map((g) => g.id);
  const [voteCounts, userVoteMap] = await Promise.all([
    votes.getForGames(gameIds),
    userId ? votes.getUserVotesForGames(userId, gameIds) : Promise.resolve({} as Record<string, Record<string, "upvote" | "downvote">>),
  ]);

  return gamesList.map((game) => {
    const nonVoteableIds = new Set(game.channels.filter((c) => !c.voteable).map((c) => c.id));
    return {
      ...game,
      allChannels: allChannels
        .filter((channel) => !nonVoteableIds.has(channel.id))
        .map((channel) => ({
          ...channel,
          upvoteCount: voteCounts[game.id]?.[channel.id]?.upvoteCount ?? 0,
          downvoteCount: voteCounts[game.id]?.[channel.id]?.downvoteCount ?? 0,
          userVote: (userVoteMap[game.id]?.[channel.id] ?? null) as "upvote" | "downvote" | null,
          isCommunity: !game.channels.some((c) => c.id === channel.id),
        })),
    };
  });
}

const games = {
  listForDisplay,
  listWithVotesForDisplay,
  fetchByDate,
  saveGames,
  createGame,
  findById,
  getGameById,
  findByApiId,
  findGamesByDate,
  syncByDate,
  getLastSync,
  fetchBroadcastsByDate,
  compareBroadcasts,
  getLastBroadcastLog,
  createUserGame,
  deleteUserGame,
  listByUser,
};

export default games;
