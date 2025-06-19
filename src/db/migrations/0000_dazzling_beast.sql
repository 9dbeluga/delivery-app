CREATE TABLE "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"description_id" integer NOT NULL,
	"title" text NOT NULL,
	"image" text,
	"price" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
