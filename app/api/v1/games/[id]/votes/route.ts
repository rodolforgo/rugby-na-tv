import { NextResponse } from "next/server";
import { methodNotAllowedResponse } from "@/infra/errors";
import controller from "@/infra/controller";
import validator from "@/models/validator";
import users from "@/models/users";
import votes from "@/models/votes";
import { castVoteSchema } from "@/domain/games/games.schema";

type RouteContext = { params: Promise<{ id: string }> };

export const POST = controller.errorHandler(async (req, context) => {
  const userId = await users.requireFeature("vote:games");
  const { id: gameId } = await (context as RouteContext).params;
  const body = await req.json();
  const { channelId, voteType } = validator.validateBody(castVoteSchema, body);

  await votes.cast(userId, gameId, channelId, voteType);

  const [voteCounts, userVotes] = await Promise.all([votes.getForGame(gameId), votes.getUserVotesForGame(userId, gameId)]);

  return NextResponse.json({ votes: voteCounts, userVotes });
});

export const DELETE = controller.errorHandler(async (req, context) => {
  const userId = await users.requireFeature("vote:games");
  const { id: gameId } = await (context as RouteContext).params;
  const channelId = new URL(req.url).searchParams.get("channelId");

  await votes.remove(userId, gameId, channelId ?? "");

  const [voteCounts, userVotes] = await Promise.all([votes.getForGame(gameId), votes.getUserVotesForGame(userId, gameId)]);

  return NextResponse.json({ votes: voteCounts, userVotes });
});

export const GET = methodNotAllowedResponse;
export const PUT = methodNotAllowedResponse;
export const PATCH = methodNotAllowedResponse;
