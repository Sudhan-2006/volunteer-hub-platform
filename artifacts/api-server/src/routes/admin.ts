import { Router, type IRouter } from "express";
import { desc, eq, ne, sql } from "drizzle-orm";
import {
  db,
  usersTable,
  volunteerProfilesTable,
  requestsTable,
  applicationsTable,
} from "@workspace/db";
import { requireRole } from "../middlewares/auth";
import { toRole } from "../lib/auth";
import {
  serializeRequest,
  serializeVolunteerProfile,
  toApplicationStatus,
  getRequestApplicationsCount,
} from "../lib/serializers";

const router: IRouter = Router();

router.get(
  "/admin/users",
  requireRole("admin"),
  async (_req, res): Promise<void> => {
    const users = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.role, "user"))
      .orderBy(desc(usersTable.createdAt));

    const out = await Promise.all(
      users.map(async (u) => {
        const [{ total }] = await db
          .select({ total: sql<number>`count(*)::int` })
          .from(requestsTable)
          .where(eq(requestsTable.userId, u.id));
        const [{ open }] = await db
          .select({ open: sql<number>`count(*)::int` })
          .from(requestsTable)
          .where(
            sql`${requestsTable.userId} = ${u.id} and ${requestsTable.status} = 'open'`,
          );
        const [{ completed }] = await db
          .select({ completed: sql<number>`count(*)::int` })
          .from(requestsTable)
          .where(
            sql`${requestsTable.userId} = ${u.id} and ${requestsTable.status} = 'completed'`,
          );
        return {
          id: u.id,
          name: u.name,
          email: u.email,
          createdAt: u.createdAt.toISOString(),
          totalRequests: Number(total ?? 0),
          openRequests: Number(open ?? 0),
          completedRequests: Number(completed ?? 0),
        };
      }),
    );
    res.json(out);
  },
);

router.get(
  "/admin/volunteers",
  requireRole("admin"),
  async (_req, res): Promise<void> => {
    const rows = await db
      .select({ u: usersTable, p: volunteerProfilesTable })
      .from(usersTable)
      .leftJoin(
        volunteerProfilesTable,
        eq(volunteerProfilesTable.userId, usersTable.id),
      )
      .where(eq(usersTable.role, "volunteer"))
      .orderBy(desc(usersTable.createdAt));

    const out = await Promise.all(
      rows.map(async ({ u, p }) => {
        const apps = await db
          .select({
            status: applicationsTable.status,
            count: sql<number>`count(*)::int`,
          })
          .from(applicationsTable)
          .where(eq(applicationsTable.volunteerId, u.id))
          .groupBy(applicationsTable.status);
        const counts = {
          total: 0,
          approved: 0,
          rejected: 0,
          pending: 0,
        };
        for (const a of apps) {
          const c = Number(a.count ?? 0);
          counts.total += c;
          if (a.status === "approved") counts.approved += c;
          if (a.status === "rejected") counts.rejected += c;
          if (a.status === "pending") counts.pending += c;
        }
        return {
          id: p?.id ?? u.id,
          userId: u.id,
          name: u.name,
          email: u.email,
          roleTitle: p?.roleTitle ?? "Not set",
          cityArea: p?.cityArea ?? "Not set",
          totalApplications: counts.total,
          approved: counts.approved,
          rejected: counts.rejected,
          pending: counts.pending,
        };
      }),
    );
    res.json(out);
  },
);

router.get(
  "/admin/users/:id",
  requireRole("admin"),
  async (req, res): Promise<void> => {
    const idRaw = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;
    const id = parseInt(String(idRaw), 10);
    if (!Number.isFinite(id)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    const [u] = await db.select().from(usersTable).where(eq(usersTable.id, id));
    if (!u) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    const reqs = await db
      .select()
      .from(requestsTable)
      .where(eq(requestsTable.userId, id))
      .orderBy(desc(requestsTable.createdAt));

    const requests = await Promise.all(
      reqs.map(async (r) => {
        const c = await getRequestApplicationsCount(r.id);
        return serializeRequest(r, u.name, c, {
          viewerRole: "admin",
          viewerId: 0,
        });
      }),
    );

    const total = reqs.length;
    const open = reqs.filter((r) => r.status === "open").length;
    const completed = reqs.filter((r) => r.status === "completed").length;

    res.json({
      user: {
        id: u.id,
        name: u.name,
        email: u.email,
        createdAt: u.createdAt.toISOString(),
        totalRequests: total,
        openRequests: open,
        completedRequests: completed,
      },
      requests,
    });
  },
);

router.get(
  "/admin/volunteers/:id",
  requireRole("admin"),
  async (req, res): Promise<void> => {
    const idRaw = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;
    const id = parseInt(String(idRaw), 10);
    if (!Number.isFinite(id)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    const [u] = await db.select().from(usersTable).where(eq(usersTable.id, id));
    if (!u || toRole(u.role) !== "volunteer") {
      res.status(404).json({ error: "Not found" });
      return;
    }
    const [profileRow] = await db
      .select()
      .from(volunteerProfilesTable)
      .where(eq(volunteerProfilesTable.userId, id));

    const profile =
      profileRow != null
        ? await serializeVolunteerProfile(profileRow, {
            name: u.name,
            email: u.email,
          })
        : {
            id: 0,
            userId: u.id,
            name: u.name,
            email: u.email,
            roleTitle: "Not set",
            skills: [],
            bio: "",
            phone: "",
            cityArea: "Not set",
            availability: "",
            experienceYears: 0,
            rating: 0,
            completedHelps: 0,
          };

    const apps = await db
      .select({ a: applicationsTable, r: requestsTable, ownerName: usersTable.name })
      .from(applicationsTable)
      .innerJoin(requestsTable, eq(requestsTable.id, applicationsTable.requestId))
      .innerJoin(usersTable, eq(usersTable.id, requestsTable.userId))
      .where(eq(applicationsTable.volunteerId, id))
      .orderBy(desc(applicationsTable.createdAt));

    const applications = await Promise.all(
      apps.map(async ({ a, r, ownerName }) => {
        const c = await getRequestApplicationsCount(r.id);
        return {
          id: a.id,
          message: a.message,
          status: toApplicationStatus(a.status),
          createdAt: a.createdAt.toISOString(),
          request: serializeRequest(r, ownerName, c, {
            viewerRole: "admin",
            viewerId: 0,
          }),
        };
      }),
    );

    const counts = {
      total: apps.length,
      approved: apps.filter((x) => x.a.status === "approved").length,
      rejected: apps.filter((x) => x.a.status === "rejected").length,
      pending: apps.filter((x) => x.a.status === "pending").length,
    };

    res.json({
      volunteer: {
        id: profile.id,
        userId: u.id,
        name: u.name,
        email: u.email,
        roleTitle: profile.roleTitle,
        cityArea: profile.cityArea,
        totalApplications: counts.total,
        approved: counts.approved,
        rejected: counts.rejected,
        pending: counts.pending,
      },
      profile,
      applications,
    });
  },
);

router.get(
  "/admin/activity",
  requireRole("admin"),
  async (_req, res): Promise<void> => {
    const recentRequests = await db
      .select({ r: requestsTable, ownerName: usersTable.name })
      .from(requestsTable)
      .innerJoin(usersTable, eq(usersTable.id, requestsTable.userId))
      .orderBy(desc(requestsTable.createdAt))
      .limit(10);
    const recentApps = await db
      .select({ a: applicationsTable, volName: usersTable.name })
      .from(applicationsTable)
      .innerJoin(usersTable, eq(usersTable.id, applicationsTable.volunteerId))
      .orderBy(desc(applicationsTable.createdAt))
      .limit(10);
    const recentUsers = await db
      .select()
      .from(usersTable)
      .where(ne(usersTable.role, "admin"))
      .orderBy(desc(usersTable.createdAt))
      .limit(10);

    const items: Array<{
      id: string;
      kind: string;
      message: string;
      actorName: string;
      createdAt: string;
    }> = [];
    for (const r of recentRequests) {
      items.push({
        id: `req-${r.r.id}`,
        kind: "request_created",
        message: `posted "${r.r.title}"`,
        actorName: r.ownerName,
        createdAt: r.r.createdAt.toISOString(),
      });
    }
    for (const a of recentApps) {
      const kind =
        a.a.status === "approved" || a.a.status === "rejected"
          ? "application_decided"
          : "application_created";
      const message =
        kind === "application_decided"
          ? `application was ${a.a.status}`
          : `applied to help`;
      items.push({
        id: `app-${a.a.id}`,
        kind,
        message,
        actorName: a.volName,
        createdAt: (a.a.decidedAt ?? a.a.createdAt).toISOString(),
      });
    }
    for (const u of recentUsers) {
      items.push({
        id: `usr-${u.id}`,
        kind:
          toRole(u.role) === "volunteer"
            ? "volunteer_registered"
            : "user_registered",
        message: `joined the platform`,
        actorName: u.name,
        createdAt: u.createdAt.toISOString(),
      });
    }
    items.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    res.json(items.slice(0, 25));
  },
);

export default router;
