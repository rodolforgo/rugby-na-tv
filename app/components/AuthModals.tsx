"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AuthModals() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const modal = searchParams.get("modal");

  const loginRef = useRef<HTMLDialogElement>(null);
  const registerRef = useRef<HTMLDialogElement>(null);

  function close() {
    router.replace("/", { scroll: false });
  }

  useEffect(() => {
    if (modal === "login") loginRef.current?.showModal();
    else loginRef.current?.close();
  }, [modal]);

  useEffect(() => {
    if (modal === "register") registerRef.current?.showModal();
    else registerRef.current?.close();
  }, [modal]);

  return (
    <>
      <LoginModal dialogRef={loginRef} onClose={close} onSwitchToRegister={() => router.replace("/?modal=register", { scroll: false })} />
      <RegisterModal dialogRef={registerRef} onClose={close} onSwitchToLogin={() => router.replace("/?modal=login", { scroll: false })} />
    </>
  );
}

type LoginModalProps = {
  dialogRef: React.RefObject<HTMLDialogElement | null>;
  onClose: () => void;
  onSwitchToRegister: () => void;
};

function LoginModal({ dialogRef, onClose, onSwitchToRegister }: LoginModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [emailUnverified, setEmailUnverified] = useState(false);
  const [resendStatus, setResendStatus] = useState<"idle" | "loading" | "sent">("idle");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setEmailUnverified(false);
    setResendStatus("idle");
    setLoading(true);

    const res = await fetch("/api/v1/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      window.location.href = "/";
      return;
    }

    const body = await res.json();
    if (res.status === 401 && body.message?.includes("verificado")) {
      setEmailUnverified(true);
    } else {
      setError(body.message ?? "Erro ao fazer login.");
    }
    setLoading(false);
  }

  async function handleResend() {
    setResendStatus("loading");
    await fetch("/api/v1/users/verify-email/resend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setResendStatus("sent");
  }

  return (
    <dialog ref={dialogRef} className="modal">
      <div className="modal-box max-w-sm">
        <h3 className="font-bold text-lg mb-4">Entrar</h3>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="alert alert-error text-sm">
              <span>{error}</span>
            </div>
          )}

          {emailUnverified && (
            <div className="alert alert-warning text-sm flex flex-col items-start gap-2">
              <span>E-mail não verificado. Verifique sua caixa de entrada.</span>
              {resendStatus === "sent" ? (
                <span className="text-success font-medium">Novo e-mail enviado!</span>
              ) : (
                <button type="button" className="btn btn-xs btn-warning" disabled={resendStatus === "loading"} onClick={handleResend}>
                  {resendStatus === "loading" ? <span className="loading loading-spinner loading-xs" /> : "Reenviar e-mail de verificação"}
                </button>
              )}
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label htmlFor="login-email" className="text-sm font-medium">
              E-mail
            </label>
            <input
              id="login-email"
              type="email"
              className="input input-bordered w-full"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="login-password" className="text-sm font-medium">
              Senha
            </label>
            <input
              id="login-password"
              type="password"
              className="input input-bordered w-full"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? <span className="loading loading-spinner loading-sm" /> : "Entrar"}
          </button>

          <p className="text-sm text-center text-base-content/60">
            Não tem conta?{" "}
            <button type="button" className="text-primary hover:underline" onClick={onSwitchToRegister}>
              Cadastre-se
            </button>
          </p>
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

type RegisterModalProps = {
  dialogRef: React.RefObject<HTMLDialogElement | null>;
  onClose: () => void;
  onSwitchToLogin: () => void;
};

function RegisterModal({ dialogRef, onClose, onSwitchToLogin }: RegisterModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/v1/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      setSuccess(true);
      setLoading(false);
      return;
    }

    const body = await res.json();
    setError(body.message ?? "Erro ao criar conta.");
    setLoading(false);
  }

  return (
    <dialog ref={dialogRef} className="modal">
      <div className="modal-box max-w-sm">
        <h3 className="font-bold text-lg mb-4">Criar conta</h3>

        {success ? (
          <div className="flex flex-col gap-4 text-center">
            <div className="alert alert-success text-sm">
              <span>Conta criada! Verifique seu e-mail para ativar a conta.</span>
            </div>
            <p className="text-sm text-base-content/60">
              Já confirmou?{" "}
              <button type="button" className="text-primary hover:underline" onClick={onSwitchToLogin}>
                Fazer login
              </button>
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="alert alert-error text-sm">
                <span>{error}</span>
              </div>
            )}

            <div className="flex flex-col gap-1">
              <label htmlFor="register-email" className="text-sm font-medium">
                E-mail
              </label>
              <input
                id="register-email"
                type="email"
                className="input input-bordered w-full"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="register-password" className="text-sm font-medium">
                Senha
              </label>
              <input
                id="register-password"
                type="password"
                className="input input-bordered w-full"
                placeholder="Mín. 8 caracteres, 1 maiúscula, 1 especial"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
              {loading ? <span className="loading loading-spinner loading-sm" /> : "Criar conta"}
            </button>

            <p className="text-sm text-center text-base-content/60">
              Já tem conta?{" "}
              <button type="button" className="text-primary hover:underline" onClick={onSwitchToLogin}>
                Entrar
              </button>
            </p>
          </form>
        )}
      </div>
      <form method="dialog" className="modal-backdrop">
        <button type="submit" onClick={onClose}>
          fechar
        </button>
      </form>
    </dialog>
  );
}
