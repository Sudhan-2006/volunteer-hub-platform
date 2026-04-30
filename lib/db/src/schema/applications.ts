import {
  pgTable,
  serial,
  integer,
  text,
  timestamp,
  varchar,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { requestsTable } from "./requests";
import { usersTable } from "./users";

export const applicationsTable = pgTable(
  "applications",
  {
    id: serial("id").primaryKey(),
    requestId: integer("request_id")
      .notNull()
      .references(() => requestsTable.id, { onDelete: "cascade" }),
    volunteerId: integer("volunteer_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    message: text("message").notNull(),
    status: varchar("status", { length: 16 }).notNull().default("pending"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    decidedAt: timestamp("decided_at"),
  },
  (t) => [uniqueIndex("apps_request_volunteer_uniq").on(t.requestId, t.volunteerId)],
);

export type ApplicationRow = typeof applicationsTable.$inferSelect;
