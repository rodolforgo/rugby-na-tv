export type ApiGame = {
  id: number;
  date: string;
  timestamp: number;
  country: { name: string; flag: string | null };
  league: { name: string; logo: string | null };
  teams: {
    home: { name: string; logo: string | null };
    away: { name: string; logo: string | null };
  };
  scores: { home: number | null; away: number | null };
};

export type GameData = {
  apiId: number | null;
  date: string;
  timestamp: number;
  country: { name: string; flag: string | null };
  league: { name: string; logo: string | null };
  teams: {
    home: { name: string; logo: string | null };
    away: { name: string; logo: string | null };
  };
  scores: { home: number | null; away: number | null };
};

export type Game = GameData & { id: string };

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
  home_team: string;
  visiting_team: string;
  league: string;
  channels: { name: string }[];
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
