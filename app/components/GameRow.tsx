"use client";

import type { ChannelWithVotes, GameWithVotes } from "@/domain/games/games.types";
import { formatTime } from "@/app/lib/format";
import TeamLogo from "./TeamLogo";
import SuggestChannelModal from "./SuggestChannelModal";
import { useGameVoting } from "./useGameVoting";

type Props = {
  game: GameWithVotes;
  isLoggedIn: boolean;
  onVote: (channelId: string, voteType: "upvote" | "downvote") => void;
  onVoteSettled: () => void;
};

export default function GameRow({ game, isLoggedIn, onVote, onVoteSettled }: Props) {
  const { vote, openModal, handleConfirm, isPending, dialogRef, selectedChannelId, setSelectedChannelId } = useGameVoting({
    game,
    isLoggedIn,
    onVote,
    onVoteSettled,
  });

  const votedChannels = game.allChannels.filter((c) => c.upvoteCount > 0 || c.downvoteCount > 0);

  return (
    <>
      <div className="py-2 px-3 text-sm">
        <div className="flex items-center gap-3">
          <span className="w-10 shrink-0 text-xs text-base-content/40">{formatTime(new Date(game.date))}</span>

          <div className="flex-1 min-w-0 flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <TeamLogo logo={game.homeTeamLogo} name={game.homeTeamName} size="sm" />
              <span className="text-base-content font-medium truncate">{game.homeTeamName}</span>
            </div>
            <div className="flex items-center gap-2">
              <TeamLogo logo={game.awayTeamLogo} name={game.awayTeamName} size="sm" />
              <span className="text-base-content font-medium truncate">{game.awayTeamName}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={openModal}
            disabled={isPending}
            className="text-xs text-primary/60 hover:text-primary transition-colors shrink-0"
          >
            + Indicar transmissão
          </button>
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
      <span className="px-2 py-1 text-base-content/60 bg-base-100 border-r border-base-300">{channel.name}</span>
      <button
        type="button"
        disabled={isPending}
        onClick={() => onVote(channel.id, "upvote")}
        className={`flex items-center gap-0.5 px-2 py-1 font-medium transition-colors border-r border-base-300 ${
          channel.userVote === "upvote"
            ? "bg-success/20 text-success"
            : "bg-base-100 text-base-content/40 hover:bg-success/10 hover:text-success"
        }`}
      >
        ▲ {channel.upvoteCount}
      </button>
      <button
        type="button"
        disabled={isPending}
        onClick={() => onVote(channel.id, "downvote")}
        className={`flex items-center gap-0.5 px-2 py-1 font-medium transition-colors ${
          channel.userVote === "downvote" ? "bg-error/20 text-error" : "bg-base-100 text-base-content/40 hover:bg-error/10 hover:text-error"
        }`}
      >
        ▼ {channel.downvoteCount}
      </button>
    </div>
  );
}
