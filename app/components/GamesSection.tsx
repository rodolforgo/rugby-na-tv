"use client";

import { useState } from "react";
import type { GameWithChannels } from "@/domain/games/games.types";
import DateSelector, { type DateOption } from "./DateSelector";
import GameCard from "./GameCard";
import GameRow from "./GameRow";

const titles: Record<DateOption, string> = {
  yesterday: "Jogos com transmissão ontem",
  today: "Jogos com transmissão hoje",
  tomorrow: "Jogos com transmissão amanhã",
};

type Props = { games: GameWithChannels[] };

function groupByLeague(games: GameWithChannels[]): Record<string, GameWithChannels[]> {
  return games.reduce(
    (acc, game) => {
      if (!acc[game.leagueName]) acc[game.leagueName] = [];
      acc[game.leagueName].push(game);
      return acc;
    },
    {} as Record<string, GameWithChannels[]>,
  );
}

function getSpDateString(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(date);
}

function getTargetDateString(option: DateOption): string {
  const now = new Date();
  if (option === "yesterday") now.setDate(now.getDate() - 1);
  if (option === "tomorrow") now.setDate(now.getDate() + 1);
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(now);
}

function getDateLabel(option: DateOption): string {
  const date = new Date();
  if (option === "yesterday") date.setDate(date.getDate() - 1);
  if (option === "tomorrow") date.setDate(date.getDate() + 1);

  const parts = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    weekday: "long",
    day: "numeric",
    month: "long",
  }).formatToParts(date);

  return parts.map((p) => (p.type === "month" ? p.value.charAt(0).toUpperCase() + p.value.slice(1) : p.value)).join("");
}

export default function GamesSection({ games }: Props) {
  const [selected, setSelected] = useState<DateOption>("today");

  const targetDate = getTargetDateString(selected);
  const gamesForDay = games.filter((g) => getSpDateString(new Date(g.date)) === targetDate);
  const withBroadcast = gamesForDay.filter((g) => g.channels.length > 0);
  const withoutBroadcast = gamesForDay.filter((g) => g.channels.length === 0);
  const groupedByLeague = groupByLeague(withoutBroadcast);

  const tomorrowWithBroadcast =
    selected === "today" && withBroadcast.length === 0
      ? games.filter((g) => getSpDateString(new Date(g.date)) === getTargetDateString("tomorrow") && g.channels.length > 0)
      : [];
  const showTomorrowFallback = tomorrowWithBroadcast.length > 0;

  return (
    <>
      <section className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-semibold text-base-content">{titles[selected]}</h2>
            <p className="text-xs text-base-content/40 mt-0.5">{getDateLabel(selected)}</p>
          </div>
          <DateSelector selected={selected} onChange={setSelected} />
        </div>
        {withBroadcast.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {withBroadcast.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-base-content/40">Nenhum jogo com transmissão confirmada para este dia.</p>
        )}
      </section>

      {showTomorrowFallback && (
        <section className="max-w-5xl mx-auto px-6 pb-8">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-base-content">{titles.tomorrow}</h2>
            <p className="text-xs text-base-content/40 mt-0.5">{getDateLabel("tomorrow")}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tomorrowWithBroadcast.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </section>
      )}

      <section className="max-w-5xl mx-auto px-6 pb-12">
        <h2 className="text-lg font-semibold text-base-content mb-4">Outros jogos do dia</h2>
        {withoutBroadcast.length > 0 ? (
          <div className="flex flex-col gap-6">
            {Object.entries(groupedByLeague).map(([league, leagueGames]) => (
              <div key={league}>
                <h3 className="text-xs font-semibold text-base-content/40 uppercase tracking-wider mb-1 px-3">
                  {league} · {leagueGames.length} {leagueGames.length === 1 ? "jogo" : "jogos"}
                </h3>
                <div className="border border-base-300 rounded-lg overflow-hidden">
                  {leagueGames.map((game) => (
                    <GameRow key={game.id} game={game} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-base-content/40">Nenhum outro jogo registrado para este dia.</p>
        )}
      </section>
    </>
  );
}
