CREATE TABLE "user_game_channel_votes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"gameId" uuid NOT NULL,
	"channelId" uuid NOT NULL,
	"voteType" varchar(10) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_game_channel_votes_userId_gameId_channelId_unique" UNIQUE("userId","gameId","channelId")
);
--> statement-breakpoint
ALTER TABLE "user_game_channel_votes" ADD CONSTRAINT "user_game_channel_votes_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_game_channel_votes" ADD CONSTRAINT "user_game_channel_votes_gameId_games_id_fk" FOREIGN KEY ("gameId") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_game_channel_votes" ADD CONSTRAINT "user_game_channel_votes_channelId_channels_id_fk" FOREIGN KEY ("channelId") REFERENCES "public"."channels"("id") ON DELETE cascade ON UPDATE no action;