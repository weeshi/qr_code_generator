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
  }),
});

export type AppRouter = typeof appRouter;
