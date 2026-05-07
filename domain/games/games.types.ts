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

export type Game = {
  id: number;
  date: string;
  timestamp: number;
  country: { name: string; flag: string };
  league: { name: string; logo: string };
  teams: {
    home: { name: string; logo: string };
    away: { logo: string };
  };
  scores: { home: number | null; away: number | null };
};
