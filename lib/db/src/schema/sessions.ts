import {
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

import { usersTable } from "./users";

export const interviewModuleEnum = pgEnum("interview_module", [
  "resume",
  "hr",
  "website",
]);

export const interviewSessionsTable = pgTable("interview_sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  module: interviewModuleEnum("module").notNull(),
  topic: text("topic").notNull(),
  date: text("date").notNull(),
  duration: integer("duration").notNull(),
  score: integer("score").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  answeredQuestions: integer("answered_questions").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const insertSessionSchema = createInsertSchema(
  interviewSessionsTable
).omit({ createdAt: true });

export type InsertSession = z.infer<typeof insertSessionSchema>;
export type InterviewSession = typeof interviewSessionsTable.$inferSelect;
