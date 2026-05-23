"use client";

import { useState } from "react";
import type { ChannelWithVotes, GameWithVotes } from "@/domain/games/games.types";
import DateSelector, { type DateOption } from "./DateSelector";
import GameCard from "./GameCard";
import GameRow from "./GameRow";
import { useFilter } from "@/app/context/FilterContext";

const titles: Record<DateOption, string> = {
  yesterday: "Jogos com transmissão ontem",
  today: "Jogos com transmissão hoje",
  tomorrow: "Jogos com transmissão amanhã",
};

type Props = { games: GameWithVotes[]; isLoggedIn: boolean };

type LocalVotes = Record<string, Record<string, { upvoteCount: number; downvoteCount: number; userVote: "upvote" | "downvote" | null }>>;

function groupByLeague(games: GameWithVotes[]): Record<string, GameWithVotes[]> {
  return games.reduce(
    (acc, game) => {
      if (!acc[game.leagueName]) acc[game.leagueName] = [];
      acc[game.leagueName].push(game);
      return acc;
    },
    {} as Record<string, GameWithVotes[]>,
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

function mergeChannels(game: GameWithVotes, localVotes: LocalVotes): ChannelWithVotes[] {
  return game.allChannels.map((c) => {
    const local = localVotes[game.id]?.[c.id];
    return local ? { ...c, ...local } : c;
  });
}

function hasBroadcast(game: GameWithVotes, localVotes: LocalVotes): boolean {
  if (game.channels.length > 0) return true;
  return mergeChannels(game, localVotes).some((c) => c.upvoteCount > c.downvoteCount);
}

function matchesQuery(game: GameWithVotes, query: string): boolean {
  if (!query.trim()) return true;
  const q = query.toLowerCase();
  return (
    game.homeTeamName.toLowerCase().includes(q) || game.awayTeamName.toLowerCase().includes(q) || game.leagueName.toLowerCase().includes(q)
  );
}

export default function GamesSection({ games, isLoggedIn }: Props) {
  const [selected, setSelected] = useState<DateOption>("today");
  const [localVotes, setLocalVotes] = useState<LocalVotes>({});
  const { query } = useFilter();

  function clearLocalVotes(gameId: string) {
    setLocalVotes((prev) => {
      const next = { ...prev };
      delete next[gameId];
      return next;
    });
  }

  function handleVote(gameId: string, channelId: string, voteType: "upvote" | "downvote") {
    setLocalVotes((prev) => {
      const current = prev[gameId]?.[channelId] ?? { upvoteCount: 0, downvoteCount: 0, userVote: null };
      const wasVoted = current.userVote === voteType;
      return {
        ...prev,
        [gameId]: {
          ...prev[gameId],
          [channelId]: {
            upvoteCount: voteType === "upvote" ? current.upvoteCount + (wasVoted ? -1 : 1) : current.upvoteCount,
            downvoteCount: voteType === "downvote" ? current.downvoteCount + (wasVoted ? -1 : 1) : current.downvoteCount,
            userVote: wasVoted ? null : voteType,
          },
        },
      };
    });
  }

  function getGameWithLocalVotes(game: GameWithVotes): GameWithVotes {
    return { ...game, allChannels: mergeChannels(game, localVotes) };
  }

  const targetDate = getTargetDateString(selected);
  const gamesForDay = games.filter((g) => getSpDateString(new Date(g.date)) === targetDate && matchesQuery(g, query));
  const withBroadcast = gamesForDay.filter((g) => hasBroadcast(g, localVotes));
  const withoutBroadcast = gamesForDay.filter((g) => !hasBroadcast(g, localVotes));
  const groupedByLeague = groupByLeague(withoutBroadcast);

  const tomorrowWithBroadcast =
    selected === "today" && withBroadcast.length === 0
      ? games.filter((g) => getSpDateString(new Date(g.date)) === getTargetDateString("tomorrow") && hasBroadcast(g, localVotes))
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
              <GameCard
                key={game.id}
                game={getGameWithLocalVotes(game)}
                isLoggedIn={isLoggedIn}
                onVote={(channelId, voteType) => handleVote(game.id, channelId, voteType)}
                onVoteSettled={() => clearLocalVotes(game.id)}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-base-content/40">
            {query.trim()
              ? `Nenhum jogo com transmissão corresponde a "${query}".`
              : "Nenhum jogo com transmissão confirmada para este dia."}
          </p>
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
              <GameCard
                key={game.id}
                game={getGameWithLocalVotes(game)}
                isLoggedIn={isLoggedIn}
                onVote={(channelId, voteType) => handleVote(game.id, channelId, voteType)}
                onVoteSettled={() => clearLocalVotes(game.id)}
              />
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
                <div className="border border-base-300 rounded-lg overflow-hidden divide-y divide-base-300">
                  {leagueGames.map((game) => (
                    <GameRow
                      key={game.id}
                      game={getGameWithLocalVotes(game)}
                      isLoggedIn={isLoggedIn}
                      onVote={(channelId, voteType) => handleVote(game.id, channelId, voteType)}
                      onVoteSettled={() => clearLocalVotes(game.id)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-base-content/40">
            {query.trim() ? `Nenhum outro jogo corresponde a "${query}".` : "Nenhum outro jogo registrado para este dia."}
          </p>
        )}
      </section>
    </>
  );
}
