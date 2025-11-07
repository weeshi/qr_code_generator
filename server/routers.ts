import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  createQRCode,
  getUserQRCodes,
  getQRCodeById,
  deleteQRCode,
  updateQRCode,
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
