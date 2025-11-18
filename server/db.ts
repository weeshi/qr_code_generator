import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, qrCodes, InsertQRCode, scanHistory, InsertScanHistory } from "../drizzle/schema";
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
