"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ChannelWithVotes, GameWithVotes } from "@/domain/games/games.types";
import { formatTime } from "@/app/shared/lib/format";
import TeamLogo from "./TeamLogo";
import SuggestChannelModal from "./SuggestChannelModal";
import ConfirmModal from "./ConfirmModal";
import { useGameVoting } from "./useGameVoting";
import { TrashIcon } from "@/app/shared/lib/icons";

type Props = {
  game: GameWithVotes;
  isLoggedIn: boolean;
  userId?: string;
  isAdmin?: boolean;
  onVote: (channelId: string, voteType: "upvote" | "downvote") => void;
  onVoteSettled: () => void;
};

export default function GameRow({ game, isLoggedIn, userId, isAdmin, onVote, onVoteSettled }: Props) {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const { vote, openModal, handleConfirm, isPending, dialogRef, selectedChannelId, setSelectedChannelId } = useGameVoting({
    game,
    isLoggedIn,
    onVote,
    onVoteSettled,
  });

  const isCommunityGame = game.createdByUserId !== null;
  const canDelete = isCommunityGame && (game.createdByUserId === userId || isAdmin);

  async function handleDelete() {
    await fetch(`/api/v1/games/${game.id}`, { method: "DELETE" });
    setShowConfirm(false);
    router.refresh();
  }

  const hasOfficialChannels = game.channels.length > 0;
  const isEventGame = game.homeTeamName === "" && game.awayTeamName === "";
  const votedChannels = game.allChannels.filter((c) => c.upvoteCount > 0 || c.downvoteCount > 0);
  const competition = game.countryName ? `${game.countryName} · ${game.leagueName}` : game.leagueName;

  return (
    <>
      <div className="flex items-center gap-3 sm:gap-5 py-[18px] px-1 border-b border-base-300 flex-wrap">
        <span className="w-[54px] shrink-0 text-sm font-bold text-secondary tabular-nums">{formatTime(new Date(game.date))}</span>

        {isEventGame ? (
          <div className="flex-1 min-w-[200px]">
            <span className="font-semibold text-[15px] tracking-tight">{game.leagueName}</span>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 flex-[1.4] min-w-[220px]">
              <TeamLogo name={game.homeTeamName} logo={game.homeTeamLogo} size="sm" />
              <span className="font-semibold text-[15px] tracking-tight truncate max-w-[110px]">{game.homeTeamName}</span>
              {game.scoresHome !== null && <span className="font-bold tabular-nums shrink-0">{game.scoresHome}</span>}
              <span className="text-base-content/25 text-sm px-0.5 shrink-0">&times;</span>
              <TeamLogo name={game.awayTeamName} logo={game.awayTeamLogo} size="sm" />
              <span className="font-semibold text-[15px] tracking-tight truncate max-w-[110px]">{game.awayTeamName}</span>
              {game.scoresAway !== null && <span className="font-bold tabular-nums shrink-0">{game.scoresAway}</span>}
            </div>

            <div className="flex items-center gap-2 flex-1 min-w-[130px]">
              <span className="text-[10.5px] tracking-[0.1em] uppercase text-base-content/45 leading-tight">{competition}</span>
              {isCommunityGame && <span className="badge badge-warning badge-xs shrink-0">Comunidade</span>}
            </div>
          </>
        )}

        <div className="flex items-center gap-2 shrink-0 ml-auto">
          {canDelete && (
            <button
              type="button"
              onClick={() => setShowConfirm(true)}
              title="Deletar jogo"
              className="text-base-content/40 hover:text-error transition-colors cursor-pointer"
            >
              <TrashIcon className="w-3.5 h-3.5" />
            </button>
          )}
          {hasOfficialChannels ? (
            <div className="flex flex-wrap gap-1.5 justify-end">
              {game.channels.map((channel) => (
                <span
                  key={channel.id}
                  className="text-[11.5px] font-bold tracking-[0.02em] text-secondary bg-[#EEF3FF] border border-[#DCE6FF] rounded px-2.5 py-1.5"
                >
                  {channel.name}
                </span>
              ))}
            </div>
          ) : votedChannels.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 justify-end">
              {votedChannels.map((channel) => (
                <ChannelPill key={channel.id} channel={channel} onVote={vote} isPending={isPending} />
              ))}
            </div>
          ) : (
            <button
              type="button"
              onClick={openModal}
              disabled={isPending}
              className="text-[11px] tracking-[0.06em] uppercase font-bold text-secondary border border-[#DCE6FF] rounded-full px-4 py-2 hover:border-primary hover:text-primary hover:bg-[#F6F9FF] transition-colors whitespace-nowrap"
            >
              + Indicar transmissão
            </button>
          )}
        </div>
      </div>

      <SuggestChannelModal
        homeTeamName={game.homeTeamName}
        awayTeamName={game.awayTeamName}
        channels={game.allChannels}
        selectedChannelId={selectedChannelId}
        onSelectChannel={setSelectedChannelId}
        onConfirm={handleConfirm}
        dialogRef={dialogRef}
      />

      {showConfirm && (
        <ConfirmModal
          message={`Tem certeza que deseja deletar o jogo ${game.homeTeamName} × ${game.awayTeamName}?`}
          onConfirm={handleDelete}
          onClose={() => setShowConfirm(false)}
        />
      )}
    </>
  );
}

type ChannelPillProps = {
  channel: ChannelWithVotes;
  onVote: (channelId: string, voteType: "upvote" | "downvote") => void;
  isPending: boolean;
};

function ChannelPill({ channel, onVote, isPending }: ChannelPillProps) {
  return (
    <div className="flex items-stretch rounded-lg border border-base-300 overflow-hidden text-[0.625rem]">
      <span className="px-2 py-1 bg-primary text-primary-content border-r border-primary/70">{channel.name}</span>
      <button
        type="button"
        disabled={isPending}
        onClick={() => onVote(channel.id, "upvote")}
        title="Confirmo"
        className={`flex items-center gap-0.5 px-2 py-1 font-medium transition-colors border-r border-base-300 cursor-pointer ${
          channel.userVote === "upvote"
            ? "bg-success/20 text-success"
            : "bg-base-100 text-base-content/70 hover:bg-success/10 hover:text-success"
        }`}
      >
        ▲ {channel.upvoteCount}
      </button>
      <button
        type="button"
        disabled={isPending}
        onClick={() => onVote(channel.id, "downvote")}
        title="Não confirmo"
        className={`flex items-center gap-0.5 px-2 py-1 font-medium transition-colors cursor-pointer ${
          channel.userVote === "downvote" ? "bg-error/20 text-error" : "bg-base-100 text-base-content/70 hover:bg-error/10 hover:text-error"
        }`}
      >
        ▼ {channel.downvoteCount}
      </button>
    </div>
  );
}
