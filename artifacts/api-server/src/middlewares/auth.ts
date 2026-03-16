import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../lib/jwt.js";

export type AuthRequest = Request & { userId: string; userEmail: string };

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const token = authHeader.slice(7);
    const payload = verifyToken(token);
    (req as AuthRequest).userId = payload.userId;
    (req as AuthRequest).userEmail = payload.email;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}
