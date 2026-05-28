export type ApiGame = {
  id: number;
  date: string;
  timestamp: number;
  country: { name: string; flag: string };
  league: { name: string; logo: string };
  teams: {
    home: { name: string; logo: string };
    away: { name: string; logo: string };
  };
  scores: { home: number | null; away: number | null };
};

export type GameData = {
  apiId: number | null;
  date: string;
  timestamp: number;
  country: { name: string; flag: string };
  league: { name: string; logo: string };
  teams: {
    home: { name: string; logo: string };
    away: { name: string; logo: string };
  };
  scores: { home: number | null; away: number | null };
};

export type Game = GameData & { id: string };

export type GameWithChannels = {
  id: string;
  date: Date;
  leagueName: string;
  countryName: string;
  homeTeamName: string;
  homeTeamLogo: string | null;
  awayTeamName: string;
  awayTeamLogo: string | null;
  scoresHome: number | null;
  scoresAway: number | null;
  createdByUserId: string | null;
  channels: { id: string; name: string; logo: string | null; url: string | null; voteable: boolean }[];
};

export type ChannelWithVotes = {
  id: string;
  name: string;
  logo: string | null;
  url: string | null;
  upvoteCount: number;
  downvoteCount: number;
  userVote: "upvote" | "downvote" | null;
  isCommunity: boolean;
};

export type GameWithVotes = GameWithChannels & {
  allChannels: ChannelWithVotes[];
};

export type BroadcastCompareResult = {
  date: string;
  roninTotal: number;
  dbGamesTotal: number;
  matched: number;
  created: number;
  unmatched: { homeTeam: string; visitingTeam: string; league: string }[];
};

export type Broadcast = {
  id: number;
  date: string;
  homeTeam: string;
  visitingTeam: string;
  league: string;
  channels: { name: string }[];
};

type RoninFixture = {
  fixture_id: number;
  date: string;
  home_team: string | null;
  visiting_team: string | null;
  league: string | null;
  channels: { name: string }[] | null;
};

export type RoninApiResponse = Array<{
  sports: Array<
    Array<{
      sports: Array<{
        leagues: Array<{
          oldFixtures?: RoninFixture[];
          fixtures?: RoninFixture[];
        }>;
      }>;
    }>
  >;
}>;
