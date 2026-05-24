"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ChannelWithVotes, GameWithVotes } from "@/domain/games/games.types";
import { formatTime } from "@/app/lib/format";
import TeamLogo from "./TeamLogo";
import SuggestChannelModal from "./SuggestChannelModal";
import ConfirmModal from "./ConfirmModal";
import { useGameVoting } from "./useGameVoting";
import { TrashIcon } from "@/app/lib/icons";

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

  const votedChannels = game.allChannels.filter((c) => c.upvoteCount > 0 || c.downvoteCount > 0);

  return (
    <>
      <div className="py-2 px-3 text-sm">
        <div className="flex items-center gap-3">
          <span className="w-10 shrink-0 text-xs text-base-content/60">{formatTime(new Date(game.date))}</span>

          <div className="flex-1 min-w-0 flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <TeamLogo logo={game.homeTeamLogo} name={game.homeTeamName} size="sm" />
              <span className="text-base-content font-medium truncate">{game.homeTeamName}</span>
              {game.scoresHome !== null && (
                <span className="text-sm font-bold text-base-content/85 tabular-nums shrink-0">{game.scoresHome}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <TeamLogo logo={game.awayTeamLogo} name={game.awayTeamName} size="sm" />
              <span className="text-base-content font-medium truncate">{game.awayTeamName}</span>
              {game.scoresAway !== null && (
                <span className="text-sm font-bold text-base-content/85 tabular-nums shrink-0">{game.scoresAway}</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isCommunityGame && <span className="badge badge-warning badge-xs">Comunidade</span>}
            {canDelete && (
              <button
                type="button"
                onClick={() => setShowConfirm(true)}
                title="Deletar jogo"
                className="text-base-content/30 hover:text-error transition-colors cursor-pointer"
              >
                <TrashIcon className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={openModal}
              disabled={isPending}
              className="text-xs text-primary/60 hover:text-primary transition-colors"
            >
              + Indicar transmissão
            </button>
          </div>
        </div>

        {votedChannels.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2 ml-14">
            {votedChannels.map((channel) => (
              <ChannelPill key={channel.id} channel={channel} onVote={vote} isPending={isPending} />
            ))}
          </div>
        )}
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
    <div className="flex items-stretch rounded-lg border border-base-300 overflow-hidden text-xs">
      <span className="px-2 py-1 text-base-content/75 bg-base-100 border-r border-base-300">{channel.name}</span>
      <button
        type="button"
        disabled={isPending}
        onClick={() => onVote(channel.id, "upvote")}
        title="Confirmo"
        className={`flex items-center gap-0.5 px-2 py-1 font-medium transition-colors border-r border-base-300 cursor-pointer ${
          channel.userVote === "upvote"
            ? "bg-success/20 text-success"
            : "bg-base-100 text-base-content/60 hover:bg-success/10 hover:text-success"
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
          channel.userVote === "downvote" ? "bg-error/20 text-error" : "bg-base-100 text-base-content/60 hover:bg-error/10 hover:text-error"
        }`}
      >
        ▼ {channel.downvoteCount}
      </button>
    </div>
  );
}
