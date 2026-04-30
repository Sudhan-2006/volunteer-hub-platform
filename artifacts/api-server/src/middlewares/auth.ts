import type { Request, Response, NextFunction, RequestHandler } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable, type User } from "@workspace/db";
import { toRole } from "../lib/auth";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      currentUser?: User;
    }
  }
}

export const loadUser: RequestHandler = async (req, _res, next) => {
  const userId = req.session.userId;
  if (!userId) return next();
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId));
  if (user) {
    req.currentUser = user;
  }
  next();
};

export function requireRole(
  ...roles: Array<"user" | "volunteer" | "admin">
): (req: Request, res: Response, next: NextFunction) => void {
  return (req, res, next) => {
    if (!req.currentUser) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }
    if (roles.length > 0 && !roles.includes(toRole(req.currentUser.role))) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    next();
  };
}
