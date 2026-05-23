
import {integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  credits: integer('credits').default(1000).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
export const repositories =pgTable('repositories',{
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  repoId: integer("repo_id").notNull(),
  name: text("name").notNull(),
  full_name: text("full_name").notNull(),
  private_: integer("private").notNull(),
  html_url: text("html_url").notNull(),
  description: text("description"),
  owner: text("owner").notNull(),
  default_branch:text("default_branch").notNull()
})
// export const posts = pgTable("posts", {
//   id: serial("id").primaryKey(),
//   title: text("title").notNull(),
//   content: text("content"),
//   authorId: serial("author_id").references(() => users.id),
//   createdAt: timestamp("created_at").defaultNow().notNull(),
// });
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
