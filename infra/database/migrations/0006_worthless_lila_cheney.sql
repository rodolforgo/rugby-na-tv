CREATE TABLE "sync_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"syncedDate" date NOT NULL,
	"gamesTotal" integer NOT NULL,
	"status" varchar(20) NOT NULL,
	"errorMessage" varchar(500),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "game_channels" ALTER COLUMN "gameId" SET DATA TYPE uuid;