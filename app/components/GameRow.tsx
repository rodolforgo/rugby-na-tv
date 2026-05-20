import type { GameWithChannels } from "@/domain/games/games.types";
import TeamLogo from "./TeamLogo";

type Props = { game: GameWithChannels };

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function GameRow({ game }: Props) {
  const hasScore = game.scoresHome !== null && game.scoresAway !== null;

  return (
    <div className="flex items-center gap-3 py-2 px-3 text-sm">
      <span className="text-base-content/40 w-10 shrink-0 text-xs">{formatTime(game.date)}</span>
      <div className="flex items-center gap-2 flex-1">
        <TeamLogo logo={game.homeTeamLogo} name={game.homeTeamName} size="sm" />
        <span className="text-base-content font-medium truncate">{game.homeTeamName}</span>
      </div>
      <span className="text-base-content/50 font-semibold shrink-0 text-xs">
        {hasScore ? `${game.scoresHome} – ${game.scoresAway}` : "×"}
      </span>
      <div className="flex items-center gap-2 flex-1 justify-end">
        <span className="text-base-content font-medium truncate text-right">{game.awayTeamName}</span>
        <TeamLogo logo={game.awayTeamLogo} name={game.awayTeamName} size="sm" />
      </div>
    </div>
  );
}
