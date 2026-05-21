"use client";

import { useState, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ChannelWithVotes, GameWithVotes } from "@/domain/games/games.types";
import TeamLogo from "./TeamLogo";

type Props = {
  game: GameWithVotes;
  isLoggedIn: boolean;
  onVote: (channelId: string, voteType: "upvote" | "downvote") => void;
  onVoteSettled: () => void;
};

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function GameCard({ game, isLoggedIn, onVote, onVoteSettled }: Props) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [selectedChannelId, setSelectedChannelId] = useState(game.allChannels[0]?.id ?? "");
  const [isPending, startTransition] = useTransition();

  const hasScore = game.scoresHome !== null && game.scoresAway !== null;
  const isFromRonin = game.channels.length > 0;
  const officialChannels = game.channels;
  const communityChannels = game.allChannels.filter((c) => c.isCommunity && c.upvoteCount > 0);
  const visibleChannels = [...officialChannels, ...communityChannels];

  const availableForSuggestion = game.allChannels.filter((c) => !visibleChannels.some((v) => v.id === c.id));

  function vote(channelId: string, voteType: "upvote" | "downvote") {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    onVote(channelId, voteType);

    startTransition(async () => {
      const res = await fetch(`/api/v1/games/${game.id}/votes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channelId, voteType }),
      });
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      onVoteSettled();
      router.refresh();
    });
  }

  function openModal() {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    setSelectedChannelId(game.allChannels[0]?.id ?? "");
    dialogRef.current?.showModal();
  }

  function handleConfirm() {
    if (!selectedChannelId) return;
    dialogRef.current?.close();
    vote(selectedChannelId, "upvote");
  }

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
              <button type="button" onClick={openModal} className="text-xs text-primary/60 hover:text-primary transition-colors px-1">
                + Indicar
              </button>
            )}
          </div>
        </div>
      </div>

      <dialog ref={dialogRef} className="modal">
        <div className="modal-box max-w-sm">
          <h3 className="font-semibold text-base mb-1">Indicar transmissão</h3>
          <p className="text-xs text-base-content/50 mb-4">
            {game.homeTeamName} × {game.awayTeamName}
          </p>

          <select
            className="select select-bordered w-full text-sm"
            value={selectedChannelId}
            onChange={(e) => setSelectedChannelId(e.target.value)}
          >
            {game.allChannels.map((channel) => (
              <option key={channel.id} value={channel.id}>
                {channel.name}
              </option>
            ))}
          </select>

          <div className="modal-action mt-4">
            <form method="dialog">
              <button type="submit" className="btn btn-ghost btn-sm mr-2">
                Cancelar
              </button>
            </form>
            <button type="button" className="btn btn-primary btn-sm" disabled={!selectedChannelId} onClick={handleConfirm}>
              Confirmar
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button type="submit">fechar</button>
        </form>
      </dialog>
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
