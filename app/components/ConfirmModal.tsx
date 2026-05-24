"use client";

import { useEffect, useRef } from "react";

type Props = {
  message: string;
  onConfirm: () => void;
  onClose: () => void;
};

export default function ConfirmModal({ message, onConfirm, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  return (
    <dialog ref={dialogRef} className="modal">
      <div className="modal-box max-w-sm">
        <p className="text-sm text-base-content">{message}</p>
        <div className="flex justify-end gap-2 mt-6">
          <button type="button" onClick={onClose} className="btn btn-ghost btn-sm">
            Cancelar
          </button>
          <button type="button" onClick={onConfirm} className="btn btn-error btn-sm">
            Deletar
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button type="submit" onClick={onClose}>
          fechar
        </button>
      </form>
    </dialog>
  );
}
