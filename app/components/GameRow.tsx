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

export default function GameRow({ game, isLoggedIn, onVote, onVoteSettled }: Props) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [selectedChannelId, setSelectedChannelId] = useState(game.allChannels[0]?.id ?? "");
  const [isPending, startTransition] = useTransition();

  const votedChannels = game.allChannels.filter((c) => c.upvoteCount > 0 || c.downvoteCount > 0);

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

          <button type="button" onClick={openModal} className="text-xs text-primary/60 hover:text-primary transition-colors shrink-0">
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
