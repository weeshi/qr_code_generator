import { COOKIE_NAME } from "@shared/const";
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
    // Get all users
    getAllUsers: adminProcedure
      .input(
        z.object({
          limit: z.number().default(50),
          offset: z.number().default(0),
        })
      )
      .query(async ({ input }) => {
        const users = await getAllUsers(input.limit, input.offset);
        return users;
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

    // Get system statistics
    getSystemStats: adminProcedure
      .query(async () => {
        const stats = await getSystemStats();
        return stats;
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
});

export type AppRouter = typeof appRouter;
