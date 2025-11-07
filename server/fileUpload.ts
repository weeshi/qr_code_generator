import { storagePut, storageGet } from "./storage";
import crypto from "crypto";

export interface UploadedFile {
  key: string;
  url: string;
  fileName: string;
  mimeType: string;
  size: number;
}

/**
 * Generate a random suffix to prevent file enumeration
 */
function generateRandomSuffix(): string {
  return crypto.randomBytes(8).toString("hex");
}

/**
 * Upload a file to S3
 */
export async function uploadFile(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string,
  userId: number
): Promise<UploadedFile> {
  // Generate a unique file key with random suffix
  const fileExtension = fileName.split(".").pop() || "";
  const baseName = fileName.replace(`.${fileExtension}`, "");
  const randomSuffix = generateRandomSuffix();
  const fileKey = `qr-files/${userId}/${baseName}-${randomSuffix}.${fileExtension}`;

  try {
    const { url } = await storagePut(fileKey, fileBuffer, mimeType);

    return {
      key: fileKey,
      url,
      fileName,
      mimeType,
      size: fileBuffer.length,
    };
  } catch (error) {
    throw new Error(`Failed to upload file: ${error}`);
  }
}

/**
 * Get a presigned URL for a file
 */
export async function getFileUrl(fileKey: string): Promise<string> {
  try {
    const { url } = await storageGet(fileKey);
    return url;
  } catch (error) {
    throw new Error(`Failed to get file URL: ${error}`);
  }
}

/**
 * Validate file size (max 50MB)
 */
export function validateFileSize(fileBuffer: Buffer, maxSizeMB: number = 50): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return fileBuffer.length <= maxSizeBytes;
}

/**
 * Validate file type
 */
export function validateFileType(
  mimeType: string,
  allowedTypes: string[]
): boolean {
  return allowedTypes.includes(mimeType);
}

/**
 * Allowed MIME types for different QR code types
 */
export const ALLOWED_MIME_TYPES = {
  pdf: ["application/pdf"],
  image: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  video: ["video/mp4", "video/mpeg", "video/quicktime", "video/x-msvideo"],
  audio: ["audio/mpeg", "audio/wav", "audio/ogg", "audio/aac"],
};
