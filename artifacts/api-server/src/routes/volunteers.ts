import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, volunteerProfilesTable, usersTable } from "@workspace/db";
import { schemas } from "@workspace/api-zod";
import { requireRole } from "../middlewares/auth";
import {
  getProfileWithUser,
  serializeVolunteerProfile,
} from "../lib/serializers";

const router: IRouter = Router();

router.get(
  "/volunteers/profile",
  requireRole("volunteer"),
  async (req, res): Promise<void> => {
    const viewer = req.currentUser!;
    const profile = await getProfileWithUser(viewer.id);
    if (!profile) {
      res.status(404).json({ error: "Profile not yet created" });
      return;
    }
    res.json(profile);
  },
);

router.put(
  "/volunteers/profile",
  requireRole("volunteer"),
  async (req, res): Promise<void> => {
    const parsed = schemas.UpdateVolunteerProfileBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }
    const viewer = req.currentUser!;
    const values = {
      userId: viewer.id,
      roleTitle: parsed.data.roleTitle,
      skills: parsed.data.skills,
      bio: parsed.data.bio,
      phone: parsed.data.phone,
      cityArea: parsed.data.cityArea,
      availability: parsed.data.availability,
      experienceYears: parsed.data.experienceYears,
    };

    const [existing] = await db
      .select()
      .from(volunteerProfilesTable)
      .where(eq(volunteerProfilesTable.userId, viewer.id));

    let profileRow;
    if (existing) {
      [profileRow] = await db
        .update(volunteerProfilesTable)
        .set({
          roleTitle: values.roleTitle,
          skills: values.skills,
          bio: values.bio,
          phone: values.phone,
          cityArea: values.cityArea,
          availability: values.availability,
          experienceYears: values.experienceYears,
        })
        .where(eq(volunteerProfilesTable.userId, viewer.id))
        .returning();
    } else {
      [profileRow] = await db
        .insert(volunteerProfilesTable)
        .values(values)
        .returning();
    }

    const serialized = await serializeVolunteerProfile(profileRow, {
      name: viewer.name,
      email: viewer.email,
    });
    res.json(serialized);
  },
);

router.get("/volunteers", requireRole(), async (_req, res): Promise<void> => {
  const rows = await db
    .select({ p: volunteerProfilesTable, u: usersTable })
    .from(volunteerProfilesTable)
    .innerJoin(usersTable, eq(usersTable.id, volunteerProfilesTable.userId));
  const out = await Promise.all(
    rows.map(({ p, u }) => serializeVolunteerProfile(p, u)),
  );
  res.json(out);
});

export default router;
