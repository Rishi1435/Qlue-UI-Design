import { Router, type Request, type Response } from "express";
import { eq, and, desc } from "drizzle-orm";
import { z } from "zod";
import { db, interviewSessionsTable } from "@workspace/db";
import { requireAuth, type AuthRequest } from "../middlewares/auth.js";
import { generateId } from "../lib/jwt.js";

const router = Router();
router.use(requireAuth);

const CreateSessionSchema = z.object({
  module: z.enum(["resume", "hr", "website"]),
  topic: z.string().min(1).max(255),
  date: z.string(),
  duration: z.number().int().min(0),
  score: z.number().int().min(0).max(100),
  totalQuestions: z.number().int().min(1),
  answeredQuestions: z.number().int().min(0),
});

// GET /api/sessions
router.get("/", async (req: Request, res: Response) => {
  try {
    const { userId } = req as AuthRequest;
    const sessions = await db
      .select()
      .from(interviewSessionsTable)
      .where(eq(interviewSessionsTable.userId, userId))
      .orderBy(desc(interviewSessionsTable.createdAt));

    res.json({ sessions });
  } catch (err) {
    console.error("List sessions error:", err);
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
});

// POST /api/sessions
router.post("/", async (req: Request, res: Response) => {
  try {
    const { userId } = req as AuthRequest;
    const body = CreateSessionSchema.parse(req.body);

    const id = generateId();

    await db.insert(interviewSessionsTable).values({
      id,
      userId,
      ...body,
    });

    const [session] = await db
      .select()
      .from(interviewSessionsTable)
      .where(eq(interviewSessionsTable.id, id))
      .limit(1);

    res.status(201).json({ session });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "Validation failed", details: err.errors });
      return;
    }
    console.error("Create session error:", err);
    res.status(500).json({ error: "Failed to create session" });
  }
});

// DELETE /api/sessions — clear all for user
router.delete("/", async (req: Request, res: Response) => {
  try {
    const { userId } = req as AuthRequest;
    await db
      .delete(interviewSessionsTable)
      .where(eq(interviewSessionsTable.userId, userId));

    res.json({ success: true });
  } catch (err) {
    console.error("Clear sessions error:", err);
    res.status(500).json({ error: "Failed to clear sessions" });
  }
});

export default router;
