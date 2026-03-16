import { jsonb, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

import { usersTable } from "./users";

export const resumeStatusEnum = pgEnum("resume_status", [
  "pending",
  "parsing",
  "parsed",
  "failed",
]);

export const resumeFormatEnum = pgEnum("resume_format", ["pdf", "docx"]);

export const resumesTable = pgTable("resumes", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  filename: text("filename").notNull(),
  fileSize: text("file_size").notNull(),
  format: resumeFormatEnum("format").notNull(),
  status: resumeStatusEnum("status").notNull().default("pending"),
  skills: jsonb("skills").$type<string[]>().notNull().default([]),
  experience: jsonb("experience")
    .$type<
      { role: string; company: string; years: string; description?: string }[]
    >()
    .notNull()
    .default([]),
  education: jsonb("education")
    .$type<{ degree: string; institution: string; year: string }[]>()
    .notNull()
    .default([]),
  summary: text("summary"),
  uploadDate: text("upload_date").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const insertResumeSchema = createInsertSchema(resumesTable).omit({
  createdAt: true,
});

export type InsertResume = z.infer<typeof insertResumeSchema>;
export type Resume = typeof resumesTable.$inferSelect;
