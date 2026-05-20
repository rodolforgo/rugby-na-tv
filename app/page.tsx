import type { GameWithChannels } from "@/domain/games/games.types";
import GamesSection from "./components/GamesSection";

const mockGames: GameWithChannels[] = [
  {
    id: "1",
    date: new Date("2026-05-20T19:45:00Z"),
    leagueName: "Premiership Rugby",
    leagueLogo: null,
    countryName: "England",
    countryFlag: null,
    homeTeamName: "Northampton Saints",
    homeTeamLogo: null,
    awayTeamName: "Bristol Bears",
    awayTeamLogo: null,
    scoresHome: 23,
    scoresAway: 19,
    channels: [{ id: "1", name: "Disney+ Brasil", logo: null, url: null }],
  },
  {
    id: "2",
    date: new Date("2026-05-20T21:00:00Z"),
    leagueName: "Super Rugby Pacific",
    leagueLogo: null,
    countryName: "New Zealand",
    countryFlag: null,
    homeTeamName: "Chiefs",
    homeTeamLogo: null,
    awayTeamName: "Highlanders",
    awayTeamLogo: null,
    scoresHome: null,
    scoresAway: null,
    channels: [
      { id: "2", name: "ESPN Brasil", logo: null, url: null },
      { id: "3", name: "Star+", logo: null, url: null },
    ],
  },
  {
    id: "3",
    date: new Date("2026-05-21T11:15:00Z"),
    leagueName: "Six Nations Women",
    leagueLogo: null,
    countryName: "Europe",
    countryFlag: null,
    homeTeamName: "Wales W",
    homeTeamLogo: null,
    awayTeamName: "Italy W",
    awayTeamLogo: null,
    scoresHome: null,
    scoresAway: null,
    channels: [{ id: "4", name: "Canal W", logo: null, url: null }],
  },
  {
    id: "4",
    date: new Date("2026-05-20T14:00:00Z"),
    leagueName: "Top 14",
    leagueLogo: null,
    countryName: "France",
    countryFlag: null,
    homeTeamName: "Toulouse",
    homeTeamLogo: null,
    awayTeamName: "La Rochelle",
    awayTeamLogo: null,
    scoresHome: null,
    scoresAway: null,
    channels: [],
  },
  {
    id: "5",
    date: new Date("2026-05-20T16:30:00Z"),
    leagueName: "Top 14",
    leagueLogo: null,
    countryName: "France",
    countryFlag: null,
    homeTeamName: "Stade Français",
    homeTeamLogo: null,
    awayTeamName: "Racing 92",
    awayTeamLogo: null,
    scoresHome: null,
    scoresAway: null,
    channels: [],
  },
  {
    id: "6",
    date: new Date("2026-05-20T18:00:00Z"),
    leagueName: "United Rugby Championship",
    leagueLogo: null,
    countryName: "Europe",
    countryFlag: null,
    homeTeamName: "Leinster",
    homeTeamLogo: null,
    awayTeamName: "Ulster",
    awayTeamLogo: null,
    scoresHome: null,
    scoresAway: null,
    channels: [],
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-base-100">
      <section className="bg-base-100 py-4">
        <p className="text-xs text-base-content/50 text-center px-6 max-w-2xl mx-auto">
          Esta plataforma não distribui, hospeda ou intermedia conteúdo audiovisual, limitando-se à divulgação de grade de programação de
          emissoras e serviços de streaming autorizados.
        </p>
      </section>

      <GamesSection games={mockGames} />
    </main>
  );
}
