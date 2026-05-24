"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/infra/database";
import { sessionSchema } from "@/infra/database/schema/sessions";

export async function logout() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  if (token) {
    await db.delete(sessionSchema).where(eq(sessionSchema.sessionToken, token));
    cookieStore.delete("session_token");
  }

  redirect("/");
}
