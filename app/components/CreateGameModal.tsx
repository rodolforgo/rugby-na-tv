"use client";

import { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Props = { onClose: () => void };

export default function CreateGameModal({ onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const router = useRouter();

  const [homeTeamName, setHomeTeamName] = useState("");
  const [awayTeamName, setAwayTeamName] = useState("");
  const [leagueName, setLeagueName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [channelName, setChannelName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const today = new Date();
  const minDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/v1/games", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ homeTeamName, awayTeamName, leagueName, date, time, channelName }),
    });

    if (res.ok) {
      onClose();
      router.refresh();
      return;
    }

    const body = await res.json();
    setError(body.message ?? "Erro ao adicionar jogo.");
    setLoading(false);
  }

  return (
    <dialog ref={dialogRef} className="modal">
      <div className="modal-box max-w-sm">
        <h3 className="font-bold text-lg mb-4">Adicionar jogo</h3>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="alert alert-error text-sm">
              <span>{error}</span>
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label htmlFor="home-team" className="text-sm font-medium">
              Time mandante
            </label>
            <input
              id="home-team"
              type="text"
              className="input input-bordered w-full"
              placeholder="Ex: Brasil"
              value={homeTeamName}
              onChange={(e) => setHomeTeamName(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="away-team" className="text-sm font-medium">
              Time visitante
            </label>
            <input
              id="away-team"
              type="text"
              className="input input-bordered w-full"
              placeholder="Ex: Argentina"
              value={awayTeamName}
              onChange={(e) => setAwayTeamName(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="league" className="text-sm font-medium">
              Campeonato
            </label>
            <input
              id="league"
              type="text"
              className="input input-bordered w-full"
              placeholder="Ex: The Rugby Championship"
              value={leagueName}
              onChange={(e) => setLeagueName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label htmlFor="game-date" className="text-sm font-medium">
                Data
              </label>
              <input
                id="game-date"
                type="date"
                className="input input-bordered w-full"
                min={minDate}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="game-time" className="text-sm font-medium">
                Hora (Brasília)
              </label>
              <input
                id="game-time"
                type="time"
                className="input input-bordered w-full"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="channel" className="text-sm font-medium">
              Canal / plataforma
            </label>
            <input
              id="channel"
              type="text"
              className="input input-bordered w-full"
              placeholder="Ex: ESPN, Star+, YouTube"
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? <span className="loading loading-spinner loading-sm" /> : "Adicionar"}
          </button>
        </form>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button type="submit" onClick={onClose}>
          fechar
        </button>
      </form>
    </dialog>
  );
}
