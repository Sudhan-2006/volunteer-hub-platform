import { sql } from "drizzle-orm";
import {
  db,
  usersTable,
  volunteerProfilesTable,
  requestsTable,
  applicationsTable,
} from "@workspace/db";
import { hashPassword } from "./auth";
import { logger } from "./logger";

export async function seedDemoData(): Promise<void> {
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(usersTable)
    .where(sql`${usersTable.role} <> 'admin'`);
  if (Number(count ?? 0) > 0) {
    return;
  }

  const password = await hashPassword("demo1234");

  const [user1] = await db
    .insert(usersTable)
    .values({
      name: "Aarthi Krishnan",
      email: "aarthi@example.com",
      passwordHash: password,
      role: "user",
    })
    .returning();
  const [user2] = await db
    .insert(usersTable)
    .values({
      name: "Suresh Babu",
      email: "suresh@example.com",
      passwordHash: password,
      role: "user",
    })
    .returning();

  const [vol1] = await db
    .insert(usersTable)
    .values({
      name: "Divya Ramesh",
      email: "divya@example.com",
      passwordHash: password,
      role: "volunteer",
    })
    .returning();
  const [vol2] = await db
    .insert(usersTable)
    .values({
      name: "Karthik Iyer",
      email: "karthik@example.com",
      passwordHash: password,
      role: "volunteer",
    })
    .returning();
  const [vol3] = await db
    .insert(usersTable)
    .values({
      name: "Priya Natarajan",
      email: "priya@example.com",
      passwordHash: password,
      role: "volunteer",
    })
    .returning();

  await db.insert(volunteerProfilesTable).values([
    {
      userId: vol1.id,
      roleTitle: "Medical Helper",
      skills: ["First Aid", "Elder Care", "Patient Transport"],
      bio: "Nursing student with 2 years of community service experience.",
      phone: "+91 98765 43210",
      cityArea: "T. Nagar, Chennai",
      availability: "Evenings and weekends",
      experienceYears: 2,
    },
    {
      userId: vol2.id,
      roleTitle: "Tutor",
      skills: ["Math", "Physics", "Spoken English"],
      bio: "Software engineer who teaches free weekend classes.",
      phone: "+91 99887 76655",
      cityArea: "Indiranagar, Bangalore",
      availability: "Weekends",
      experienceYears: 4,
    },
    {
      userId: vol3.id,
      roleTitle: "Disaster Response",
      skills: ["Logistics", "Driving", "Coordination"],
      bio: "Volunteer with the local relief network during floods.",
      phone: "+91 97654 32109",
      cityArea: "Adyar, Chennai",
      availability: "On-call",
      experienceYears: 3,
    },
  ]);

  const [req1] = await db
    .insert(requestsTable)
    .values({
      userId: user1.id,
      title: "Need help moving my elderly mother to clinic",
      purpose: "Health checkup",
      category: "Medical",
      description:
        "Looking for someone to help my 78-year-old mother get to her cardiology appointment on Saturday morning.",
      urgency: "high",
      cityArea: "T. Nagar, Chennai",
      location: "12, North Usman Road, T. Nagar",
      contactPhone: "+91 90000 11122",
    })
    .returning();
  const [req2] = await db
    .insert(requestsTable)
    .values({
      userId: user1.id,
      title: "Weekend tutoring for 10th grade Math",
      purpose: "Education support",
      category: "Education",
      description:
        "My son is preparing for board exams and needs help with algebra and trigonometry.",
      urgency: "medium",
      cityArea: "T. Nagar, Chennai",
      location: "12, North Usman Road, T. Nagar",
      contactPhone: "+91 90000 11122",
    })
    .returning();
  const [req3] = await db
    .insert(requestsTable)
    .values({
      userId: user2.id,
      title: "Distribute relief packets in flood-hit area",
      purpose: "Community relief",
      category: "Disaster Relief",
      description:
        "Coordinating distribution of food and medicine packets this Sunday in the affected neighborhood.",
      urgency: "high",
      cityArea: "Velachery, Chennai",
      location: "Velachery Lake Road",
      contactPhone: "+91 80000 22233",
    })
    .returning();

  await db.insert(applicationsTable).values([
    {
      requestId: req1.id,
      volunteerId: vol1.id,
      message:
        "I have experience accompanying elderly patients. Happy to help on Saturday.",
      status: "pending",
    },
    {
      requestId: req1.id,
      volunteerId: vol3.id,
      message: "I can drive and coordinate transport.",
      status: "pending",
    },
    {
      requestId: req2.id,
      volunteerId: vol2.id,
      message:
        "I tutor weekend math classes. Would love to help your son prepare.",
      status: "pending",
    },
    {
      requestId: req3.id,
      volunteerId: vol3.id,
      message: "Count me in for the relief drive.",
      status: "pending",
    },
  ]);

  logger.info("Seeded demo users, volunteers, and requests");
}
