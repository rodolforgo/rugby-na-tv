CREATE TABLE "games" (
	"id" integer PRIMARY KEY NOT NULL,
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
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
