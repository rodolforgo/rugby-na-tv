CREATE TABLE "game_channels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gameId" integer NOT NULL,
	"channelId" uuid NOT NULL,
	CONSTRAINT "game_channels_gameId_channelId_unique" UNIQUE("gameId","channelId")
);
--> statement-breakpoint
ALTER TABLE "game_channels" ADD CONSTRAINT "game_channels_gameId_games_id_fk" FOREIGN KEY ("gameId") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_channels" ADD CONSTRAINT "game_channels_channelId_channels_id_fk" FOREIGN KEY ("channelId") REFERENCES "public"."channels"("id") ON DELETE cascade ON UPDATE no action;