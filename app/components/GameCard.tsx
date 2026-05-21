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

export default function GameCard({ game }: Props) {
  const hasScore = game.scoresHome !== null && game.scoresAway !== null;

  return (
    <div className="card bg-base-100 border border-base-300 shadow-xs hover:shadow-md transition-shadow">
      <div className="card-body p-4 gap-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            {game.countryFlag ? <img src={game.countryFlag} alt={game.countryName} className="w-4 h-3 object-cover rounded-sm" /> : null}
            {game.leagueLogo ? <img src={game.leagueLogo} alt={game.leagueName} className="w-4 h-4 object-contain" /> : null}
            <span className="text-xs text-base-content/50 truncate">{game.leagueName}</span>
          </div>
          <span className="text-xs font-bold text-base-content/60 shrink-0">{formatTime(game.date)}</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex flex-col items-center gap-1 flex-1">
            <TeamLogo logo={game.homeTeamLogo} name={game.homeTeamName} />
            <span className="text-xs font-medium text-base-content text-center leading-tight">{game.homeTeamName}</span>
          </div>

          {hasScore ? (
            <span className="text-lg font-bold text-base-content shrink-0">
              {game.scoresHome} – {game.scoresAway}
            </span>
          ) : (
            <span className="text-sm text-base-content/30 shrink-0">×</span>
          )}

          <div className="flex flex-col items-center gap-1 flex-1">
            <TeamLogo logo={game.awayTeamLogo} name={game.awayTeamName} />
            <span className="text-xs font-medium text-base-content text-center leading-tight">{game.awayTeamName}</span>
          </div>
        </div>

        {game.channels.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-2 border-t border-base-200">
            {game.channels.map((channel) => (
              <div key={channel.id} className="flex items-center gap-1 badge badge-soft badge-primary text-xs">
                {channel.logo ? <img src={channel.logo} alt={channel.name} className="w-3 h-3 object-contain" /> : null}
                {channel.name}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
