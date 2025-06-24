CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"street" text,
	"city" text,
	"apartment" text,
	"extra_info" text,
	"province" text DEFAULT 'Kinshasa' NOT NULL,
	"country" text DEFAULT 'Democratic Republic of Congo' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "user_email" text NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "items" jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "total_amount" numeric(10, 2) NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "order_date" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "in_progress" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "delivery_address_street" text NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "delivery_address_city" text NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "delivery_address_apartment" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "delivery_address_extra_info" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "delivery_address_province" text DEFAULT 'Kinshasa' NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "country" text DEFAULT 'Democratic Republic of Congo' NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "email_idx" ON "users" USING btree ("email");--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "user_id";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "description_id";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "title";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "image";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "price";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "created_at";