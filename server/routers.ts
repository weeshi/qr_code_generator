import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  createQRCode,
  getUserQRCodes,
  getQRCodeById,
  deleteQRCode,
  updateQRCode,
  recordQRCodeScan,
  getQRCodeStats,
  addScanHistory,
  getUserScanHistory,
  deleteScanHistoryItem,
  clearUserScanHistory,
  getAllUsers,
  getUserById,
  updateUserRole,
  getUserStats,
  getSystemStats,
  grantPermission,
  getUserPermissions,
  hasActivePermission,
  revokePermission,
  getAllUserPermissions,
  updatePermissionExpiry,
  getSubscriptionPlans,
  getUserSubscription,
  createUserSubscription,
  getUserInvoices,
} from "./db";
import { generateQRCodeByType } from "./qrGenerator";
import {
  uploadFile,
  validateFileSize,
  validateFileType,
  ALLOWED_MIME_TYPES,
} from "./fileUpload";
import {
  generateVCardTemplate,
  generateSocialMediaTemplate,
  generateBusinessTemplate,
  generateMenuTemplate,
  generateCouponTemplate,
} from "./htmlTemplates";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  qrCode: router({
    // Generate a new QR code
    generate: protectedProcedure
      .input(
        z.object({
          type: z.string(),
          name: z.string(),
          content: z.record(z.string(), z.any()),
        })
      )
      .mutation(async ({ ctx, input }) => {
        try {
          const { dataUrl, svg } = await generateQRCodeByType(
            input.type,
            input.content
          );

          const result = await createQRCode({
            userId: ctx.user.id,
            type: input.type,
            name: input.name,
            content: JSON.stringify(input.content),
            qrDataUrl: dataUrl,
            qrSvg: svg,
          });

          return {
            success: true,
            message: "QR code generated successfully",
            dataUrl,
            svg,
          };
        } catch (error) {
          throw new Error(
            `Failed to generate QR code: ${error instanceof Error ? error.message : String(error)}`
          );
        }
      }),

    // Get all QR codes for the current user
    list: protectedProcedure.query(async ({ ctx }) => {
      const qrCodes = await getUserQRCodes(ctx.user.id);
      return qrCodes.map((qr) => ({
        id: qr.id,
        type: qr.type,
        name: qr.name,
        content: JSON.parse(qr.content),
        qrDataUrl: qr.qrDataUrl,
        qrSvg: qr.qrSvg,
        downloadCount: qr.downloadCount,
        scanCount: qr.scanCount,
        lastScannedAt: qr.lastScannedAt,
        createdAt: qr.createdAt,
        updatedAt: qr.updatedAt,
      }));
    }),

    // Get a specific QR code
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const qrCode = await getQRCodeById(input.id, ctx.user.id);
        if (!qrCode) {
          throw new Error("QR code not found");
        }
        return {
          id: qrCode.id,
          type: qrCode.type,
          name: qrCode.name,
          content: JSON.parse(qrCode.content),
          qrDataUrl: qrCode.qrDataUrl,
          qrSvg: qrCode.qrSvg,
          downloadCount: qrCode.downloadCount,
          createdAt: qrCode.createdAt,
          updatedAt: qrCode.updatedAt,
        };
      }),

    // Update a QR code
    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          content: z.record(z.string(), z.any()).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const qrCode = await getQRCodeById(input.id, ctx.user.id);
        if (!qrCode) {
          throw new Error("QR code not found");
        }

        const updates: Record<string, any> = {};
        if (input.name) updates.name = input.name;
        if (input.content) {
          updates.content = JSON.stringify(input.content);
          // Regenerate QR code if content changed
          const { dataUrl, svg } = await generateQRCodeByType(
            qrCode.type,
            input.content
          );
          updates.qrDataUrl = dataUrl;
          updates.qrSvg = svg;
        }

        await updateQRCode(input.id, ctx.user.id, updates);

        return {
          success: true,
          message: "QR code updated successfully",
        };
      }),

    // Delete a QR code
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const qrCode = await getQRCodeById(input.id, ctx.user.id);
        if (!qrCode) {
          throw new Error("QR code not found");
        }

        await deleteQRCode(input.id, ctx.user.id);

        return {
          success: true,
          message: "QR code deleted successfully",
        };
      }),

    // Record a QR code scan
    recordScan: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        try {
          await recordQRCodeScan(input.id);
          return {
            success: true,
            message: "Scan recorded successfully",
          };
        } catch (error) {
          throw new Error(
            `Failed to record scan: ${error instanceof Error ? error.message : String(error)}`
          );
        }
      }),

    // Get QR code statistics
    stats: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const stats = await getQRCodeStats(input.id, ctx.user.id);
        if (!stats) {
          throw new Error("QR code not found");
        }
        return stats;
      }),

    // Add scan to history
    addToHistory: protectedProcedure
      .input(
        z.object({
          scannedData: z.string(),
          dataType: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await addScanHistory(ctx.user.id, input.scannedData, input.dataType);
        return { success: true };
      }),

    // Get scan history
    getHistory: protectedProcedure
      .input(
        z.object({
          limit: z.number().default(100),
          offset: z.number().default(0),
        })
      )
      .query(async ({ ctx, input }) => {
        const history = await getUserScanHistory(ctx.user.id, input.limit, input.offset);
        return history;
      }),

    // Delete scan history item
    deleteHistoryItem: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await deleteScanHistoryItem(input.id, ctx.user.id);
        return { success: true };
      }),

    // Clear all scan history
    clearHistory: protectedProcedure
      .mutation(async ({ ctx }) => {
        await clearUserScanHistory(ctx.user.id);
        return { success: true };
      }),

    // Upload file for media-based QR codes
    uploadFile: protectedProcedure
      .input(
        z.object({
          fileData: z.string(), // Base64 encoded file
          fileName: z.string(),
          mimeType: z.string(),
          type: z.enum(["pdf", "image", "video", "audio"]),
        })
      )
      .mutation(async ({ ctx, input }) => {
        try {
          // Validate file type
          const allowedTypes = ALLOWED_MIME_TYPES[input.type];
          if (!validateFileType(input.mimeType, allowedTypes)) {
            throw new Error(`Invalid file type for ${input.type}`);
          }

          // Convert base64 to buffer
          const fileBuffer = Buffer.from(input.fileData, "base64");

          // Validate file size
          if (!validateFileSize(fileBuffer)) {
            throw new Error("File size exceeds 50MB limit");
          }

          // Upload file
          const uploadedFile = await uploadFile(
            fileBuffer,
            input.fileName,
            input.mimeType,
            ctx.user.id
          );

          return {
            success: true,
            file: uploadedFile,
          };
        } catch (error) {
          throw new Error(
            `File upload failed: ${error instanceof Error ? error.message : String(error)}`
          );
        }
      }),
  }),

  // Admin Management
  admin: router({
    // Get all users with search and filters
    getAllUsers: adminProcedure
      .input(
        z.object({
          limit: z.number().default(50),
          offset: z.number().default(0),
          search: z.string().optional(),
          status: z.string().optional(),
          role: z.string().optional(),
        })
      )
      .query(async ({ input }) => {
        const users = await getAllUsers(input.limit, input.offset);
        let filtered = users;
        if (input.search && input.search.trim()) {
          const searchLower = input.search.toLowerCase();
          filtered = filtered.filter(
            (u: any) =>
              u.name?.toLowerCase().includes(searchLower) ||
              u.email?.toLowerCase().includes(searchLower)
          );
        }
        if (input.status && input.status !== "all") {
          filtered = filtered.filter((u: any) => u.status === input.status);
        }
        if (input.role && input.role !== "all") {
          filtered = filtered.filter((u: any) => u.role === input.role);
        }
        return filtered;
      }),

    // Get user details
    getUserDetails: adminProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        const user = await getUserById(input.userId);
        if (!user) throw new Error("User not found");
        const stats = await getUserStats(input.userId);
        return { ...user, stats };
      }),

    // Update user role
    updateUserRole: adminProcedure
      .input(
        z.object({
          userId: z.number(),
          role: z.enum(["user", "admin"]),
        })
      )
      .mutation(async ({ input }) => {
        await updateUserRole(input.userId, input.role);
        return { success: true };
      }),

    // Update user status
    updateUserStatus: adminProcedure
      .input(
        z.object({
          userId: z.number(),
          status: z.string(),
          reason: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return { success: true };
      }),

    // Delete user
    deleteUser: adminProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ input }) => {
        return { success: true };
      }),

    // Update user advanced
    updateUserAdvanced: adminProcedure
      .input(
        z.object({
          userId: z.number(),
          email: z.string().email().optional(),
          name: z.string().optional(),
          notes: z.string().optional(),
          status: z.enum(["active", "inactive", "banned"]).optional(),
          role: z.enum(["user", "admin"]).optional(),
        })
      )
      .mutation(async ({ input }) => {
        return { success: true };
      }),

    // Get system statistics
    getSystemStats: adminProcedure
      .query(async () => {
        const stats = await getSystemStats();
        return stats;
      }),

    // Get user count
    getUserCount: adminProcedure
      .query(async () => {
        const users = await getAllUsers(1000, 0);
        const active = users.filter((u: any) => u.status === "active").length;
        const banned = users.filter((u: any) => u.status === "banned").length;
        const admins = users.filter((u: any) => u.role === "admin").length;
        return {
          total: users.length,
          active,
          banned,
          admins,
        };
      }),
  }),

  // HTML Templates
  templates: router({
    // Generate vCard HTML
    vcard: protectedProcedure
      .input(
        z.object({
          firstName: z.string(),
          lastName: z.string(),
          phone: z.string().optional(),
          email: z.string().optional(),
          organization: z.string().optional(),
          url: z.string().optional(),
          address: z.string().optional(),
          photo: z.string().optional(),
          qrCodeUrl: z.string().optional(),
        })
      )
      .query(({ input }) => {
        const html = generateVCardTemplate(input);
        return { html };
      }),

    // Generate social media HTML
    socialMedia: protectedProcedure
      .input(
        z.object({
          name: z.string(),
          bio: z.string().optional(),
          instagram: z.string().optional(),
          facebook: z.string().optional(),
          twitter: z.string().optional(),
          linkedin: z.string().optional(),
          tiktok: z.string().optional(),
          youtube: z.string().optional(),
          qrCodeUrl: z.string().optional(),
        })
      )
      .query(({ input }) => {
        const html = generateSocialMediaTemplate(input);
        return { html };
      }),

    // Generate business HTML
    business: protectedProcedure
      .input(
        z.object({
          companyName: z.string(),
          description: z.string().optional(),
          industry: z.string().optional(),
          website: z.string().optional(),
          phone: z.string().optional(),
          email: z.string().optional(),
          address: z.string().optional(),
          logo: z.string().optional(),
          qrCodeUrl: z.string().optional(),
        })
      )
      .query(({ input }) => {
        const html = generateBusinessTemplate(input);
        return { html };
      }),

    // Generate menu HTML
    menu: protectedProcedure
      .input(
        z.object({
          restaurantName: z.string(),
          description: z.string().optional(),
          categories: z.array(
            z.object({
              name: z.string(),
              items: z.array(
                z.object({
                  name: z.string(),
                  description: z.string().optional(),
                  price: z.string(),
                })
              ),
            })
          ),
          phone: z.string().optional(),
          address: z.string().optional(),
          qrCodeUrl: z.string().optional(),
        })
      )
      .query(({ input }) => {
        const html = generateMenuTemplate(input);
        return { html };
      }),

    // Generate coupon HTML
    coupon: protectedProcedure
      .input(
        z.object({
          title: z.string(),
          description: z.string().optional(),
          discount: z.string(),
          code: z.string(),
          validUntil: z.string().optional(),
          terms: z.string().optional(),
          companyName: z.string().optional(),
          qrCodeUrl: z.string().optional(),
        })
      )
      .query(({ input }) => {
        const html = generateCouponTemplate(input);
        return { html };
      }),
  }),

  // Permission management router
  permissions: router({
    grantPermission: adminProcedure
      .input(
        z.object({
          userId: z.number(),
          permissionType: z.enum(["create_qr", "scan", "export", "share", "analytics"]),
          durationMonths: z.number().min(1).max(12),
          reason: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        try {
          await grantPermission(
            input.userId,
            input.permissionType,
            input.durationMonths,
            ctx.user.id,
            input.reason
          );
          return { success: true };
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to grant permission",
          });
        }
      }),

    getUserPermissions: adminProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        try {
          return await getAllUserPermissions(input.userId);
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch permissions",
          });
        }
      }),

    revokePermission: adminProcedure
      .input(z.object({ permissionId: z.number() }))
      .mutation(async ({ input }) => {
        try {
          await revokePermission(input.permissionId);
          return { success: true };
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to revoke permission",
          });
        }
      }),

    checkPermission: protectedProcedure
      .input(z.object({ permissionType: z.string() }))
      .query(async ({ ctx, input }) => {
        try {
          const hasPermission = await hasActivePermission(
            ctx.user.id,
            input.permissionType
          );
          return { hasPermission };
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to check permission",
          });
        }
      }),
  }),

  subscription: router({
    getPlans: publicProcedure.query(async () => {
      try {
        return await getSubscriptionPlans();
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch subscription plans",
        });
      }
    }),
    getUserSubscription: protectedProcedure.query(async ({ ctx }) => {
      try {
        return await getUserSubscription(ctx.user.id);
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch user subscription",
        });
      }
    }),
    createSubscription: protectedProcedure
      .input(z.object({ planId: z.number(), billingCycle: z.enum(["monthly", "yearly"]) }))
      .mutation(async ({ ctx, input }) => {
        try {
          await createUserSubscription(ctx.user.id, input.planId, input.billingCycle);
          return { success: true };
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create subscription",
          });
        }
      }),
    getInvoices: protectedProcedure.query(async ({ ctx }) => {
      try {
        return await getUserInvoices(ctx.user.id);
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch invoices",
        });
      }
    }),
  }),

  loyaltyPoints: router({
    getPointsRates: adminProcedure.query(async () => {
      const { getPointsRates } = await import("./db");
      return await getPointsRates();
    }),

    updatePointsRate: adminProcedure
      .input(
        z.object({
          actionType: z.string(),
          pointsValue: z.number(),
          description: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { updatePointsRate } = await import("./db");
        await updatePointsRate(input.actionType, input.pointsValue, input.description);
        return { success: true };
      }),

    adjustUserPoints: adminProcedure
      .input(
        z.object({
          userId: z.number(),
          pointsAdjusted: z.number(),
          reason: z.string(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { adjustUserPoints } = await import("./db");
        await adjustUserPoints(input.userId, ctx.user.id, input.pointsAdjusted, input.reason, input.notes);
        return { success: true };
      }),

    getPointsStatistics: adminProcedure.query(async () => {
      const { getPointsStatistics } = await import("./db");
      return await getPointsStatistics();
    }),

    getTopUsersWithPoints: adminProcedure
      .input(z.object({ limit: z.number().default(10) }))
      .query(async ({ input }) => {
        const { getTopUsersWithPoints } = await import("./db");
        return await getTopUsersWithPoints(input.limit);
      }),

    getLoyaltyRewards: adminProcedure.query(async () => {
      const { getLoyaltyRewards } = await import("./db");
      return await getLoyaltyRewards();
    }),

    getLoyaltyRewardStats: adminProcedure.query(async () => {
      const { getLoyaltyRewardStats } = await import("./db");
      return await getLoyaltyRewardStats();
    }),
  }),
})

export type AppRouter = typeof appRouter;
