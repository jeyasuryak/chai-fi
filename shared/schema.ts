import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users Table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Menu Items Table
export const menuItems = pgTable("menu_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  category: text("category").notNull(),
  image: text("image").notNull(),
  available: boolean("available").notNull().default(true),
});

// Transactions Table
export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  items: jsonb("items").notNull(), // Array of {id, name, price, quantity}
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text("payment_method").notNull(), // 'gpay', 'cash', or 'split'
  billerName: text("biller_name").notNull().default('Sriram'),
  splitPayment: jsonb("split_payment"), // {gpayAmount: number, cashAmount: number} for split payments
  extras: jsonb("extras"), // Array of {name: string, amount: number}
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  date: text("date").notNull(), // YYYY-MM-DD format
  dayName: text("day_name").notNull(),
  time: text("time").notNull(), // HH:MM AM/PM format
});

// Daily Summaries Table
export const dailySummaries = pgTable("daily_summaries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: text("date").notNull().unique(), // YYYY-MM-DD format
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  gpayAmount: decimal("gpay_amount", { precision: 10, scale: 2 }).notNull(),
  cashAmount: decimal("cash_amount", { precision: 10, scale: 2 }).notNull(),
  orderCount: integer("order_count").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Weekly Summaries Table
export const weeklySummaries = pgTable("weekly_summaries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  weekStart: text("week_start").notNull(), // YYYY-MM-DD format (Monday)
  weekEnd: text("week_end").notNull(), // YYYY-MM-DD format (Sunday)
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  gpayAmount: decimal("gpay_amount", { precision: 10, scale: 2 }).notNull(),
  cashAmount: decimal("cash_amount", { precision: 10, scale: 2 }).notNull(),
  orderCount: integer("order_count").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Monthly Summaries Table
export const monthlySummaries = pgTable("monthly_summaries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  month: text("month").notNull(), // YYYY-MM format
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  gpayAmount: decimal("gpay_amount", { precision: 10, scale: 2 }).notNull(),
  cashAmount: decimal("cash_amount", { precision: 10, scale: 2 }).notNull(),
  orderCount: integer("order_count").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertMenuItemSchema = createInsertSchema(menuItems).omit({
  id: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

export const insertDailySummarySchema = createInsertSchema(dailySummaries).omit({
  id: true,
  createdAt: true,
});

export const insertWeeklySummarySchema = createInsertSchema(weeklySummaries).omit({
  id: true,
  createdAt: true,
});

export const insertMonthlySummarySchema = createInsertSchema(monthlySummaries).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type MenuItem = typeof menuItems.$inferSelect;
export type InsertMenuItem = z.infer<typeof insertMenuItemSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type DailySummary = typeof dailySummaries.$inferSelect;
export type InsertDailySummary = z.infer<typeof insertDailySummarySchema>;

export type WeeklySummary = typeof weeklySummaries.$inferSelect;
export type InsertWeeklySummary = z.infer<typeof insertWeeklySummarySchema>;

export type MonthlySummary = typeof monthlySummaries.$inferSelect;
export type InsertMonthlySummary = z.infer<typeof insertMonthlySummarySchema>;

// Cart item type for frontend
export type CartItem = {
  id: string;
  name: string;
  price: number;  // Fixed price to be a number instead of a string
  quantity: number;
};

// Define Zod schema for jsonb fields
export const itemsSchema = z.array(
  z.object({
    id: z.string(),
    name: z.string(),
    price: z.number(),
    quantity: z.number(),
  })
);

export const splitPaymentSchema = z.object({
  gpayAmount: z.number(),
  cashAmount: z.number(),
});

export const extrasSchema = z.array(
  z.object({
    name: z.string(),
    amount: z.number(),
  })
);
