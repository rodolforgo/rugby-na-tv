import { db } from "@/infra/database";
import { usersSchema } from "@/infra/database/schema/users";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import { UnauthorizedError } from "@/infra/errors";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db),
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await db.query.usersSchema.findFirst({
          where: eq(usersSchema.email, credentials.email),
        });

        if (!user) {
          return null;
        }

        const passwordMatch = await bcrypt.compare(credentials.password, user.password);

        if (!passwordMatch) {
          return null;
        }

        return user;
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
});

async function verifyPassword(plain: string, hashed: string) {
  const passwordMatch = await bcrypt.compare(plain, hashed);

  if (!passwordMatch) {
    throw new UnauthorizedError();
  }
}

const authorization = { handlers, auth, signIn, signOut, verifyPassword };

export default authorization;
