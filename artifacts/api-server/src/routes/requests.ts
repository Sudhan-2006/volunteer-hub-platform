import { Router, type IRouter } from "express";
import { and, desc, eq, ne, sql } from "drizzle-orm";
import {
  db,
  requestsTable,
  usersTable,
  applicationsTable,
} from "@workspace/db";
import { schemas } from "@workspace/api-zod";
import { requireRole } from "../middlewares/auth";
import { toRole } from "../lib/auth";
import {
  serializeRequest,
  getProfileWithUser,
  toApplicationStatus,
} from "../lib/serializers";

const router: IRouter = Router();

router.get("/requests", requireRole(), async (req, res): Promise<void> => {
  const viewer = req.currentUser!;
  const viewerRole = toRole(viewer.role);
  const scope = (req.query["scope"] as string | undefined) ?? "mine";

  const whereClauses = [];
  if (viewerRole === "user") {
    whereClauses.push(eq(requestsTable.userId, viewer.id));
  } else if (viewerRole === "volunteer") {
    if (scope === "mine") {
      whereClauses.push(eq(requestsTable.userId, viewer.id));
    } else {
      whereClauses.push(ne(requestsTable.userId, viewer.id));
      whereClauses.push(eq(requestsTable.status, "open"));
    }
  }

  const rows = await db
    .select({
      r: requestsTable,
      ownerName: usersTable.name,
      appsCount: sql<number>`(select count(*)::int from ${applicationsTable} where ${applicationsTable.requestId} = ${requestsTable.id})`,
    })
    .from(requestsTable)
    .innerJoin(usersTable, eq(usersTable.id, requestsTable.userId))
    .where(whereClauses.length ? and(...whereClauses) : undefined)
    .orderBy(desc(requestsTable.createdAt));

  const data = rows.map(({ r, ownerName, appsCount }) =>
    serializeRequest(r, ownerName, Number(appsCount ?? 0), {
      viewerRole,
      viewerId: viewer.id,
    }),
  );
  res.json(data);
});

router.post(
  "/requests",
  requireRole("user"),
  async (req, res): Promise<void> => {
    const parsed = schemas.CreateRequestBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }
    const viewer = req.currentUser!;
    const [created] = await db
      .insert(requestsTable)
      .values({
        userId: viewer.id,
        title: parsed.data.title,
        purpose: parsed.data.purpose,
        category: parsed.data.category,
        description: parsed.data.description,
        urgency: parsed.data.urgency,
        cityArea: parsed.data.cityArea,
        location: parsed.data.location,
        contactPhone: parsed.data.contactPhone,
      })
      .returning();
    res.json(
      serializeRequest(created, viewer.name, 0, {
        viewerRole: "user",
        viewerId: viewer.id,
      }),
    );
  },
);

router.get(
  "/requests/:id",
  requireRole(),
  async (req, res): Promise<void> => {
    const idRaw = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;
    const id = parseInt(String(idRaw), 10);
    if (!Number.isFinite(id)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    const viewer = req.currentUser!;
    const viewerRole = toRole(viewer.role);

    const [row] = await db
      .select({ r: requestsTable, ownerName: usersTable.name })
      .from(requestsTable)
      .innerJoin(usersTable, eq(usersTable.id, requestsTable.userId))
      .where(eq(requestsTable.id, id));
    if (!row) {
      res.status(404).json({ error: "Not found" });
      return;
    }

    const apps = await db
      .select()
      .from(applicationsTable)
      .where(eq(applicationsTable.requestId, id))
      .orderBy(desc(applicationsTable.createdAt));

    const applications = [];
    for (const app of apps) {
      const profile = await getProfileWithUser(app.volunteerId);
      if (!profile) continue;
      applications.push({
        id: app.id,
        requestId: app.requestId,
        message: app.message,
        status: toApplicationStatus(app.status),
        createdAt: app.createdAt.toISOString(),
        volunteer: profile,
      });
    }

    const base = serializeRequest(
      row.r,
      row.ownerName,
      apps.length,
      { viewerRole, viewerId: viewer.id },
    );
    res.json({ ...base, applications });
  },
);

router.get(
  "/requests/:id/applications",
  requireRole(),
  async (req, res): Promise<void> => {
    const idRaw = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;
    const id = parseInt(String(idRaw), 10);
    if (!Number.isFinite(id)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }

    const apps = await db
      .select()
      .from(applicationsTable)
      .where(eq(applicationsTable.requestId, id))
      .orderBy(desc(applicationsTable.createdAt));

    const out = [];
    for (const app of apps) {
      const profile = await getProfileWithUser(app.volunteerId);
      if (!profile) continue;
      out.push({
        id: app.id,
        requestId: app.requestId,
        message: app.message,
        status: toApplicationStatus(app.status),
        createdAt: app.createdAt.toISOString(),
        volunteer: profile,
      });
    }
    res.json(out);
  },
);

export default router;
