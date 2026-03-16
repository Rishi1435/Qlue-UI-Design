import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "qlue-dev-secret-change-in-production";
const JWT_EXPIRES_IN = "7d";

export type JwtPayload = {
  userId: string;
  email: string;
};

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}
