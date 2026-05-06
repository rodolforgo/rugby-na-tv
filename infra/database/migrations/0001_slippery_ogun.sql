CREATE TABLE "features" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" varchar(500),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "features_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "user_features" (
	"userId" uuid NOT NULL,
	"featureId" uuid NOT NULL,
	CONSTRAINT "user_features_userId_featureId_pk" PRIMARY KEY("userId","featureId")
);
--> statement-breakpoint
ALTER TABLE "user_features" ADD CONSTRAINT "user_features_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_features" ADD CONSTRAINT "user_features_featureId_features_id_fk" FOREIGN KEY ("featureId") REFERENCES "public"."features"("id") ON DELETE cascade ON UPDATE no action;