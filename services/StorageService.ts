import { adminStorage } from "@/lib/firebase/admin";

export class StorageService {
  /**
   * Uploads a file buffer to Firebase Storage.
   * @param path The full path in the bucket (e.g., "invoices/projectId/file.png")
   * @param buffer The file content buffer
   * @param contentType The MIME type of the file
   */
  async uploadFile(
    path: string,
    buffer: Buffer,
    contentType: string
  ): Promise<void> {
    const bucket = adminStorage.bucket();
    const fileRef = bucket.file(path);

    await fileRef.save(buffer, {
      metadata: { contentType },
    });
  }

  /**
   * Deletes a file from Firebase Storage.
   * @param path The full path in the bucket to delete
   */
  async deleteFile(path: string): Promise<void> {
    try {
      const bucket = adminStorage.bucket();
      const file = bucket.file(path);
      const [exists] = await file.exists();
      if (exists) {
        await file.delete();
      }
    } catch (error) {
      console.error(`Error deleting file at ${path}:`, error);
      // We log but don't throw, to avoid breaking main flows if deletion fails
    }
  }

  /**
   * Generates a signed URL for temporary access to a private file.
   * @param path The full path in the bucket
   * @param expiresInHours How long the URL should remain valid (default: 24)
   * @returns The signed URL or undefined if generation fails
   */
  async getSignedUrl(
    path: string,
    expiresInHours: number = 24
  ): Promise<string | undefined> {
    try {
      const bucket = adminStorage.bucket();
      const file = bucket.file(path);

      const now = new Date();
      const expires = new Date(now);
      expires.setHours(expires.getHours() + expiresInHours);

      const [url] = await file.getSignedUrl({
        action: "read",
        expires,
      });
      return url;
    } catch (error) {
      console.error(`Error generating signed URL for ${path}:`, error);
      return undefined;
    }
  }
}
