CREATE TABLE "lottery_draws" (
	"id" serial PRIMARY KEY NOT NULL,
	"lottery" varchar(20) NOT NULL,
	"draw_date" date NOT NULL,
	"draw_key" varchar(80) NOT NULL,
	"draw_name" varchar(160) NOT NULL,
	"draw_code" varchar(40),
	"draw_time" varchar(20),
	"kind" varchar(16) DEFAULT 'daily' NOT NULL,
	"first_prize" varchar(60),
	"first_amount" varchar(40),
	"tiers" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"image_key" varchar(200),
	"image_width" integer,
	"image_height" integer,
	"image_source_url" text,
	"source_url" text,
	"source" varchar(80),
	"notes" text,
	"status" varchar(12) DEFAULT 'published' NOT NULL,
	"is_complete" boolean DEFAULT false NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "scrape_logs" ALTER COLUMN "slot" SET DATA TYPE varchar(16);--> statement-breakpoint
CREATE UNIQUE INDEX "lottery_draws_unique_idx" ON "lottery_draws" USING btree ("lottery","draw_date","draw_key");--> statement-breakpoint
CREATE INDEX "lottery_draws_lottery_date_idx" ON "lottery_draws" USING btree ("lottery","draw_date");