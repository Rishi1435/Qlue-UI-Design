import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import { signToken, generateId } from "../lib/jwt.js";
import { requireAuth, type AuthRequest } from "../middlewares/auth.js";
import type { Request, Response } from "express";

const router = Router();

const RegisterSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// POST /api/auth/register
router.post("/register", async (req: Request, res: Response) => {
  try {
    const body = RegisterSchema.parse(req.body);

    const [existing] = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.email, body.email.toLowerCase()))
      .limit(1);

    if (existing) {
      res.status(409).json({ error: "Email already in use" });
      return;
    }

    const passwordHash = await bcrypt.hash(body.password, 10);
    const id = generateId();

    await db.insert(usersTable).values({
      id,
      name: body.name,
      email: body.email.toLowerCase(),
      passwordHash,
    });

    const token = signToken({ userId: id, email: body.email.toLowerCase() });

    res.status(201).json({
      token,
      user: { id, name: body.name, email: body.email.toLowerCase() },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "Validation failed", details: err.errors });
      return;
    }
    console.error("Register error:", err);
    res.status(500).json({ error: "Registration failed" });
  }
});

// POST /api/auth/login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const body = LoginSchema.parse(req.body);

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, body.email.toLowerCase()))
      .limit(1);

    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const valid = await bcrypt.compare(body.password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const token = signToken({ userId: user.id, email: user.email });

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "Validation failed", details: err.errors });
      return;
    }
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

// GET /api/auth/me
router.get("/me", requireAuth, async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const [user] = await db
      .select({ id: usersTable.id, name: usersTable.name, email: usersTable.email })
      .from(usersTable)
      .where(eq(usersTable.id, authReq.userId))
      .limit(1);

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json({ user });
  } catch (err) {
    console.error("Me error:", err);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// PATCH /api/auth/me
router.patch("/me", requireAuth, async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const body = z.object({ name: z.string().min(1).max(100) }).parse(req.body);

    await db
      .update(usersTable)
      .set({ name: body.name })
      .where(eq(usersTable.id, authReq.userId));

    res.json({ success: true, name: body.name });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "Validation failed" });
      return;
    }
    res.status(500).json({ error: "Update failed" });
  }
});

export default router;
