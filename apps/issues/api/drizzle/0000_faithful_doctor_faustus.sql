CREATE TABLE IF NOT EXISTS "issues" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"userId" integer NOT NULL,
	"userName" text NOT NULL
);
