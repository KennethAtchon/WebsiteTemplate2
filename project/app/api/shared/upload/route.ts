import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/shared/services/storage";
import {
  validateFile,
  generateSecureFilename,
} from "@/shared/utils/validation/file-validation";
import debugLog from "@/shared/utils/debug";
import { withUserProtection } from "@/shared/middleware/api-route-protection";

async function postHandler(request: NextRequest) {
  // Require admin access
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file security
    const validation = await validateFile(file, {
      maxSizeBytes: 10 * 1024 * 1024, // 10MB
      allowedTypes: [".jpg", ".jpeg", ".png", ".gif", ".webp"],
      allowedMimeTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
    });

    if (!validation.isValid) {
      debugLog.warn("File upload rejected due to validation errors", {
        service: "upload",
        operation: "POST",
        filename: file.name,
        errors: validation.errors,
      });
      return NextResponse.json(
        {
          error: "File validation failed",
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    // Generate secure filename
    const fileName = generateSecureFilename(
      validation.sanitizedFilename || file.name,
      "therapy"
    );
    const filePath = `therapies/${fileName}`;

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload the file using the storage service
    const publicUrl = await storage.uploadFile(buffer, filePath, file.type);

    debugLog.info("File uploaded successfully", {
      service: "upload",
      operation: "POST",
      originalFilename: file.name,
      secureFilename: fileName,
      fileSize: file.size,
      mimeType: file.type,
    });

    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    debugLog.error(
      "Failed to upload file",
      { service: "upload", operation: "POST" },
      error
    );
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}

async function deleteHandler(request: NextRequest) {
  // Require admin access
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    await storage.deleteFile(url);

    return NextResponse.json({ success: true });
  } catch (error) {
    debugLog.error(
      "Failed to delete file",
      { service: "upload", operation: "DELETE" },
      error
    );
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 }
    );
  }
}

import {
  fileUploadSchema,
  deleteFileSchema,
} from "@/shared/utils/validation/api-validation";

export const POST = withUserProtection(postHandler, {
  bodySchema: fileUploadSchema,
  rateLimitType: "upload",
});
export const DELETE = withUserProtection(deleteHandler, {
  bodySchema: deleteFileSchema,
  rateLimitType: "upload",
});
