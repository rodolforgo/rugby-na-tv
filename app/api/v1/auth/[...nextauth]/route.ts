import NextAuth from "next-auth";
import authorization from "@/models/authorization";

const handler = NextAuth(authorization.authOptions);

export { handler as GET, handler as POST };
