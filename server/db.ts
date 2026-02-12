import { eq, desc, sql, and, gt } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, qrCodes, InsertQRCode, scanHistory, InsertScanHistory, userPermissions, InsertUserPermission, UserPermission, userFiles, InsertUserFile, backups, InsertBackup, adminActivityLogs, InsertAdminActivityLog } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function createQRCode(qrCode: InsertQRCode) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  
  const result = await db.insert(qrCodes).values(qrCode);
  return result;
}

export async function getUserQRCodes(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get QR codes: database not available");
    return [];
  }

  const result = await db
    .select()
    .from(qrCodes)
    .where(eq(qrCodes.userId, userId))
    .orderBy((t) => [desc(t.createdAt)]);

  return result;
}

export async function getQRCodeById(id: number, userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get QR code: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(qrCodes)
    .where(and(eq(qrCodes.id, id), eq(qrCodes.userId, userId)))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function deleteQRCode(id: number, userId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db
    .delete(qrCodes)
    .where(and(eq(qrCodes.id, id), eq(qrCodes.userId, userId)));
}

export async function updateQRCode(id: number, userId: number, updates: Partial<InsertQRCode>) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db
    .update(qrCodes)
    .set(updates)
    .where(and(eq(qrCodes.id, id), eq(qrCodes.userId, userId)));

  return result;
}


export async function recordQRCodeScan(id: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Get current scan count
  const current = await db
    .select({ scanCount: qrCodes.scanCount })
    .from(qrCodes)
    .where(eq(qrCodes.id, id))
    .limit(1);

  const newScanCount = (current[0]?.scanCount ?? 0) + 1;

  const result = await db
    .update(qrCodes)
    .set({
      scanCount: newScanCount,
      lastScannedAt: new Date(),
    })
    .where(eq(qrCodes.id, id));

  return result;
}

export async function getQRCodeStats(id: number, userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get QR code stats: database not available");
    return undefined;
  }

  const result = await db
    .select({
      id: qrCodes.id,
      scanCount: qrCodes.scanCount,
      lastScannedAt: qrCodes.lastScannedAt,
      downloadCount: qrCodes.downloadCount,
      createdAt: qrCodes.createdAt,
    })
    .from(qrCodes)
    .where(and(eq(qrCodes.id, id), eq(qrCodes.userId, userId)))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function addScanHistory(userId: number, scannedData: string, dataType?: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot add scan history: database not available");
    return;
  }

  try {
    await db.insert(scanHistory).values({
      userId,
      scannedData,
      dataType: dataType || 'unknown',
      scannedAt: new Date(),
    });
  } catch (error) {
    console.error("[Database] Failed to add scan history:", error);
  }
}

export async function getUserScanHistory(userId: number, limit: number = 100, offset: number = 0) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get scan history: database not available");
    return [];
  }

  const result = await db
    .select()
    .from(scanHistory)
    .where(eq(scanHistory.userId, userId))
    .orderBy((t) => [desc(t.scannedAt)])
    .limit(limit)
    .offset(offset);

  return result;
}

export async function deleteScanHistoryItem(id: number, userId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db
    .delete(scanHistory)
    .where(and(eq(scanHistory.id, id), eq(scanHistory.userId, userId)));
}

export async function clearUserScanHistory(userId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db
    .delete(scanHistory)
    .where(eq(scanHistory.userId, userId));
}


// Admin functions for user management
export async function getAllUsers(limit: number = 50, offset: number = 0) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get users: database not available");
    return [];
  }

  const result = await db
    .select()
    .from(users)
    .orderBy((t) => [desc(t.createdAt)])
    .limit(limit)
    .offset(offset);

  return result;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserRole(userId: number, role: 'user' | 'admin') {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db
    .update(users)
    .set({ role })
    .where(eq(users.id, userId));
}

export async function getUserStats(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user stats: database not available");
    return null;
  }

  const qrCount = await db
    .select({ count: sql`COUNT(*)` })
    .from(qrCodes)
    .where(eq(qrCodes.userId, userId));

  const scanCount = await db
    .select({ count: sql`COUNT(*)` })
    .from(scanHistory)
    .where(eq(scanHistory.userId, userId));

  return {
    qrCodeCount: qrCount[0]?.count || 0,
    scanCount: scanCount[0]?.count || 0,
  };
}

export async function getSystemStats() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get system stats: database not available");
    return null;
  }

  const totalUsers = await db
    .select({ count: sql`COUNT(*)` })
    .from(users);

  const totalQRCodes = await db
    .select({ count: sql`COUNT(*)` })
    .from(qrCodes);

  const totalScans = await db
    .select({ count: sql`COUNT(*)` })
    .from(scanHistory);

  const adminCount = await db
    .select({ count: sql`COUNT(*)` })
    .from(users)
    .where(eq(users.role, 'admin'));

  return {
    totalUsers: totalUsers[0]?.count || 0,
    totalQRCodes: totalQRCodes[0]?.count || 0,
    totalScans: totalScans[0]?.count || 0,
    adminCount: adminCount[0]?.count || 0,
  };
}


// Permission management functions
export async function grantPermission(
  userId: number,
  permissionType: string,
  durationMonths: number,
  grantedBy: number,
  reason?: string
) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + durationMonths);

  await db.insert(userPermissions).values({
    userId,
    permissionType: permissionType as any,
    isActive: 1,
    grantedAt: new Date(),
    expiresAt,
    grantedBy,
    reason,
  });
}

export async function getUserPermissions(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get permissions: database not available");
    return [];
  }

  const result = await db
    .select()
    .from(userPermissions)
    .where(eq(userPermissions.userId, userId))
    .orderBy((t) => [desc(t.expiresAt)]);

  return result;
}

export async function hasActivePermission(userId: number, permissionType: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot check permission: database not available");
    return false;
  }

  const result = await db
    .select()
    .from(userPermissions)
    .where(
      and(
        eq(userPermissions.userId, userId),
        eq(userPermissions.permissionType, permissionType as any),
        eq(userPermissions.isActive, 1),
        gt(userPermissions.expiresAt, new Date())
      )
    )
    .limit(1);

  return result.length > 0;
}

export async function revokePermission(permissionId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db
    .update(userPermissions)
    .set({ isActive: 0 })
    .where(eq(userPermissions.id, permissionId));
}

export async function getAllUserPermissions(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get all permissions: database not available");
    return [];
  }

  const result = await db
    .select()
    .from(userPermissions)
    .where(eq(userPermissions.userId, userId))
    .orderBy((t) => [desc(t.createdAt)]);

  return result;
}

export async function updatePermissionExpiry(permissionId: number, expiresAt: Date) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db
    .update(userPermissions)
    .set({ expiresAt })
    .where(eq(userPermissions.id, permissionId));
}


// Subscription Management Functions

export async function getSubscriptionPlans() {
  const db = await getDb();
  if (!db) return [];
  
  const { subscriptionPlans } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");
  const plans = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.isActive, 1));
  return plans;
}

export async function getUserSubscription(userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const { userSubscriptions, subscriptionPlans } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");
  
  const result = await db
    .select()
    .from(userSubscriptions)
    .leftJoin(subscriptionPlans, eq(userSubscriptions.planId, subscriptionPlans.id))
    .where(eq(userSubscriptions.userId, userId))
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}

export async function createUserSubscription(userId: number, planId: number, billingCycle: "monthly" | "yearly") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { userSubscriptions } = await import("../drizzle/schema");
  const now = new Date();
  const endDate = new Date(now);
  endDate.setMonth(endDate.getMonth() + (billingCycle === "yearly" ? 12 : 1));
  
  const result = await db.insert(userSubscriptions).values({
    userId,
    planId,
    status: "active",
    billingCycle,
    currentPeriodStart: now,
    currentPeriodEnd: endDate,
  });
  
  return result;
}

export async function updateUserSubscription(subscriptionId: number, updates: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { userSubscriptions } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");
  
  return await db
    .update(userSubscriptions)
    .set(updates)
    .where(eq(userSubscriptions.id, subscriptionId));
}

export async function createInvoice(userId: number, subscriptionId: number | null, amount: number, description: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { invoices } = await import("../drizzle/schema");
  const invoiceNumber = `INV-${Date.now()}`;
  
  const result = await db.insert(invoices).values({
    userId,
    subscriptionId,
    amount,
    currency: "USD",
    status: "draft",
    invoiceNumber,
    description,
  });
  
  return result;
}

export async function getUserInvoices(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const { invoices } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");
  
  return await db.select().from(invoices).where(eq(invoices.userId, userId));
}


// File Management Functions
export async function createUserFile(file: InsertUserFile) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(userFiles).values(file);
  return result;
}

export async function getUserFiles(userId: number, limit: number = 100, offset: number = 0) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .select()
    .from(userFiles)
    .where(eq(userFiles.userId, userId))
    .orderBy((t) => [desc(t.uploadedAt)])
    .limit(limit)
    .offset(offset);
  
  return result;
}

export async function getUserFilesByQRCode(qrCodeId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .select()
    .from(userFiles)
    .where(eq(userFiles.qrCodeId, qrCodeId))
    .orderBy((t) => [desc(t.uploadedAt)]);
  
  return result;
}

export async function deleteUserFile(fileId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .delete(userFiles)
    .where(and(eq(userFiles.id, fileId), eq(userFiles.userId, userId)));
}

export async function getUserStorageUsage(userId: number) {
  const db = await getDb();
  if (!db) return 0;
  
  const result = await db
    .select({ totalSize: sql`SUM(fileSize)` })
    .from(userFiles)
    .where(eq(userFiles.userId, userId));
  
  return result[0]?.totalSize || 0;
}

// Backup Management Functions
export async function createBackup(backup: InsertBackup) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(backups).values(backup);
  return result;
}

export async function getUserBackups(userId: number, limit: number = 50, offset: number = 0) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .select()
    .from(backups)
    .where(eq(backups.userId, userId))
    .orderBy((t) => [desc(t.createdAt)])
    .limit(limit)
    .offset(offset);
  
  return result;
}

export async function updateBackupStatus(backupId: number, status: string, updates?: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(backups)
    .set({ status: status as any, ...updates })
    .where(eq(backups.id, backupId));
}

export async function getBackupById(backupId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db
    .select()
    .from(backups)
    .where(eq(backups.id, backupId))
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}

export async function getAllBackups(limit: number = 100, offset: number = 0) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .select()
    .from(backups)
    .orderBy((t) => [desc(t.createdAt)])
    .limit(limit)
    .offset(offset);
  
  return result;
}

// Admin Activity Logging Functions
export async function logAdminActivity(
  adminId: number,
  actionType: string,
  targetUserId?: number,
  details?: any,
  ipAddress?: string,
  userAgent?: string
) {
  const db = await getDb();
  if (!db) return;
  
  try {
    await db.insert(adminActivityLogs).values({
      adminId,
      actionType,
      targetUserId,
      details: details ? JSON.stringify(details) : null,
      ipAddress,
      userAgent,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error("[Database] Failed to log admin activity:", error);
  }
}

export async function getAdminActivityLogs(limit: number = 100, offset: number = 0) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .select()
    .from(adminActivityLogs)
    .orderBy((t) => [desc(t.createdAt)])
    .limit(limit)
    .offset(offset);
  
  return result;
}

export async function getAdminActivityLogsByUser(adminId: number, limit: number = 100, offset: number = 0) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .select()
    .from(adminActivityLogs)
    .where(eq(adminActivityLogs.adminId, adminId))
    .orderBy((t) => [desc(t.createdAt)])
    .limit(limit)
    .offset(offset);
  
  return result;
}


// Loyalty Points Management Functions
export async function initializeLoyaltyPoints(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { loyaltyPoints } = await import("../drizzle/schema");
  
  try {
    await db.insert(loyaltyPoints).values({
      userId,
      totalPoints: 0,
      availablePoints: 0,
      usedPoints: 0,
      tier: "bronze",
      createdAt: new Date(),
      lastUpdatedAt: new Date(),
    });
  } catch (error) {
    console.error("[Database] Failed to initialize loyalty points:", error);
  }
}

export async function getUserLoyaltyPoints(userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const { loyaltyPoints } = await import("../drizzle/schema");
  
  const result = await db
    .select()
    .from(loyaltyPoints)
    .where(eq(loyaltyPoints.userId, userId))
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}

export async function addLoyaltyPoints(
  userId: number,
  points: number,
  transactionType: string,
  description?: string,
  relatedId?: number,
  relatedType?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { loyaltyPoints, loyaltyTransactions } = await import("../drizzle/schema");
  
  try {
    // Add transaction record
    await db.insert(loyaltyTransactions).values({
      userId,
      transactionType: transactionType as any,
      points,
      description,
      relatedId,
      relatedType,
      status: "completed",
      createdAt: new Date(),
    });

    // Update loyalty points
    const current = await db
      .select({ availablePoints: loyaltyPoints.availablePoints, totalPoints: loyaltyPoints.totalPoints })
      .from(loyaltyPoints)
      .where(eq(loyaltyPoints.userId, userId))
      .limit(1);

    if (current.length > 0) {
      const newAvailable = (current[0].availablePoints || 0) + points;
      const newTotal = (current[0].totalPoints || 0) + points;
      
      await db
        .update(loyaltyPoints)
        .set({
          availablePoints: newAvailable,
          totalPoints: newTotal,
          lastUpdatedAt: new Date(),
        })
        .where(eq(loyaltyPoints.userId, userId));
    }
  } catch (error) {
    console.error("[Database] Failed to add loyalty points:", error);
    throw error;
  }
}

export async function redeemLoyaltyPoints(userId: number, points: number, reason?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { loyaltyPoints, loyaltyTransactions } = await import("../drizzle/schema");
  
  try {
    const current = await db
      .select({ availablePoints: loyaltyPoints.availablePoints })
      .from(loyaltyPoints)
      .where(eq(loyaltyPoints.userId, userId))
      .limit(1);

    if (!current.length || (current[0].availablePoints || 0) < points) {
      throw new Error("Insufficient loyalty points");
    }

    // Add redemption transaction
    await db.insert(loyaltyTransactions).values({
      userId,
      transactionType: "redeemed",
      points: -points,
      description: reason || "Points redeemed",
      status: "completed",
      createdAt: new Date(),
    });

    // Update loyalty points
    const newAvailable = (current[0].availablePoints || 0) - points;
    
    await db
      .update(loyaltyPoints)
      .set({
        availablePoints: newAvailable,
        usedPoints: (await db
          .select({ usedPoints: loyaltyPoints.usedPoints })
          .from(loyaltyPoints)
          .where(eq(loyaltyPoints.userId, userId))
          .limit(1))[0]?.usedPoints || 0 + points,
        lastUpdatedAt: new Date(),
      })
      .where(eq(loyaltyPoints.userId, userId));
  } catch (error) {
    console.error("[Database] Failed to redeem loyalty points:", error);
    throw error;
  }
}

export async function getUserLoyaltyTransactions(userId: number, limit: number = 50, offset: number = 0) {
  const db = await getDb();
  if (!db) return [];
  
  const { loyaltyTransactions } = await import("../drizzle/schema");
  
  const result = await db
    .select()
    .from(loyaltyTransactions)
    .where(eq(loyaltyTransactions.userId, userId))
    .orderBy((t) => [desc(t.createdAt)])
    .limit(limit)
    .offset(offset);
  
  return result;
}

export async function getLoyaltyRewards(isActive: boolean = true) {
  const db = await getDb();
  if (!db) return [];
  
  const { loyaltyRewards } = await import("../drizzle/schema");
  
  const result = await db
    .select()
    .from(loyaltyRewards)
    .where(isActive ? eq(loyaltyRewards.isActive, 1) : undefined)
    .orderBy((t) => [t.pointsRequired]);
  
  return result;
}

export async function updateLoyaltyTier(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { loyaltyPoints } = await import("../drizzle/schema");
  
  const current = await db
    .select({ totalPoints: loyaltyPoints.totalPoints })
    .from(loyaltyPoints)
    .where(eq(loyaltyPoints.userId, userId))
    .limit(1);

  if (!current.length) return;

  const points = current[0].totalPoints || 0;
  let newTier: "bronze" | "silver" | "gold" | "platinum" = "bronze";
  
  if (points >= 10000) newTier = "platinum";
  else if (points >= 5000) newTier = "gold";
  else if (points >= 1000) newTier = "silver";

  await db
    .update(loyaltyPoints)
    .set({ tier: newTier })
    .where(eq(loyaltyPoints.userId, userId));
}

export async function getUserRedemptions(userId: number, limit: number = 50, offset: number = 0) {
  const db = await getDb();
  if (!db) return [];
  
  const { userRedemptions } = await import("../drizzle/schema");
  
  const result = await db
    .select()
    .from(userRedemptions)
    .where(eq(userRedemptions.userId, userId))
    .orderBy((t) => [desc(t.redeemedAt)])
    .limit(limit)
    .offset(offset);
  
  return result;
}


// Points Rates Management Functions
export async function getPointsRates() {
  const db = await getDb();
  if (!db) return [];
  
  const { pointsRates } = await import("../drizzle/schema");
  
  const result = await db
    .select()
    .from(pointsRates)
    .orderBy((t) => [t.actionType]);
  
  return result;
}

export async function getPointsRateByAction(actionType: string) {
  const db = await getDb();
  if (!db) return null;
  
  const { pointsRates } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");
  
  const result = await db
    .select()
    .from(pointsRates)
    .where(eq(pointsRates.actionType, actionType as any))
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}

export async function updatePointsRate(actionType: string, pointsValue: number, description?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { pointsRates } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");
  
  try {
    const existing = await db
      .select()
      .from(pointsRates)
      .where(eq(pointsRates.actionType, actionType as any))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(pointsRates)
        .set({
          pointsValue,
          description,
          updatedAt: new Date(),
        })
        .where(eq(pointsRates.actionType, actionType as any));
    } else {
      await db.insert(pointsRates).values({
        actionType: actionType as any,
        pointsValue,
        description,
        isActive: 1,
      });
    }
  } catch (error) {
    console.error("[Database] Failed to update points rate:", error);
    throw error;
  }
}

export async function togglePointsRateActive(actionType: string, isActive: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { pointsRates } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");
  
  try {
    await db
      .update(pointsRates)
      .set({
        isActive: isActive ? 1 : 0,
        updatedAt: new Date(),
      })
      .where(eq(pointsRates.actionType, actionType as any));
  } catch (error) {
    console.error("[Database] Failed to toggle points rate:", error);
    throw error;
  }
}

// Points Adjustments Management Functions
export async function adjustUserPoints(userId: number, adminId: number, pointsAdjusted: number, reason: string, notes?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { pointsAdjustments, loyaltyPoints } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");
  
  try {
    // Record the adjustment
    await db.insert(pointsAdjustments).values({
      userId,
      adminId,
      pointsAdjusted,
      reason,
      notes,
    });

    // Update loyalty points
    const current = await db
      .select({ availablePoints: loyaltyPoints.availablePoints, totalPoints: loyaltyPoints.totalPoints })
      .from(loyaltyPoints)
      .where(eq(loyaltyPoints.userId, userId))
      .limit(1);

    if (current.length > 0) {
      const newAvailable = (current[0].availablePoints || 0) + pointsAdjusted;
      const newTotal = (current[0].totalPoints || 0) + pointsAdjusted;
      
      await db
        .update(loyaltyPoints)
        .set({
          availablePoints: Math.max(0, newAvailable),
          totalPoints: Math.max(0, newTotal),
          lastUpdatedAt: new Date(),
        })
        .where(eq(loyaltyPoints.userId, userId));
    }
  } catch (error) {
    console.error("[Database] Failed to adjust user points:", error);
    throw error;
  }
}

export async function getPointsAdjustmentHistory(limit: number = 100, offset: number = 0) {
  const db = await getDb();
  if (!db) return [];
  
  const { pointsAdjustments } = await import("../drizzle/schema");
  const { desc } = await import("drizzle-orm");
  
  const result = await db
    .select()
    .from(pointsAdjustments)
    .orderBy((t) => [desc(t.createdAt)])
    .limit(limit)
    .offset(offset);
  
  return result;
}

// Points Statistics Functions
export async function getPointsStatistics() {
  const db = await getDb();
  if (!db) return null;
  
  const { pointsStatistics } = await import("../drizzle/schema");
  
  const result = await db
    .select()
    .from(pointsStatistics)
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}

export async function updatePointsStatistics() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { pointsStatistics, loyaltyPoints, loyaltyTransactions } = await import("../drizzle/schema");
  
  try {
    // For now, just set default values - in production, you'd aggregate from transactions
    const stats = {
      totalPointsDistributed: 0,
      totalPointsRedeemed: 0,
      activeUsersWithPoints: 0,
      averagePointsPerUser: 0,
      topTierCount: 0,
      lastUpdatedAt: new Date(),
    };

    const existing = await db
      .select()
      .from(pointsStatistics)
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(pointsStatistics)
        .set(stats)
        .limit(1);
    } else {
      await db.insert(pointsStatistics).values(stats);
    }
  } catch (error) {
    console.error("[Database] Failed to update points statistics:", error);
  }
}

// Get loyalty data for admin dashboard
export async function getTopUsersWithPoints(limit: number = 10) {
  const db = await getDb();
  if (!db) return [];
  
  const { loyaltyPoints, users } = await import("../drizzle/schema");
  const { desc } = await import("drizzle-orm");
  
  const result = await db
    .select({
      userId: loyaltyPoints.userId,
      userName: users.name,
      userEmail: users.email,
      totalPoints: loyaltyPoints.totalPoints,
      tier: loyaltyPoints.tier,
    })
    .from(loyaltyPoints)
    .innerJoin(users, (t) => {
      const { eq } = require("drizzle-orm");
      return eq(loyaltyPoints.userId, users.id);
    })
    .orderBy((t) => [desc(loyaltyPoints.totalPoints)])
    .limit(limit);
  
  return result;
}

export async function getLoyaltyRewardStats() {
  const db = await getDb();
  if (!db) return [];
  
  const { loyaltyRewards } = await import("../drizzle/schema");
  const { desc } = await import("drizzle-orm");
  
  const result = await db
    .select()
    .from(loyaltyRewards)
    .orderBy((t) => [desc(loyaltyRewards.currentRedemptions)])
    .limit(10);
  
  return result;
}
