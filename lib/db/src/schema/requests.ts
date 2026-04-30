import {
  pgTable,
  serial,
  integer,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const requestsTable = pgTable("requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  purpose: text("purpose").notNull(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  urgency: varchar("urgency", { length: 16 }).notNull(),
  cityArea: text("city_area").notNull(),
  location: text("location").notNull(),
  contactPhone: text("contact_phone").notNull(),
  status: varchar("status", { length: 16 }).notNull().default("open"),
  approvedVolunteerId: integer("approved_volunteer_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type RequestRow = typeof requestsTable.$inferSelect;
