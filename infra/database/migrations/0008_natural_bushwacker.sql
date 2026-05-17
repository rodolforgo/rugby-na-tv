CREATE TABLE "broadcast_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"syncedDate" date NOT NULL,
	"roninTotal" integer NOT NULL,
	"dbGamesTotal" integer NOT NULL,
	"matched" integer NOT NULL,
	"unmatched" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
