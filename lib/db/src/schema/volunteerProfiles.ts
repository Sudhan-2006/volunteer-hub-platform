import {
  pgTable,
  serial,
  integer,
  text,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const volunteerProfilesTable = pgTable("volunteer_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .unique()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  roleTitle: text("role_title").notNull(),
  skills: jsonb("skills").$type<string[]>().notNull().default([]),
  bio: text("bio").notNull().default(""),
  phone: text("phone").notNull(),
  cityArea: text("city_area").notNull(),
  availability: text("availability").notNull(),
  experienceYears: integer("experience_years").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type VolunteerProfileRow = typeof volunteerProfilesTable.$inferSelect;
