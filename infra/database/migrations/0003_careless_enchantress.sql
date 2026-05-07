CREATE TABLE "channels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"logo" varchar(500),
	"url" varchar(500),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
