import { integer, pgTable, serial, text } from "drizzle-orm/pg-core";

export const issuesTable = pgTable("issues", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  userId: integer("userId").notNull(),
  userName: text("userName").notNull(),
});
