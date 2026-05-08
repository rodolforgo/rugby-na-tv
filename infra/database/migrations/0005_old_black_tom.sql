ALTER TABLE "game_channels" DROP CONSTRAINT "game_channels_gameId_games_id_fk";--> statement-breakpoint
DROP TABLE "game_channels";--> statement-breakpoint
DROP TABLE "games";--> statement-breakpoint
CREATE TABLE "games" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"apiId" integer,
	"date" timestamp with time zone NOT NULL,
	"timestamp" integer NOT NULL,
	"countryName" varchar(255) NOT NULL,
	"countryFlag" varchar(500) NOT NULL,
	"leagueName" varchar(255) NOT NULL,
	"leagueLogo" varchar(500) NOT NULL,
	"homeTeamName" varchar(255) NOT NULL,
	"homeTeamLogo" varchar(500) NOT NULL,
	"awayTeamName" varchar(255) NOT NULL,
	"awayTeamLogo" varchar(500) NOT NULL,
	"scoresHome" integer,
	"scoresAway" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "games_apiId_unique" UNIQUE("apiId")
);--> statement-breakpoint
CREATE TABLE "game_channels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gameId" uuid NOT NULL,
	"channelId" uuid NOT NULL,
	CONSTRAINT "game_channels_gameId_channelId_unique" UNIQUE("gameId","channelId")
);--> statement-breakpoint
ALTER TABLE "game_channels" ADD CONSTRAINT "game_channels_gameId_games_id_fk" FOREIGN KEY ("gameId") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_channels" ADD CONSTRAINT "game_channels_channelId_channels_id_fk" FOREIGN KEY ("channelId") REFERENCES "public"."channels"("id") ON DELETE cascade ON UPDATE no action;
