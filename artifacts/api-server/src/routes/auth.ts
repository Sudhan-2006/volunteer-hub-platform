import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable, volunteerProfilesTable } from "@workspace/db";
import { schemas } from "@workspace/api-zod";
import { hashPassword, verifyPassword, toRole } from "../lib/auth";
import { safeUserAsSession } from "../lib/serializers";

const router: IRouter = Router();

async function hasVolunteerProfile(userId: number): Promise<boolean> {
  const [row] = await db
    .select({ id: volunteerProfilesTable.id })
    .from(volunteerProfilesTable)
    .where(eq(volunteerProfilesTable.userId, userId));
  return !!row;
}

router.post("/auth/register", async (req, res): Promise<void> => {
  const parsed = schemas.RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { name, email, password, role } = parsed.data;
  if (role !== "user" && role !== "volunteer") {
    res.status(400).json({ error: "Invalid role" });
    return;
  }
  const normalizedEmail = email.trim().toLowerCase();
  const [existing] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, normalizedEmail));
  if (existing) {
    res.status(409).json({ error: "Email already registered" });
    return;
  }
  const passwordHash = await hashPassword(password);
  const [created] = await db
    .insert(usersTable)
    .values({ name, email: normalizedEmail, passwordHash, role })
    .returning();
  req.session.userId = created.id;
  res.json(safeUserAsSession(created, false));
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = schemas.LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const normalizedEmail = parsed.data.email.trim().toLowerCase();
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, normalizedEmail));
  if (!user) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }
  const ok = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!ok) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }
  req.session.userId = user.id;
  const hasProfile =
    toRole(user.role) === "volunteer"
      ? await hasVolunteerProfile(user.id)
      : false;
  res.json(safeUserAsSession(user, hasProfile));
});

router.post("/auth/logout", (req, res): void => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

router.get("/auth/me", async (req, res): Promise<void> => {
  if (!req.currentUser) {
    res.json({ user: null });
    return;
  }
  const hasProfile =
    toRole(req.currentUser.role) === "volunteer"
      ? await hasVolunteerProfile(req.currentUser.id)
      : false;
  res.json({ user: safeUserAsSession(req.currentUser, hasProfile) });
});

export default router;
