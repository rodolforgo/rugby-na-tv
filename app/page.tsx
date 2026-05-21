import games from "@/models/games";
import GamesSection from "./components/GamesSection";

export default async function Home() {
  const allGames = await games.listForDisplay();
  return <GamesSection games={allGames} />;
}
