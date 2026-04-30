import { Router, type IRouter } from "express";
import { and, desc, eq } from "drizzle-orm";
import {
  db,
  applicationsTable,
  requestsTable,
  usersTable,
  volunteerProfilesTable,
} from "@workspace/db";
import { schemas } from "@workspace/api-zod";
import { requireRole } from "../middlewares/auth";
import { toRole } from "../lib/auth";
import {
  serializeApplication,
  serializeRequest,
  toApplicationStatus,
  getProfileWithUser,
  getRequestApplicationsCount,
} from "../lib/serializers";

const router: IRouter = Router();

router.get(
  "/applications",
  requireRole(),
  async (req, res): Promise<void> => {
    const viewer = req.currentUser!;
    const viewerRole = toRole(viewer.role);

    const whereClauses = [];
    if (viewerRole === "volunteer") {
      whereClauses.push(eq(applicationsTable.volunteerId, viewer.id));
    } else if (viewerRole === "user") {
      whereClauses.push(eq(requestsTable.userId, viewer.id));
    }

    const rows = await db
      .select({
        a: applicationsTable,
        r: requestsTable,
        ownerName: usersTable.name,
      })
      .from(applicationsTable)
      .innerJoin(requestsTable, eq(requestsTable.id, applicationsTable.requestId))
      .innerJoin(usersTable, eq(usersTable.id, requestsTable.userId))
      .where(whereClauses.length ? and(...whereClauses) : undefined)
      .orderBy(desc(applicationsTable.createdAt));

    const out = await Promise.all(
      rows.map(async ({ a, r, ownerName }) => {
        const appsCount = await getRequestApplicationsCount(r.id);
        return {
          id: a.id,
          message: a.message,
          status: toApplicationStatus(a.status),
          createdAt: a.createdAt.toISOString(),
          request: serializeRequest(r, ownerName, appsCount, {
            viewerRole,
            viewerId: viewer.id,
          }),
        };
      }),
    );
    res.json(out);
  },
);

router.post(
  "/applications",
  requireRole("volunteer"),
  async (req, res): Promise<void> => {
    const parsed = schemas.ApplyToRequestBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }
    const viewer = req.currentUser!;

    const [profile] = await db
      .select()
      .from(volunteerProfilesTable)
      .where(eq(volunteerProfilesTable.userId, viewer.id));
    if (!profile) {
      res
        .status(400)
        .json({ error: "Please complete your volunteer profile first." });
      return;
    }

    const [request] = await db
      .select()
      .from(requestsTable)
      .where(eq(requestsTable.id, parsed.data.requestId));
    if (!request) {
      res.status(404).json({ error: "Request not found" });
      return;
    }
    if (request.userId === viewer.id) {
      res.status(400).json({ error: "Cannot apply to your own request" });
      return;
    }

    const [existing] = await db
      .select()
      .from(applicationsTable)
      .where(
        and(
          eq(applicationsTable.requestId, parsed.data.requestId),
          eq(applicationsTable.volunteerId, viewer.id),
        ),
      );
    if (existing) {
      res.status(409).json({ error: "Already applied" });
      return;
    }

    const [created] = await db
      .insert(applicationsTable)
      .values({
        requestId: parsed.data.requestId,
        volunteerId: viewer.id,
        message: parsed.data.message,
      })
      .returning();

    res.json(serializeApplication(created));
  },
);

router.post(
  "/applications/:id/decision",
  requireRole("user"),
  async (req, res): Promise<void> => {
    const idRaw = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;
    const id = parseInt(String(idRaw), 10);
    if (!Number.isFinite(id)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    const parsed = schemas.DecideApplicationBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }
    const viewer = req.currentUser!;

    const [row] = await db
      .select({ app: applicationsTable, request: requestsTable })
      .from(applicationsTable)
      .innerJoin(
        requestsTable,
        eq(requestsTable.id, applicationsTable.requestId),
      )
      .where(eq(applicationsTable.id, id));
    if (!row) {
      res.status(404).json({ error: "Application not found" });
      return;
    }
    if (row.request.userId !== viewer.id) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const decision = parsed.data.decision;
    const [updated] = await db
      .update(applicationsTable)
      .set({ status: decision, decidedAt: new Date() })
      .where(eq(applicationsTable.id, id))
      .returning();

    if (decision === "approved") {
      await db
        .update(requestsTable)
        .set({
          approvedVolunteerId: row.app.volunteerId,
          status: "in_progress",
        })
        .where(eq(requestsTable.id, row.request.id));
    }

    res.json(serializeApplication(updated));
  },
);

// Helper unused export so getProfileWithUser doesn't get tree-shaken from typecheck
export { getProfileWithUser };

export default router;
