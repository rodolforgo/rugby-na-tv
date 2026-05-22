import emailVerification from "@/models/emailVerification";

type Props = { searchParams: Promise<{ token?: string }> };

export default async function ConfirmarEmailPage({ searchParams }: Props) {
  const { token } = await searchParams;

  if (!token) {
    return <Result error="Token de verificação não informado." />;
  }

  try {
    await emailVerification.verifyEmailToken(token);
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="card bg-base-100 shadow-md w-full max-w-sm text-center">
          <div className="card-body gap-4">
            <div className="text-4xl">✓</div>
            <h1 className="text-xl font-bold text-success">E-mail confirmado!</h1>
            <p className="text-sm text-base-content/60">Sua conta está ativa. Você já pode fazer login.</p>
            <a href="/?modal=login" className="btn btn-primary w-full">
              Fazer login
            </a>
          </div>
        </div>
      </div>
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Token inválido ou expirado.";
    return <Result error={message} />;
  }
}

function Result({ error }: { error: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="card bg-base-100 shadow-md w-full max-w-sm text-center">
        <div className="card-body gap-4">
          <h1 className="text-xl font-bold">Confirmação de e-mail</h1>
          <div className="alert alert-error text-sm">
            <span>{error}</span>
          </div>
          <p className="text-sm text-base-content/60">Solicite um novo link de verificação.</p>
          <a href="/?modal=register" className="btn btn-ghost btn-sm">
            Voltar ao cadastro
          </a>
        </div>
      </div>
    </div>
  );
}
