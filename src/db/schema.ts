import { relations } from "drizzle-orm";
import { int, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

// ============================================================================
// Better Auth Tables
// ============================================================================

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: int("email_verified", { mode: "boolean" }).notNull().default(false),
  image: text("image"),
  username: text("username").unique(),
  createdAt: int("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: int("updated_at", { mode: "timestamp" }).notNull(),
});

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: int("expires_at", { mode: "timestamp" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: int("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: int("updated_at", { mode: "timestamp" }).notNull(),
});

export const accounts = sqliteTable("accounts", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  accessTokenExpiresAt: int("access_token_expires_at", { mode: "timestamp" }),
  refreshTokenExpiresAt: int("refresh_token_expires_at", { mode: "timestamp" }),
  scope: text("scope"),
  idToken: text("id_token"),
  password: text("password"),
  createdAt: int("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: int("updated_at", { mode: "timestamp" }).notNull(),
});

export const verifications = sqliteTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: int("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: int("created_at", { mode: "timestamp" }),
  updatedAt: int("updated_at", { mode: "timestamp" }),
});

// ============================================================================
// Application Tables
// ============================================================================

export const phases = sqliteTable("phases", {
  id: int("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  targetRatingStart: int("target_rating_start"),
  targetRatingEnd: int("target_rating_end"),
  focus: text("focus"),
  problemStart: int("problem_start").notNull(),
  problemEnd: int("problem_end").notNull(),
});

export const problems = sqliteTable("problems", {
  id: int("id").primaryKey({ autoIncrement: true }),
  number: int("number").notNull().unique(),
  platform: text("platform", {
    enum: ["leetcode", "codeforces", "cses", "atcoder", "other"],
  }).notNull(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  phaseId: int("phase_id")
    .notNull()
    .references(() => phases.id),
  topic: text("topic").notNull(),
  isStarred: int("is_starred", { mode: "boolean" }).notNull().default(false),
  note: text("note"),
});

export const userProblems = sqliteTable(
  "user_problems",
  {
    id: int("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    problemId: int("problem_id")
      .notNull()
      .references(() => problems.id, { onDelete: "cascade" }),
    status: text("status", {
      enum: ["untouched", "attempting", "solved", "revisit", "skipped"],
    })
      .notNull()
      .default("untouched"),
    updatedAt: int("updated_at", { mode: "timestamp" }).notNull(),
  },
  (table) => [
    uniqueIndex("user_problems_user_id_problem_id_unique").on(table.userId, table.problemId),
  ],
);

export const statusHistory = sqliteTable("status_history", {
  id: int("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  problemId: int("problem_id")
    .notNull()
    .references(() => problems.id, { onDelete: "cascade" }),
  fromStatus: text("from_status", {
    enum: ["untouched", "attempting", "solved", "revisit", "skipped"],
  }),
  toStatus: text("to_status", {
    enum: ["untouched", "attempting", "solved", "revisit", "skipped"],
  }).notNull(),
  changedAt: int("changed_at", { mode: "timestamp" }).notNull(),
});

// ============================================================================
// Relations
// ============================================================================

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
  userProblems: many(userProblems),
  statusHistory: many(statusHistory),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const phasesRelations = relations(phases, ({ many }) => ({
  problems: many(problems),
}));

export const problemsRelations = relations(problems, ({ one, many }) => ({
  phase: one(phases, {
    fields: [problems.phaseId],
    references: [phases.id],
  }),
  userProblems: many(userProblems),
  statusHistory: many(statusHistory),
}));

export const userProblemsRelations = relations(userProblems, ({ one }) => ({
  user: one(users, {
    fields: [userProblems.userId],
    references: [users.id],
  }),
  problem: one(problems, {
    fields: [userProblems.problemId],
    references: [problems.id],
  }),
}));

export const statusHistoryRelations = relations(statusHistory, ({ one }) => ({
  user: one(users, {
    fields: [statusHistory.userId],
    references: [users.id],
  }),
  problem: one(problems, {
    fields: [statusHistory.problemId],
    references: [problems.id],
  }),
}));

// ============================================================================
// Types
// ============================================================================

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type Account = typeof accounts.$inferSelect;
export type Phase = typeof phases.$inferSelect;
export type NewPhase = typeof phases.$inferInsert;
export type Problem = typeof problems.$inferSelect;
export type NewProblem = typeof problems.$inferInsert;
export type UserProblem = typeof userProblems.$inferSelect;
export type NewUserProblem = typeof userProblems.$inferInsert;
export type StatusHistory = typeof statusHistory.$inferSelect;
export type NewStatusHistory = typeof statusHistory.$inferInsert;

export type ProblemStatus = "untouched" | "attempting" | "solved" | "revisit" | "skipped";
export type Platform = "leetcode" | "codeforces" | "cses" | "atcoder" | "other";
