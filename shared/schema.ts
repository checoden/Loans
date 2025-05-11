import { pgTable, text, serial, integer, boolean, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").notNull().default(false),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  isAdmin: true,
});

export const loans = pgTable("loans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  logo: text("logo").notNull(),
  amount: integer("amount").notNull(),
  term_from: integer("term_from").notNull(),
  term_to: integer("term_to").notNull(),
  rate: numeric("rate", { precision: 5, scale: 2 }).notNull(),
  is_first_loan_zero: boolean("is_first_loan_zero").notNull().default(false),
  link: text("link").notNull(),
  priority: integer("priority").notNull().default(0),
  approval_rate: integer("approval_rate").notNull().default(90),
});

export const insertLoanSchema = createInsertSchema(loans).pick({
  name: true,
  logo: true,
  amount: true,
  term_from: true,
  term_to: true,
  rate: true,
  is_first_loan_zero: true,
  link: true,
  priority: true,
  approval_rate: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Loan = typeof loans.$inferSelect;
export type InsertLoan = z.infer<typeof insertLoanSchema>;
