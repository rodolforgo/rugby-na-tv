import type { RefObject } from "react";
import type { ChannelWithVotes } from "@/domain/games/games.types";

type Props = {
  homeTeamName: string;
  awayTeamName: string;
  channels: ChannelWithVotes[];
  selectedChannelId: string;
  onSelectChannel: (id: string) => void;
  onConfirm: () => void;
  dialogRef: RefObject<HTMLDialogElement | null>;
};

export default function SuggestChannelModal({
  homeTeamName,
  awayTeamName,
  channels,
  selectedChannelId,
  onSelectChannel,
  onConfirm,
  dialogRef,
}: Props) {
  return (
    <dialog ref={dialogRef} className="modal">
      <div className="modal-box max-w-sm">
        <h3 className="font-semibold text-base mb-1">Indicar transmissão</h3>
        <p className="text-xs text-base-content/50 mb-4">
          {homeTeamName} × {awayTeamName}
        </p>

        <select
          className="select select-bordered w-full text-sm"
          value={selectedChannelId}
          onChange={(e) => onSelectChannel(e.target.value)}
        >
          {channels.map((channel) => (
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
          <button type="button" className="btn btn-primary btn-sm" disabled={!selectedChannelId} onClick={onConfirm}>
            Confirmar
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button type="submit">fechar</button>
      </form>
    </dialog>
  );
}
