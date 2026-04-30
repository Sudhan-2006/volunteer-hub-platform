import { Router, type IRouter } from "express";
import { and, desc, eq, ne, sql } from "drizzle-orm";
import {
  db,
  requestsTable,
  applicationsTable,
  usersTable,
  volunteerProfilesTable,
} from "@workspace/db";
import { requireRole } from "../middlewares/auth";
import { toRole } from "../lib/auth";
import {
  serializeRequest,
  getProfileWithUser,
  serializeVolunteerProfile,
  toApplicationStatus,
  getRequestApplicationsCount,
} from "../lib/serializers";

const router: IRouter = Router();

router.get(
  "/dashboard/user",
  requireRole("user"),
  async (req, res): Promise<void> => {
    const viewer = req.currentUser!;
    const myRequests = await db
      .select()
      .from(requestsTable)
      .where(eq(requestsTable.userId, viewer.id))
      .orderBy(desc(requestsTable.createdAt));

    const requestIds = myRequests.map((r) => r.id);
    let allApps: Array<typeof applicationsTable.$inferSelect> = [];
    if (requestIds.length > 0) {
      allApps = await db
        .select()
        .from(applicationsTable)
        .where(
          sql`${applicationsTable.requestId} in (${sql.join(
            requestIds.map((id) => sql`${id}`),
            sql`, `,
          )})`,
        );
    }
    const total = myRequests.length;
    const applied = allApps.length;
    const pending = allApps.filter((a) => a.status === "pending").length;
    const accepted = allApps.filter((a) => a.status === "approved").length;
    const rejected = allApps.filter((a) => a.status === "rejected").length;

    const recentRequests = await Promise.all(
      myRequests.slice(0, 5).map(async (r) => {
        const c = await getRequestApplicationsCount(r.id);
        return serializeRequest(r, viewer.name, c, {
          viewerRole: "user",
          viewerId: viewer.id,
        });
      }),
    );

    const recentApps = allApps
      .slice()
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 8);

    const recentApplications = [];
    for (const app of recentApps) {
      const profile = await getProfileWithUser(app.volunteerId);
      if (!profile) continue;
      recentApplications.push({
        id: app.id,
        requestId: app.requestId,
        message: app.message,
        status: toApplicationStatus(app.status),
        createdAt: app.createdAt.toISOString(),
        volunteer: profile,
      });
    }

    res.json({
      counts: { total, applied, pending, accepted, rejected },
      recentRequests,
      recentApplications,
    });
  },
);

router.get(
  "/dashboard/volunteer",
  requireRole("volunteer"),
  async (req, res): Promise<void> => {
    const viewer = req.currentUser!;
    const myApps = await db
      .select()
      .from(applicationsTable)
      .where(eq(applicationsTable.volunteerId, viewer.id))
      .orderBy(desc(applicationsTable.createdAt));

    const accepted = myApps.filter((a) => a.status === "approved").length;
    const rejected = myApps.filter((a) => a.status === "rejected").length;
    const pending = myApps.filter((a) => a.status === "pending").length;

    const availableRows = await db
      .select({ r: requestsTable, ownerName: usersTable.name })
      .from(requestsTable)
      .innerJoin(usersTable, eq(usersTable.id, requestsTable.userId))
      .where(
        and(
          ne(requestsTable.userId, viewer.id),
          eq(requestsTable.status, "open"),
        ),
      )
      .orderBy(desc(requestsTable.createdAt))
      .limit(8);
    const availableRequests = await Promise.all(
      availableRows.map(async ({ r, ownerName }) => {
        const c = await getRequestApplicationsCount(r.id);
        return serializeRequest(r, ownerName, c, {
          viewerRole: "volunteer",
          viewerId: viewer.id,
        });
      }),
    );

    const recentApps = myApps.slice(0, 8);
    const recentApplications = [];
    for (const a of recentApps) {
      const [reqRow] = await db
        .select({ r: requestsTable, ownerName: usersTable.name })
        .from(requestsTable)
        .innerJoin(usersTable, eq(usersTable.id, requestsTable.userId))
        .where(eq(requestsTable.id, a.requestId));
      if (!reqRow) continue;
      const c = await getRequestApplicationsCount(a.requestId);
      recentApplications.push({
        id: a.id,
        message: a.message,
        status: toApplicationStatus(a.status),
        createdAt: a.createdAt.toISOString(),
        request: serializeRequest(reqRow.r, reqRow.ownerName, c, {
          viewerRole: "volunteer",
          viewerId: viewer.id,
        }),
      });
    }

    const profile = await getProfileWithUser(viewer.id);

    res.json({
      counts: {
        activeRoles: accepted,
        applications: myApps.length,
        accepted,
        rejected,
        availableRequests: availableRequests.length,
      },
      recentApplications,
      availableRequests,
      profile,
    });
    void pending;
  },
);

router.get(
  "/dashboard/admin",
  requireRole("admin"),
  async (_req, res): Promise<void> => {
    const [{ users }] = await db
      .select({ users: sql<number>`count(*)::int` })
      .from(usersTable)
      .where(eq(usersTable.role, "user"));
    const [{ volunteers }] = await db
      .select({ volunteers: sql<number>`count(*)::int` })
      .from(usersTable)
      .where(eq(usersTable.role, "volunteer"));
    const [{ requests }] = await db
      .select({ requests: sql<number>`count(*)::int` })
      .from(requestsTable);
    const [{ applications }] = await db
      .select({ applications: sql<number>`count(*)::int` })
      .from(applicationsTable);
    const [{ approvedHelps }] = await db
      .select({ approvedHelps: sql<number>`count(*)::int` })
      .from(applicationsTable)
      .where(eq(applicationsTable.status, "approved"));

    const requestStatusBreakdown = await db
      .select({
        status: requestsTable.status,
        count: sql<number>`count(*)::int`,
      })
      .from(requestsTable)
      .groupBy(requestsTable.status);

    const applicationStatusBreakdown = await db
      .select({
        status: applicationsTable.status,
        count: sql<number>`count(*)::int`,
      })
      .from(applicationsTable)
      .groupBy(applicationsTable.status);

    const categoryBreakdown = await db
      .select({
        category: requestsTable.category,
        count: sql<number>`count(*)::int`,
      })
      .from(requestsTable)
      .groupBy(requestsTable.category);

    const recentRequests = await db
      .select({ r: requestsTable, ownerName: usersTable.name })
      .from(requestsTable)
      .innerJoin(usersTable, eq(usersTable.id, requestsTable.userId))
      .orderBy(desc(requestsTable.createdAt))
      .limit(5);
    const recentApps = await db
      .select({ a: applicationsTable, volName: usersTable.name })
      .from(applicationsTable)
      .innerJoin(usersTable, eq(usersTable.id, applicationsTable.volunteerId))
      .orderBy(desc(applicationsTable.createdAt))
      .limit(5);
    const recentUsers = await db
      .select()
      .from(usersTable)
      .where(ne(usersTable.role, "admin"))
      .orderBy(desc(usersTable.createdAt))
      .limit(5);

    const activity: Array<{
      id: string;
      kind: string;
      message: string;
      actorName: string;
      createdAt: string;
    }> = [];
    for (const r of recentRequests) {
      activity.push({
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
          : `applied to a request`;
      activity.push({
        id: `app-${a.a.id}`,
        kind,
        message,
        actorName: a.volName,
        createdAt: (a.a.decidedAt ?? a.a.createdAt).toISOString(),
      });
    }
    for (const u of recentUsers) {
      activity.push({
        id: `usr-${u.id}`,
        kind:
          toRole(u.role) === "volunteer"
            ? "volunteer_registered"
            : "user_registered",
        message: `joined as ${u.role}`,
        actorName: u.name,
        createdAt: u.createdAt.toISOString(),
      });
    }
    activity.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

    const topVolRows = await db
      .select({ p: volunteerProfilesTable, u: usersTable })
      .from(volunteerProfilesTable)
      .innerJoin(usersTable, eq(usersTable.id, volunteerProfilesTable.userId))
      .limit(5);
    const topVolunteers = await Promise.all(
      topVolRows.map(({ p, u }) => serializeVolunteerProfile(p, u)),
    );

    res.json({
      totals: {
        users: Number(users ?? 0),
        volunteers: Number(volunteers ?? 0),
        requests: Number(requests ?? 0),
        applications: Number(applications ?? 0),
        approvedHelps: Number(approvedHelps ?? 0),
      },
      requestStatusBreakdown: requestStatusBreakdown.map((r) => ({
        status: r.status,
        count: Number(r.count ?? 0),
      })),
      applicationStatusBreakdown: applicationStatusBreakdown.map((r) => ({
        status: r.status,
        count: Number(r.count ?? 0),
      })),
      categoryBreakdown: categoryBreakdown.map((r) => ({
        category: r.category,
        count: Number(r.count ?? 0),
      })),
      recentActivity: activity.slice(0, 12),
      topVolunteers,
    });
  },
);

export default router;
