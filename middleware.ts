import { type NextRequest, NextResponse } from "next/server";
import { UnauthorizedError } from "@/infra/errors";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("session_token")?.value;

  if (!token) {
    const error = new UnauthorizedError();
    return NextResponse.json(error.toJSON(), { status: error.statusCode });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/v1/games/:id/votes"],
};
