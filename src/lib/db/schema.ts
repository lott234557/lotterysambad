import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  boolean,
  jsonb,
  timestamp,
  date,
  uniqueIndex,
  index,
  customType,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

const bytea = customType<{ data: Buffer; driverData: Buffer }>({
  dataType() {
    return "bytea";
  },
});

/** One row per draw (date + slot). */
export const results = pgTable(
  "results",
  {
    id: serial("id").primaryKey(),
    drawDate: date("draw_date", { mode: "string" }).notNull(),
    slot: varchar("slot", { length: 8 }).notNull(), // '1pm' | '6pm' | '8pm'
    drawName: varchar("draw_name", { length: 120 }),
    drawNo: varchar("draw_no", { length: 20 }),
    state: varchar("state", { length: 40 }),
    firstPrize: varchar("first_prize", { length: 24 }),
    consPrize: varchar("cons_prize", { length: 24 }),
    secondPrize: jsonb("second_prize").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
    thirdPrize: jsonb("third_prize").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
    fourthPrize: jsonb("fourth_prize").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
    fifthPrize: jsonb("fifth_prize").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
    imageKey: varchar("image_key", { length: 200 }),
    imageWidth: integer("image_width"),
    imageHeight: integer("image_height"),
    imageSourceUrl: text("image_source_url"),
    pdfSourceUrl: text("pdf_source_url"),
    source: varchar("source", { length: 80 }),
    notes: text("notes"),
    status: varchar("status", { length: 12 }).notNull().default("published"),
    isComplete: boolean("is_complete").notNull().default(false),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("results_date_slot_idx").on(t.drawDate, t.slot),
    index("results_date_idx").on(t.drawDate),
  ],
);

/** Uploaded / scraped media. Stored in Postgres (bytea) or Vercel Blob. */
export const media = pgTable("media", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 255 }).notNull().unique(),
  contentType: varchar("content_type", { length: 80 }).notNull(),
  size: integer("size").notNull().default(0),
  width: integer("width"),
  height: integer("height"),
  storage: varchar("storage", { length: 10 }).notNull().default("db"), // 'db' | 'blob'
  blobUrl: text("blob_url"),
  data: bytea("data"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Blog articles / guides. */
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 200 }).notNull().unique(),
  title: varchar("title", { length: 250 }).notNull(),
  excerpt: text("excerpt"),
  content: text("content").notNull().default(""),
  coverImage: text("cover_image"),
  metaTitle: varchar("meta_title", { length: 250 }),
  metaDescription: text("meta_description"),
  status: varchar("status", { length: 12 }).notNull().default("draft"),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Static / legal pages (privacy policy, disclaimer, dmca ...). */
export const pages = pgTable("pages", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 200 }).notNull().unique(),
  title: varchar("title", { length: 250 }).notNull(),
  content: text("content").notNull().default(""),
  metaTitle: varchar("meta_title", { length: 250 }),
  metaDescription: text("meta_description"),
  status: varchar("status", { length: 12 }).notNull().default("published"),
  showInFooter: boolean("show_in_footer").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Key/value site settings (JSON). */
export const settings = pgTable("settings", {
  key: varchar("key", { length: 80 }).primaryKey(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Scraper run log. */
export const scrapeLogs = pgTable(
  "scrape_logs",
  {
    id: serial("id").primaryKey(),
    runAt: timestamp("run_at", { withTimezone: true }).notNull().defaultNow(),
    drawDate: date("draw_date", { mode: "string" }),
    slot: varchar("slot", { length: 16 }), // '1pm' | '6pm' | '8pm' | other lottery id ('kerala', 'punjab', …)
    status: varchar("status", { length: 16 }).notNull(), // success | partial | waiting | error | skipped
    source: varchar("source", { length: 120 }),
    message: text("message"),
    durationMs: integer("duration_ms"),
  },
  (t) => [index("scrape_logs_run_idx").on(t.runAt)],
);

/** One prize tier of an "other" lottery draw (Kerala, Punjab, Maharashtra, West Bengal). */
export type DrawTier = {
  label: string; // "1st Prize", "Consolation Prize", …
  amount?: string; // "₹1 Crore"
  numbers: string[]; // "RA 494226 (ATTINGAL)", "0024", …
  expected?: number; // how many numbers the source says are drawn (for completeness checks)
};

/** Results of other state lotteries – several draws per day possible (drawKey distinguishes them). */
export const lotteryDraws = pgTable(
  "lottery_draws",
  {
    id: serial("id").primaryKey(),
    lottery: varchar("lottery", { length: 20 }).notNull(), // kerala | punjab | maharashtra | westbengal
    drawDate: date("draw_date", { mode: "string" }).notNull(),
    drawKey: varchar("draw_key", { length: 80 }).notNull(), // slug, e.g. "sk-71", "vaibhavlaxmi", "dear-50-jackal"
    drawName: varchar("draw_name", { length: 160 }).notNull(),
    drawCode: varchar("draw_code", { length: 40 }),
    drawTime: varchar("draw_time", { length: 20 }),
    kind: varchar("kind", { length: 16 }).notNull().default("daily"), // daily | weekly | monthly | bumper
    firstPrize: varchar("first_prize", { length: 60 }),
    firstAmount: varchar("first_amount", { length: 40 }),
    tiers: jsonb("tiers").$type<DrawTier[]>().notNull().default(sql`'[]'::jsonb`),
    imageKey: varchar("image_key", { length: 200 }),
    imageWidth: integer("image_width"),
    imageHeight: integer("image_height"),
    imageSourceUrl: text("image_source_url"),
    sourceUrl: text("source_url"),
    source: varchar("source", { length: 80 }), // host, or "manual" (locked: never overwritten by the scraper)
    notes: text("notes"),
    status: varchar("status", { length: 12 }).notNull().default("published"),
    isComplete: boolean("is_complete").notNull().default(false),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("lottery_draws_unique_idx").on(t.lottery, t.drawDate, t.drawKey),
    index("lottery_draws_lottery_date_idx").on(t.lottery, t.drawDate),
  ],
);

export type Result = typeof results.$inferSelect;
export type LotteryDraw = typeof lotteryDraws.$inferSelect;
export type NewResult = typeof results.$inferInsert;
export type Post = typeof posts.$inferSelect;
export type Page = typeof pages.$inferSelect;
export type ScrapeLog = typeof scrapeLogs.$inferSelect;
