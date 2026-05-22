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

export default function GameCard({ game, isLoggedIn, onVote, onVoteSettled }: Props) {
  const { vote, openModal, handleConfirm, isPending, dialogRef, selectedChannelId, setSelectedChannelId } = useGameVoting({
    game,
    isLoggedIn,
    onVote,
    onVoteSettled,
  });

  const hasScore = game.scoresHome !== null && game.scoresAway !== null;
  const isFromRonin = game.channels.length > 0;
  const officialChannels = game.channels;
  const communityChannels = game.allChannels.filter((c) => c.isCommunity && c.upvoteCount > 0);
  const visibleChannels = [...officialChannels, ...communityChannels];
  const availableForSuggestion = game.allChannels.filter((c) => !visibleChannels.some((v) => v.id === c.id));

  return (
    <>
      <div className="card bg-base-100 border border-base-300 shadow-xs hover:shadow-md transition-shadow">
        <div className="card-body p-4 gap-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              {game.countryFlag ? <img src={game.countryFlag} alt={game.countryName} className="w-4 h-3 object-cover rounded-sm" /> : null}
              {game.leagueLogo ? <img src={game.leagueLogo} alt={game.leagueName} className="w-4 h-4 object-contain" /> : null}
              <span className="text-xs text-base-content/50 truncate">{game.leagueName}</span>
            </div>
            <span className="text-xs font-bold text-base-content/60 shrink-0">{formatTime(new Date(game.date))}</span>
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

          <div className="flex flex-wrap items-center gap-1 pt-2 border-t border-base-200">
            {officialChannels.map((channel) => (
              <div key={channel.id} className="flex items-center gap-1 badge badge-soft badge-primary text-xs">
                {channel.logo ? <img src={channel.logo} alt={channel.name} className="w-3 h-3 object-contain" /> : null}
                {channel.name}
              </div>
            ))}
            {!isFromRonin &&
              communityChannels.map((channel) => (
                <ChannelVoteBadge key={channel.id} channel={channel} onVote={vote} variant="success" isPending={isPending} />
              ))}
            {!isFromRonin && availableForSuggestion.length > 0 && (
              <button
                type="button"
                onClick={openModal}
                disabled={isPending}
                className="text-xs text-primary/60 hover:text-primary transition-colors px-1"
              >
                + Indicar
              </button>
            )}
          </div>
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
    </>
  );
}

type ChannelVoteBadgeProps = {
  channel: ChannelWithVotes;
  onVote: (channelId: string, voteType: "upvote" | "downvote") => void;
  variant: "primary" | "success";
  isPending: boolean;
};

function ChannelVoteBadge({ channel, onVote, variant, isPending }: ChannelVoteBadgeProps) {
  const baseColor = variant === "primary" ? "badge-primary" : "badge-success";
  const upColor = channel.userVote === "upvote" ? "text-success" : "text-base-content/40 hover:text-success";
  const downColor = channel.userVote === "downvote" ? "text-error" : "text-base-content/40 hover:text-error";

  return (
    <div className={`flex items-center gap-1 badge badge-soft ${baseColor} text-xs pr-0 overflow-hidden`}>
      {channel.logo ? <img src={channel.logo} alt={channel.name} className="w-3 h-3 object-contain" /> : null}
      <span>{channel.name}</span>
      <button
        type="button"
        disabled={isPending}
        onClick={() => onVote(channel.id, "upvote")}
        className={`px-1.5 py-0.5 transition-colors ${upColor}`}
      >
        ▲{channel.upvoteCount > 0 ? ` ${channel.upvoteCount}` : ""}
      </button>
      <button
        type="button"
        disabled={isPending}
        onClick={() => onVote(channel.id, "downvote")}
        className={`px-1.5 py-0.5 transition-colors ${downColor} mr-0.5`}
      >
        ▼{channel.downvoteCount > 0 ? ` ${channel.downvoteCount}` : ""}
      </button>
    </div>
  );
}
