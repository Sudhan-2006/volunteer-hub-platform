import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db, usersTable, type User } from "@workspace/db";
import { logger } from "./logger";

const ADMIN_EMAIL = "admin@volunteerai.app";
const ADMIN_PASSWORD = "admin123";
const ADMIN_NAME = "Platform Admin";

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(
  plain: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export async function ensureAdminSeed(): Promise<void> {
  const [existing] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, ADMIN_EMAIL));
  if (existing) return;

  const passwordHash = await hashPassword(ADMIN_PASSWORD);
  await db.insert(usersTable).values({
    name: ADMIN_NAME,
    email: ADMIN_EMAIL,
    passwordHash,
    role: "admin",
  });
  logger.info({ email: ADMIN_EMAIL }, "Seeded admin account");
}

export function toRole(value: string): "user" | "volunteer" | "admin" {
  if (value === "user" || value === "volunteer" || value === "admin")
    return value;
  return "user";
}

export type SafeUser = {
  id: number;
  name: string;
  email: string;
  role: "user" | "volunteer" | "admin";
};

export function toSafeUser(user: User): SafeUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: toRole(user.role),
  };
}
