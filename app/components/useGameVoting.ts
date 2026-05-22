"use client";

import { useState, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { GameWithVotes } from "@/domain/games/games.types";

type Props = {
  game: GameWithVotes;
  isLoggedIn: boolean;
  onVote: (channelId: string, voteType: "upvote" | "downvote") => void;
  onVoteSettled: () => void;
};

export function useGameVoting({ game, isLoggedIn, onVote, onVoteSettled }: Props) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [selectedChannelId, setSelectedChannelId] = useState(game.allChannels[0]?.id ?? "");
  const [isPending, startTransition] = useTransition();

  function vote(channelId: string, voteType: "upvote" | "downvote") {
    if (!isLoggedIn) {
      router.push("/?modal=login");
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
        router.push("/?modal=login");
        return;
      }
      onVoteSettled();
      router.refresh();
    });
  }

  function openModal() {
    startTransition(async () => {
      const res = await fetch(`/api/v1/games/${game.id}/votes`);
      if (res.status === 401) {
        router.push("/?modal=login");
        return;
      }
      setSelectedChannelId(game.allChannels[0]?.id ?? "");
      dialogRef.current?.showModal();
    });
  }

  function handleConfirm() {
    if (!selectedChannelId) return;

    startTransition(async () => {
      const res = await fetch(`/api/v1/games/${game.id}/votes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channelId: selectedChannelId, voteType: "upvote" }),
      });

      dialogRef.current?.close();

      if (res.status === 401) {
        router.push("/?modal=login");
        return;
      }

      onVote(selectedChannelId, "upvote");
      onVoteSettled();
      router.refresh();
    });
  }

  return { vote, openModal, handleConfirm, isPending, dialogRef, selectedChannelId, setSelectedChannelId };
}
