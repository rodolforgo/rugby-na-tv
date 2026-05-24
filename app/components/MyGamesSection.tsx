"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { GameWithChannels } from "@/domain/games/games.types";
import { formatTime } from "@/app/shared/lib/format";
import ConfirmModal from "./ConfirmModal";

type Props = { games: GameWithChannels[] };

export default function MyGamesSection({ games }: Props) {
  const router = useRouter();
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  async function handleDelete() {
    if (!pendingDeleteId) return;
    await fetch(`/api/v1/games/${pendingDeleteId}`, { method: "DELETE" });
    setPendingDeleteId(null);
    router.refresh();
  }

  if (games.length === 0) {
    return <p className="text-sm text-base-content/40">Você ainda não adicionou nenhum jogo.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {games.map((game) => (
        <div key={game.id} className="flex items-center justify-between gap-4 border border-base-300 rounded-lg px-4 py-3 bg-base-100">
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-sm font-medium text-base-content truncate">
              {game.homeTeamName} × {game.awayTeamName}
            </span>
            <span className="text-xs text-base-content/50">
              {game.leagueName} · {formatTime(new Date(game.date))}
            </span>
            {game.channels.length > 0 && (
              <span className="text-xs text-base-content/40">{game.channels.map((c) => c.name).join(", ")}</span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setPendingDeleteId(game.id)}
            className="btn btn-ghost btn-sm text-error hover:bg-error/10 shrink-0"
          >
            Deletar
          </button>
        </div>
      ))}

      {pendingDeleteId && (
        <ConfirmModal
          message={`Tem certeza que deseja deletar o jogo ${games.find((g) => g.id === pendingDeleteId)?.homeTeamName} × ${games.find((g) => g.id === pendingDeleteId)?.awayTeamName}?`}
          onConfirm={handleDelete}
          onClose={() => setPendingDeleteId(null)}
        />
      )}
    </div>
  );
}
