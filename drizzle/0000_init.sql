CREATE TABLE "media" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" varchar(255) NOT NULL,
	"content_type" varchar(80) NOT NULL,
	"size" integer DEFAULT 0 NOT NULL,
	"width" integer,
	"height" integer,
	"storage" varchar(10) DEFAULT 'db' NOT NULL,
	"blob_url" text,
	"data" "bytea",
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "media_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "pages" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(200) NOT NULL,
	"title" varchar(250) NOT NULL,
	"content" text DEFAULT '' NOT NULL,
	"meta_title" varchar(250),
	"meta_description" text,
	"status" varchar(12) DEFAULT 'published' NOT NULL,
	"show_in_footer" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pages_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(200) NOT NULL,
	"title" varchar(250) NOT NULL,
	"excerpt" text,
	"content" text DEFAULT '' NOT NULL,
	"cover_image" text,
	"meta_title" varchar(250),
	"meta_description" text,
	"status" varchar(12) DEFAULT 'draft' NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "results" (
	"id" serial PRIMARY KEY NOT NULL,
	"draw_date" date NOT NULL,
	"slot" varchar(8) NOT NULL,
	"draw_name" varchar(120),
	"draw_no" varchar(20),
	"state" varchar(40),
	"first_prize" varchar(24),
	"cons_prize" varchar(24),
	"second_prize" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"third_prize" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"fourth_prize" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"fifth_prize" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"image_key" varchar(200),
	"image_width" integer,
	"image_height" integer,
	"image_source_url" text,
	"pdf_source_url" text,
	"source" varchar(80),
	"notes" text,
	"status" varchar(12) DEFAULT 'published' NOT NULL,
	"is_complete" boolean DEFAULT false NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scrape_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"run_at" timestamp with time zone DEFAULT now() NOT NULL,
	"draw_date" date,
	"slot" varchar(8),
	"status" varchar(16) NOT NULL,
	"source" varchar(120),
	"message" text,
	"duration_ms" integer
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"key" varchar(80) PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "results_date_slot_idx" ON "results" USING btree ("draw_date","slot");--> statement-breakpoint
CREATE INDEX "results_date_idx" ON "results" USING btree ("draw_date");--> statement-breakpoint
CREATE INDEX "scrape_logs_run_idx" ON "scrape_logs" USING btree ("run_at");