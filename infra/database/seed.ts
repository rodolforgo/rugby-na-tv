import { db } from "@/infra/database";
import { featuresSchema } from "@/infra/database/schema/features";
import { gamesSchema } from "@/infra/database/schema/games";
import { channelsSchema } from "@/infra/database/schema/channels";
import { gameChannelsSchema } from "@/infra/database/schema/gameChannels";

const knownFeatures = ["read:activation_token", "vote:games"];

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
    countryFlag: "https://media.api-sports.io/flags/gb-eng.svg",
    leagueName: "Premiership Rugby",
    leagueLogo: "https://media.api-sports.io/rugby/leagues/2.png",
    homeTeamName: "Northampton Saints",
    homeTeamLogo: "https://media.api-sports.io/rugby/teams/15.png",
    awayTeamName: "Bristol Bears",
    awayTeamLogo: "https://media.api-sports.io/rugby/teams/14.png",
    scoresHome: 23,
    scoresAway: 19,
  },
  {
    apiId: 90002,
    date: daysFromToday(-1, 17, 30),
    timestamp: 0,
    countryName: "France",
    countryFlag: "https://media.api-sports.io/flags/fr.svg",
    leagueName: "Top 14",
    leagueLogo: "https://media.api-sports.io/rugby/leagues/4.png",
    homeTeamName: "Toulouse",
    homeTeamLogo: "https://media.api-sports.io/rugby/teams/20.png",
    awayTeamName: "La Rochelle",
    awayTeamLogo: "https://media.api-sports.io/rugby/teams/21.png",
    scoresHome: 31,
    scoresAway: 17,
  },
  {
    apiId: 90003,
    date: daysFromToday(-1, 20, 0),
    timestamp: 0,
    countryName: "Europe",
    countryFlag: null,
    leagueName: "United Rugby Championship",
    leagueLogo: "https://media.api-sports.io/rugby/leagues/5.png",
    homeTeamName: "Leinster",
    homeTeamLogo: "https://media.api-sports.io/rugby/teams/30.png",
    awayTeamName: "Ulster",
    awayTeamLogo: "https://media.api-sports.io/rugby/teams/31.png",
    scoresHome: null,
    scoresAway: null,
  },
  {
    apiId: 90004,
    date: daysFromToday(0, 15, 0),
    timestamp: 0,
    countryName: "New Zealand",
    countryFlag: "https://media.api-sports.io/flags/nz.svg",
    leagueName: "Super Rugby Pacific",
    leagueLogo: "https://media.api-sports.io/rugby/leagues/6.png",
    homeTeamName: "Chiefs",
    homeTeamLogo: "https://media.api-sports.io/rugby/teams/40.png",
    awayTeamName: "Highlanders",
    awayTeamLogo: "https://media.api-sports.io/rugby/teams/41.png",
    scoresHome: null,
    scoresAway: null,
  },
  {
    apiId: 90005,
    date: daysFromToday(0, 17, 0),
    timestamp: 0,
    countryName: "New Zealand",
    countryFlag: "https://media.api-sports.io/flags/nz.svg",
    leagueName: "Super Rugby Pacific",
    leagueLogo: "https://media.api-sports.io/rugby/leagues/6.png",
    homeTeamName: "Blues",
    homeTeamLogo: "https://media.api-sports.io/rugby/teams/42.png",
    awayTeamName: "Crusaders",
    awayTeamLogo: "https://media.api-sports.io/rugby/teams/43.png",
    scoresHome: null,
    scoresAway: null,
  },
  {
    apiId: 90006,
    date: daysFromToday(0, 19, 45),
    timestamp: 0,
    countryName: "France",
    countryFlag: "https://media.api-sports.io/flags/fr.svg",
    leagueName: "Top 14",
    leagueLogo: "https://media.api-sports.io/rugby/leagues/4.png",
    homeTeamName: "Stade Français",
    homeTeamLogo: "https://media.api-sports.io/rugby/teams/22.png",
    awayTeamName: "Racing 92",
    awayTeamLogo: "https://media.api-sports.io/rugby/teams/23.png",
    scoresHome: null,
    scoresAway: null,
  },
  {
    apiId: 90007,
    date: daysFromToday(0, 22, 0),
    timestamp: 0,
    countryName: "Europe",
    countryFlag: null,
    leagueName: "Six Nations Women",
    leagueLogo: null,
    homeTeamName: "Wales W",
    homeTeamLogo: null,
    awayTeamName: "Italy W",
    awayTeamLogo: null,
    scoresHome: null,
    scoresAway: null,
  },
  {
    apiId: 90008,
    date: daysFromToday(1, 15, 0),
    timestamp: 0,
    countryName: "England",
    countryFlag: "https://media.api-sports.io/flags/gb-eng.svg",
    leagueName: "Premiership Rugby",
    leagueLogo: "https://media.api-sports.io/rugby/leagues/2.png",
    homeTeamName: "Saracens",
    homeTeamLogo: "https://media.api-sports.io/rugby/teams/16.png",
    awayTeamName: "Bath Rugby",
    awayTeamLogo: "https://media.api-sports.io/rugby/teams/17.png",
    scoresHome: null,
    scoresAway: null,
  },
  {
    apiId: 90009,
    date: daysFromToday(1, 18, 0),
    timestamp: 0,
    countryName: "Europe",
    countryFlag: null,
    leagueName: "United Rugby Championship",
    leagueLogo: "https://media.api-sports.io/rugby/leagues/5.png",
    homeTeamName: "Munster",
    homeTeamLogo: "https://media.api-sports.io/rugby/teams/32.png",
    awayTeamName: "Glasgow Warriors",
    awayTeamLogo: "https://media.api-sports.io/rugby/teams/33.png",
    scoresHome: null,
    scoresAway: null,
  },
];

const channelsSeed = [
  { name: "Disney+ Brasil", logo: null, url: "https://www.disneyplus.com" },
  { name: "ESPN", logo: null, url: "https://www.espn.com.br" },
  { name: "YouTube", logo: null, url: "https://www.youtube.com" },
  { name: "RugbyPass", logo: null, url: "https://www.rugbypass.com" },
  { name: "TV5Monde", logo: null, url: "https://www.tv5monde.com" },
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
