"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { ChannelWithVotes, GameWithVotes } from "@/domain/games/games.types";
import DateSelector, { type DateOption } from "./DateSelector";
import GameRow from "./GameRow";
import CreateGameModal from "./CreateGameModal";
import { useFilter } from "@/app/shared/context/FilterContext";

const titles: Record<DateOption, string> = {
  yesterday: "Jogos com transmissão ontem",
  today: "Jogos com transmissão hoje",
  tomorrow: "Jogos com transmissão amanhã",
};

type Props = { games: GameWithVotes[]; isLoggedIn: boolean; userId?: string; canCreateGame?: boolean; isAdmin?: boolean };

type LocalVotes = Record<string, Record<string, { upvoteCount: number; downvoteCount: number; userVote: "upvote" | "downvote" | null }>>;

type LeagueGroup = { games: GameWithVotes[]; countryName: string; countryFlag: string | null };

function groupByLeague(games: GameWithVotes[]): Record<string, LeagueGroup> {
  return games.reduce(
    (acc, game) => {
      if (!acc[game.leagueName]) acc[game.leagueName] = { games: [], countryName: game.countryName, countryFlag: game.countryFlag };
      acc[game.leagueName].games.push(game);
      return acc;
    },
    {} as Record<string, LeagueGroup>,
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

function GameList({
  games,
  isLoggedIn,
  userId,
  isAdmin,
  localVotes,
  onVote,
  onVoteSettled,
}: {
  games: GameWithVotes[];
  isLoggedIn: boolean;
  userId?: string;
  isAdmin?: boolean;
  localVotes: LocalVotes;
  onVote: (gameId: string, channelId: string, voteType: "upvote" | "downvote") => void;
  onVoteSettled: (gameId: string) => void;
}) {
  const grouped = groupByLeague(games);
  return (
    <>
      {Object.entries(grouped).map(([league, group]) => (
        <div key={league}>
          <div className="flex items-center gap-1.5 pt-5 pb-1 px-1">
            {group.countryFlag ? (
              <Image src={group.countryFlag} alt={group.countryName} width={14} height={10} className="object-cover rounded-sm shrink-0" />
            ) : null}
            <span className="text-[10px] tracking-[0.14em] uppercase text-base-content/40 font-semibold">{league}</span>
          </div>
          {group.games.map((game) => {
            const merged = { ...game, allChannels: mergeChannels(game, localVotes) };
            return (
              <GameRow
                key={game.id}
                game={merged}
                isLoggedIn={isLoggedIn}
                userId={userId}
                isAdmin={isAdmin}
                onVote={(channelId, voteType) => onVote(game.id, channelId, voteType)}
                onVoteSettled={() => onVoteSettled(game.id)}
              />
            );
          })}
        </div>
      ))}
    </>
  );
}

export default function GamesSection({ games, isLoggedIn, userId, isAdmin }: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState<DateOption>("today");
  const [localVotes, setLocalVotes] = useState<LocalVotes>({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { query } = useFilter();

  function handleAddGame() {
    if (!isLoggedIn) {
      router.push("/?modal=login");
      return;
    }
    setShowCreateModal(true);
  }

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

  const targetDate = getTargetDateString(selected);
  const gamesForDay = games.filter((g) => getSpDateString(new Date(g.date)) === targetDate && matchesQuery(g, query));
  const withBroadcast = gamesForDay.filter((g) => hasBroadcast(g, localVotes));
  const withoutBroadcast = gamesForDay.filter((g) => !hasBroadcast(g, localVotes));

  const tomorrowWithBroadcast =
    selected === "today" && withBroadcast.length === 0
      ? games.filter((g) => getSpDateString(new Date(g.date)) === getTargetDateString("tomorrow") && hasBroadcast(g, localVotes))
      : [];
  const showTomorrowFallback = tomorrowWithBroadcast.length > 0;

  return (
    <>
      <section className="max-w-5xl mx-auto px-6 pt-10 pb-8">
        <div className="flex items-end justify-between gap-6 flex-wrap mb-8">
          <div>
            <div className="text-[12px] tracking-[0.16em] uppercase text-primary mb-2.5">{getDateLabel(selected)}</div>
            <h1 className="m-0 font-extrabold text-[clamp(20px,3vw,27px)] leading-tight tracking-[-0.025em]">{titles[selected]}</h1>
          </div>
          <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={handleAddGame}
              className="text-[11.5px] tracking-[0.08em] uppercase font-bold text-primary hover:text-primary/70 transition-colors cursor-pointer"
            >
              + Adicionar jogo
            </button>
            <DateSelector selected={selected} onChange={setSelected} />
          </div>
        </div>

        {withBroadcast.length > 0 ? (
          <div className="border-t-2 border-base-content">
            <GameList
              games={withBroadcast}
              isLoggedIn={isLoggedIn}
              userId={userId}
              isAdmin={isAdmin}
              localVotes={localVotes}
              onVote={handleVote}
              onVoteSettled={clearLocalVotes}
            />
          </div>
        ) : (
          <div className="border border-dashed border-base-300 rounded-md px-6 py-12 text-center">
            <p className="font-bold text-lg tracking-tight mb-2">
              {query.trim() ? `Nenhum jogo com transmissão corresponde a "${query}".` : "Nenhuma transmissão confirmada para este dia."}
            </p>
            {!query.trim() && (
              <p className="text-[12px] tracking-[0.04em] text-base-content/50">
                Sabe de algum jogo? Ajude indicando a transmissão abaixo.
              </p>
            )}
          </div>
        )}
      </section>

      {showTomorrowFallback && (
        <section className="max-w-5xl mx-auto px-6 pb-8">
          <div className="mb-6">
            <div className="text-[12px] tracking-[0.16em] uppercase text-primary mb-2.5">{getDateLabel("tomorrow")}</div>
            <h2 className="font-extrabold text-[clamp(22px,4vw,36px)] leading-tight tracking-[-0.025em]">{titles.tomorrow}</h2>
          </div>
          <div className="border-t-2 border-base-content">
            <GameList
              games={tomorrowWithBroadcast}
              isLoggedIn={isLoggedIn}
              userId={userId}
              isAdmin={isAdmin}
              localVotes={localVotes}
              onVote={handleVote}
              onVoteSettled={clearLocalVotes}
            />
          </div>
        </section>
      )}

      <section className="max-w-5xl mx-auto px-6 pb-16">
        <div className="flex items-center justify-between gap-4 flex-wrap border-b-2 border-base-content pb-3">
          <h2 className="font-extrabold text-[clamp(20px,3vw,27px)] tracking-[-0.025em]">Outros jogos do dia</h2>
          <button
            type="button"
            onClick={handleAddGame}
            className="text-[11.5px] tracking-[0.08em] uppercase font-bold text-primary hover:text-primary/70 transition-colors cursor-pointer"
          >
            + Adicionar jogo
          </button>
        </div>
        {withoutBroadcast.length > 0 ? (
          <GameList
            games={withoutBroadcast}
            isLoggedIn={isLoggedIn}
            userId={userId}
            isAdmin={isAdmin}
            localVotes={localVotes}
            onVote={handleVote}
            onVoteSettled={clearLocalVotes}
          />
        ) : (
          <p className="text-sm text-base-content/50 pt-6">
            {query.trim() ? `Nenhum outro jogo corresponde a "${query}".` : "Nenhum outro jogo registrado para este dia."}
          </p>
        )}
      </section>

      {showCreateModal && <CreateGameModal onClose={() => setShowCreateModal(false)} />}
    </>
  );
}
