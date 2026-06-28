import { cookies } from "next/headers";
import { and, eq, gt } from "drizzle-orm";
import { db } from "@/infra/database";
import { sessionSchema } from "@/infra/database/schema/sessions";
import { logout } from "@/app/shared/actions/auth";
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
    <header className="bg-white border-b border-base-300 sticky top-0 z-50">
      <div className="h-1 bg-primary w-full" />
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex items-center justify-between gap-4 flex-wrap py-5">
          <a href="/" className="flex flex-col shrink-0">
            <span className="font-black text-[clamp(18px,2.6vw,24px)] tracking-[-0.03em] leading-none uppercase">
              Rugby na <span className="text-primary">TV</span>
            </span>
            <span className="text-[10px] tracking-[0.14em] uppercase text-base-content/50 mt-1">Onde assistir no Brasil</span>
          </a>

          <div className="flex-1 hidden lg:flex justify-center">
            <SearchBar />
          </div>

          {session ? (
            <div className="flex items-center gap-1 shrink-0">
              <a
                href="/meus-jogos"
                className="text-[12px] tracking-[0.1em] uppercase font-bold text-base-content/60 hover:text-base-content transition-colors px-3 py-2"
              >
                Meus jogos
              </a>
              <form action={logout}>
                <button
                  type="submit"
                  className="text-[12px] tracking-[0.1em] uppercase font-bold text-base-content border-[1.5px] border-base-content rounded-full px-5 py-2 hover:bg-base-content hover:text-white transition-colors cursor-pointer"
                >
                  Sair
                </button>
              </form>
            </div>
          ) : (
            <a
              href="/?modal=login"
              className="text-[12px] tracking-[0.1em] uppercase font-bold text-base-content border-[1.5px] border-base-content rounded-full px-5 py-2 hover:bg-base-content hover:text-white transition-colors shrink-0"
            >
              Entrar
            </a>
          )}
        </div>

        <div className="lg:hidden pb-3">
          <SearchBar className="w-full" />
        </div>
      </div>
    </header>
  );
}
