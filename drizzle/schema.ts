import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * QR Code records table
 * Stores all generated QR codes with their metadata and content
 */
export const qrCodes = mysqlTable("qr_codes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 50 }).notNull(), // vcard, url, pdf, website, facebook, image, video, business, mp3, whatsapp, social, instagram, wifi, coupon, app, menu
  name: varchar("name", { length: 255 }).notNull(), // User-friendly name for the QR code
  content: text("content").notNull(), // JSON stringified content based on type
  qrDataUrl: text("qrDataUrl"), // Base64 encoded QR code image
  qrSvg: text("qrSvg"), // SVG representation of QR code
  downloadCount: int("downloadCount").default(0),
  scanCount: int("scanCount").default(0),
  lastScannedAt: timestamp("lastScannedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type QRCode = typeof qrCodes.$inferSelect;
export type InsertQRCode = typeof qrCodes.$inferInsert;

/**
 * Scan History table
 * Stores all scanned QR codes by users
 */
export const scanHistory = mysqlTable("scan_history", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  scannedData: text("scannedData").notNull(), // The content of the scanned QR code
  dataType: varchar("dataType", { length: 50 }), // Type of data (url, text, etc)
  scannedAt: timestamp("scannedAt").defaultNow().notNull(),
});

export type ScanHistory = typeof scanHistory.$inferSelect;
export type InsertScanHistory = typeof scanHistory.$inferInsert;

export const userPermissions = mysqlTable("user_permissions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  permissionType: mysqlEnum("permissionType", ["create_qr", "scan", "export", "share", "analytics"]).notNull(),
  isActive: int("isActive").default(1).notNull(),
  grantedAt: timestamp("grantedAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  grantedBy: int("grantedBy").references(() => users.id),
  reason: text("reason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserPermission = typeof userPermissions.$inferSelect;
export type InsertUserPermission = typeof userPermissions.$inferInsert;

/**
 * Subscription Plans table
 * Defines available subscription tiers with their features and pricing
 */
export const subscriptionPlans = mysqlTable("subscription_plans", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(), // Free, Professional, Enterprise
  description: text("description"),
  monthlyPrice: int("monthlyPrice").default(0), // Price in cents
  yearlyPrice: int("yearlyPrice"),
  maxQRCodes: int("maxQRCodes").notNull(), // -1 for unlimited
  maxScans: int("maxScans").notNull(), // -1 for unlimited
  canExport: int("canExport").default(0).notNull(),
  canShare: int("canShare").default(0).notNull(),
  canAnalytics: int("canAnalytics").default(0).notNull(),
  canCustomBranding: int("canCustomBranding").default(0).notNull(),
  supportLevel: varchar("supportLevel", { length: 50 }), // basic, priority, premium
  stripeProductId: varchar("stripeProductId", { length: 255 }),
  stripePriceIdMonthly: varchar("stripePriceIdMonthly", { length: 255 }),
  stripePriceIdYearly: varchar("stripePriceIdYearly", { length: 255 }),
  isActive: int("isActive").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type InsertSubscriptionPlan = typeof subscriptionPlans.$inferInsert;

/**
 * User Subscriptions table
 * Tracks active subscriptions for each user
 */
export const userSubscriptions = mysqlTable("user_subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  planId: int("planId").notNull().references(() => subscriptionPlans.id),
  status: mysqlEnum("status", ["active", "inactive", "cancelled", "expired"]).default("active").notNull(),
  billingCycle: mysqlEnum("billingCycle", ["monthly", "yearly"]).default("monthly").notNull(),
  currentPeriodStart: timestamp("currentPeriodStart").notNull(),
  currentPeriodEnd: timestamp("currentPeriodEnd").notNull(),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  cancelledAt: timestamp("cancelledAt"),
  cancelReason: text("cancelReason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserSubscription = typeof userSubscriptions.$inferSelect;
export type InsertUserSubscription = typeof userSubscriptions.$inferInsert;

/**
 * Invoices table
 * Stores billing invoices for user subscriptions
 */
export const invoices = mysqlTable("invoices", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  subscriptionId: int("subscriptionId").references(() => userSubscriptions.id),
  amount: int("amount").notNull(), // Amount in cents
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  status: mysqlEnum("status", ["draft", "sent", "paid", "failed", "cancelled"]).default("draft").notNull(),
  invoiceNumber: varchar("invoiceNumber", { length: 100 }).unique(),
  stripeInvoiceId: varchar("stripeInvoiceId", { length: 255 }),
  pdfUrl: text("pdfUrl"),
  dueDate: timestamp("dueDate"),
  paidAt: timestamp("paidAt"),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = typeof invoices.$inferInsert;
