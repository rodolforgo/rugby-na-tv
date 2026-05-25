import { db } from "@/infra/database";
import { featuresSchema } from "@/infra/database/schema/features";
import { gamesSchema } from "@/infra/database/schema/games";
import { channelsSchema } from "@/infra/database/schema/channels";
import { gameChannelsSchema } from "@/infra/database/schema/gameChannels";

const knownFeatures = ["read:activation_token", "vote:games", "create:user_game", "delete:any_user_game"];

async function seedFeatures() {
  for (const name of knownFeatures) {
    await db.insert(featuresSchema).values({ name }).onConflictDoNothing();
  }
}

function daysFromToday(offset: number, hour: number, minute = 0): Date {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + offset);
  d.setUTCHours(hour, minute, 0, 0);
  return d;
}

const gamesSeed = [
  {
    apiId: 90001,
    date: daysFromToday(-1, 15, 0),
    timestamp: 0,
    countryName: "England",
    leagueName: "Premiership Rugby",
    homeTeamName: "Northampton Saints",
    awayTeamName: "Bristol Bears",
    scoresHome: 23,
    scoresAway: 19,
  },
  {
    apiId: 90002,
    date: daysFromToday(-1, 17, 30),
    timestamp: 0,
    countryName: "France",
    leagueName: "Top 14",
    homeTeamName: "Toulouse",
    awayTeamName: "La Rochelle",
    scoresHome: 31,
    scoresAway: 17,
  },
  {
    apiId: 90003,
    date: daysFromToday(-1, 20, 0),
    timestamp: 0,
    countryName: "Europe",
    leagueName: "United Rugby Championship",
    homeTeamName: "Leinster",
    awayTeamName: "Ulster",
    scoresHome: null,
    scoresAway: null,
  },
  {
    apiId: 90004,
    date: daysFromToday(0, 15, 0),
    timestamp: 0,
    countryName: "New Zealand",
    leagueName: "Super Rugby Pacific",
    homeTeamName: "Chiefs",
    awayTeamName: "Highlanders",
    scoresHome: null,
    scoresAway: null,
  },
  {
    apiId: 90005,
    date: daysFromToday(0, 17, 0),
    timestamp: 0,
    countryName: "New Zealand",
    leagueName: "Super Rugby Pacific",
    homeTeamName: "Blues",
    awayTeamName: "Crusaders",
    scoresHome: null,
    scoresAway: null,
  },
  {
    apiId: 90006,
    date: daysFromToday(0, 19, 45),
    timestamp: 0,
    countryName: "France",
    leagueName: "Top 14",
    homeTeamName: "Stade Français",
    awayTeamName: "Racing 92",
    scoresHome: null,
    scoresAway: null,
  },
  {
    apiId: 90007,
    date: daysFromToday(0, 22, 0),
    timestamp: 0,
    countryName: "Europe",
    leagueName: "Six Nations Women",
    homeTeamName: "Wales W",
    awayTeamName: "Italy W",
    scoresHome: null,
    scoresAway: null,
  },
  {
    apiId: 90008,
    date: daysFromToday(1, 15, 0),
    timestamp: 0,
    countryName: "England",
    leagueName: "Premiership Rugby",
    homeTeamName: "Saracens",
    awayTeamName: "Bath Rugby",
    scoresHome: null,
    scoresAway: null,
  },
  {
    apiId: 90009,
    date: daysFromToday(1, 18, 0),
    timestamp: 0,
    countryName: "Europe",
    leagueName: "United Rugby Championship",
    homeTeamName: "Munster",
    awayTeamName: "Glasgow Warriors",
    scoresHome: null,
    scoresAway: null,
  },
];

const channelsSeed = [
  { name: "Disney+ Brasil", url: "https://www.disneyplus.com" },
  { name: "ESPN", url: "https://www.espn.com.br" },
  { name: "YouTube", url: "https://www.youtube.com" },
  { name: "RugbyPass", url: "https://www.rugbypass.com" },
  { name: "TV5Monde", url: "https://www.tv5monde.com" },
];

async function seedChannels() {
  for (const channel of channelsSeed) {
    await db.insert(channelsSchema).values(channel).onConflictDoNothing();
  }
  console.log(`Canais inseridos: ${channelsSeed.length}`);
}

const broadcastLinks: Record<number, string[]> = {
  90001: ["Disney+ Brasil"],
  90002: ["ESPN Brasil", "Star+"],
  90004: ["ESPN Brasil"],
  90005: ["Star+"],
  90007: ["Canal W"],
  90008: ["ESPN Brasil", "Star+"],
};

async function seedGames() {
  for (const game of gamesSeed) {
    await db.insert(gamesSchema).values(game).onConflictDoNothing();
  }

  await seedChannels();

  for (const [apiId, channelNames] of Object.entries(broadcastLinks)) {
    const game = await db.query.gamesSchema.findFirst({
      where: (g, { eq }) => eq(g.apiId, Number(apiId)),
    });

    for (const name of channelNames) {
      const channel = await db.query.channelsSchema.findFirst({
        where: (c, { eq }) => eq(c.name, name),
      });

      if (game && channel) {
        await db.insert(gameChannelsSchema).values({ gameId: game.id, channelId: channel.id }).onConflictDoNothing();
      }
    }
  }

  console.log(`Jogos inseridos: ${gamesSeed.length}`);
  console.log(`Links de transmissão: ${Object.values(broadcastLinks).flat().length}`);
}

const seed = { seedFeatures, seedChannels, seedGames };

export default seed;
