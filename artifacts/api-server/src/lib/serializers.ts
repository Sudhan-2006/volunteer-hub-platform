import { eq, sql } from "drizzle-orm";
import {
  db,
  usersTable,
  volunteerProfilesTable,
  applicationsTable,
  type RequestRow,
  type VolunteerProfileRow,
  type User,
  type ApplicationRow,
} from "@workspace/db";
import { toRole } from "./auth";

export type SerializedHelpRequest = {
  id: number;
  userId: number;
  userName: string;
  title: string;
  purpose: string;
  category: string;
  description: string;
  urgency: "low" | "medium" | "high";
  cityArea: string;
  location: string | null;
  contactPhone: string | null;
  status: "open" | "in_progress" | "completed" | "cancelled";
  applicationsCount: number;
  approvedVolunteerId: number | null;
  createdAt: string;
};

export type SerializedVolunteerProfile = {
  id: number;
  userId: number;
  name: string;
  email: string;
  roleTitle: string;
  skills: string[];
  bio: string;
  phone: string;
  cityArea: string;
  availability: string;
  experienceYears: number;
  rating: number;
  completedHelps: number;
};

export function toUrgency(v: string): "low" | "medium" | "high" {
  if (v === "low" || v === "medium" || v === "high") return v;
  return "medium";
}

export function toRequestStatus(
  v: string,
): "open" | "in_progress" | "completed" | "cancelled" {
  if (
    v === "open" ||
    v === "in_progress" ||
    v === "completed" ||
    v === "cancelled"
  )
    return v;
  return "open";
}

export function toApplicationStatus(
  v: string,
): "pending" | "approved" | "rejected" | "withdrawn" {
  if (
    v === "pending" ||
    v === "approved" ||
    v === "rejected" ||
    v === "withdrawn"
  )
    return v;
  return "pending";
}

type RequestVisibility = {
  viewerRole: "user" | "volunteer" | "admin";
  viewerId: number;
};

export function serializeRequest(
  row: RequestRow,
  ownerName: string,
  applicationsCount: number,
  visibility: RequestVisibility,
): SerializedHelpRequest {
  const isOwner = row.userId === visibility.viewerId;
  const isApprovedVolunteer =
    row.approvedVolunteerId != null &&
    row.approvedVolunteerId === visibility.viewerId;
  const isAdmin = visibility.viewerRole === "admin";
  const reveal = isOwner || isApprovedVolunteer || isAdmin;

  return {
    id: row.id,
    userId: row.userId,
    userName: ownerName,
    title: row.title,
    purpose: row.purpose,
    category: row.category,
    description: row.description,
    urgency: toUrgency(row.urgency),
    cityArea: row.cityArea,
    location: reveal ? row.location : null,
    contactPhone: reveal ? row.contactPhone : null,
    status: toRequestStatus(row.status),
    applicationsCount,
    approvedVolunteerId: row.approvedVolunteerId ?? null,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function serializeVolunteerProfile(
  profile: VolunteerProfileRow,
  user: { name: string; email: string },
): Promise<SerializedVolunteerProfile> {
  const [{ approved, total }] = await db
    .select({
      approved: sql<number>`count(*) filter (where ${applicationsTable.status} = 'approved')::int`,
      total: sql<number>`count(*)::int`,
    })
    .from(applicationsTable)
    .where(eq(applicationsTable.volunteerId, profile.userId));

  const completed = Number(approved ?? 0);
  const totalApps = Number(total ?? 0);
  const rating =
    totalApps === 0
      ? 4.8
      : Math.round((4 + Math.min(1, completed / Math.max(totalApps, 1))) * 10) /
        10;

  return {
    id: profile.id,
    userId: profile.userId,
    name: user.name,
    email: user.email,
    roleTitle: profile.roleTitle,
    skills: Array.isArray(profile.skills) ? profile.skills : [],
    bio: profile.bio,
    phone: profile.phone,
    cityArea: profile.cityArea,
    availability: profile.availability,
    experienceYears: profile.experienceYears,
    rating,
    completedHelps: completed,
  };
}

export async function getProfileWithUser(
  volunteerUserId: number,
): Promise<SerializedVolunteerProfile | null> {
  const [row] = await db
    .select({
      profile: volunteerProfilesTable,
      user: usersTable,
    })
    .from(volunteerProfilesTable)
    .innerJoin(usersTable, eq(usersTable.id, volunteerProfilesTable.userId))
    .where(eq(volunteerProfilesTable.userId, volunteerUserId));
  if (!row) return null;
  return serializeVolunteerProfile(row.profile, row.user);
}

export function serializeApplication(row: ApplicationRow) {
  return {
    id: row.id,
    requestId: row.requestId,
    volunteerId: row.volunteerId,
    message: row.message,
    status: toApplicationStatus(row.status),
    createdAt: row.createdAt.toISOString(),
    decidedAt: row.decidedAt ? row.decidedAt.toISOString() : null,
  };
}

export async function getRequestApplicationsCount(
  requestId: number,
): Promise<number> {
  const [{ c }] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(applicationsTable)
    .where(eq(applicationsTable.requestId, requestId));
  return Number(c ?? 0);
}

export function safeUserAsSession(
  user: User,
  hasVolunteerProfile: boolean,
) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: toRole(user.role),
    hasVolunteerProfile,
  };
}
