import sharp from "sharp";
import { spawn } from "child_process";
import fs from "fs/promises";
import path from "path";
import os from "os";

export class CompressionService {
  /**
   * Compresses and resizes an image buffer.
   * Resizes to max 1920x1920 inside.
   * Converts to PNG/WebP with 80% quality, or JPEG with 50% quality for others.
   */
  async compressImage(
    buffer: Buffer,
    mimeType: string
  ): Promise<{ buffer: Buffer; contentType: string }> {
    try {
      if (!mimeType.startsWith("image/")) {
        return { buffer, contentType: mimeType };
      }

      const pipeline = sharp(buffer).resize(1920, 1920, {
        fit: "inside",
        withoutEnlargement: true,
      });

      let fileBuffer: Buffer;
      let contentType = mimeType;

      if (mimeType === "image/png") {
        fileBuffer = await pipeline.png({ quality: 80 }).toBuffer();
        contentType = "image/png";
      } else if (mimeType === "image/webp") {
        fileBuffer = await pipeline.webp({ quality: 80 }).toBuffer();
        contentType = "image/webp";
      } else {
        // Default to JPEG for others (JPG, BMP, TIFF, etc.)
        fileBuffer = await pipeline
          .jpeg({ quality: 80, mozjpeg: true })
          .toBuffer();
        contentType = "image/jpeg";
      }

      return { buffer: fileBuffer, contentType };
    } catch (error) {
      console.error("Error compressing image:", error);
      // Fallback to original buffer if compression fails
      return { buffer, contentType: mimeType };
    }
  }

  /**
   * Compresses a PDF buffer using Ghostscript.
   * Uses -dPDFSETTINGS=/ebook for ~150dpi quality.
   */
  async compressPdf(buffer: Buffer): Promise<Buffer> {
    const tempDir = os.tmpdir();
    const inputPath = path.join(tempDir, `input-${Date.now()}.pdf`);
    const outputPath = path.join(tempDir, `output-${Date.now()}.pdf`);

    try {
      await fs.writeFile(inputPath, buffer);

      await new Promise<void>((resolve, reject) => {
        const gs = spawn("gs", [
          "-sDEVICE=pdfwrite",
          "-dCompatibilityLevel=1.4",
          "-dPDFSETTINGS=/ebook",
          "-dNOPAUSE",
          "-dQUIET",
          "-dBATCH",
          `-sOutputFile=${outputPath}`,
          inputPath,
        ]);

        gs.on("close", (code) => {
          if (code === 0) {
            resolve();
          } else {
            reject(new Error(`Ghostscript exited with code ${code}`));
          }
        });

        gs.on("error", (err) => {
          reject(err);
        });
      });

      const compressedBuffer = await fs.readFile(outputPath);
      return compressedBuffer;
    } catch (error) {
      console.error("Error compressing PDF:", error);
      // Fallback to original buffer if compression fails
      return buffer;
    } finally {
      // Cleanup temp files
      try {
        await fs.unlink(inputPath).catch(() => {});
        await fs.unlink(outputPath).catch(() => {});
      } catch (e) {
        console.error("Error cleaning up temp files:", e);
      }
    }
  }
}
