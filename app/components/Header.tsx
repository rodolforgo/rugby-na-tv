import { cookies } from "next/headers";
import { and, eq, gt } from "drizzle-orm";
import { db } from "@/infra/database";
import { sessionSchema } from "@/infra/database/schema/sessions";
import { logout } from "@/app/actions/auth";
import SearchBar from "./SearchBar";

async function getSession() {
  const token = (await cookies()).get("session_token")?.value;
  if (!token) return null;
  return db.query.sessionSchema.findFirst({
    where: and(eq(sessionSchema.sessionToken, token), gt(sessionSchema.expires, new Date())),
  });
}

export default async function Header() {
  const session = await getSession();

  return (
    <header className="navbar navbar-sm bg-base-200 border-b border-base-300 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto w-full px-6 flex items-center gap-4">
        <a href="/" className="flex flex-col items-center gap-0.5 shrink-0">
          <img src="/logo.svg" alt="Rugby na TV" className="h-8 w-auto" />
          <span className="text-sm font-semibold tracking-wide">Rugby na TV</span>
        </a>

        <div className="flex-1 flex justify-center">
          <SearchBar />
        </div>

        {session ? (
          <form action={logout} className="shrink-0">
            <button type="submit" className="btn btn-ghost btn-sm">
              Sair
            </button>
          </form>
        ) : (
          <a href="/?modal=login" className="btn btn-primary btn-sm shrink-0">
            Entrar
          </a>
        )}
      </div>
    </header>
  );
}
