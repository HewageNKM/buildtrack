import { EntryRepository } from "@/repositories/EntryRepository";
import { ProjectService } from "./ProjectService";
import { BudgetEntry } from "@/types";
import { adminStorage } from "@/lib/firebase/admin";
import { CompressionService } from "./CompressionService";

export class EntryService {
  private entryRepo: EntryRepository;
  private projectService: ProjectService;
  private compressionService: CompressionService;

  constructor() {
    this.entryRepo = new EntryRepository();
    this.projectService = new ProjectService();
    this.compressionService = new CompressionService();
  }

  async getEntries(
    projectId: string,
    userId: string,
    limit?: number,
    cursor?: { date: string; id: string },
    startDate?: string,
    endDate?: string,
    email?: string
  ): Promise<BudgetEntry[]> {
    const access = await this.projectService.verifyAccess(
      projectId,
      userId,
      email
    );
    if (!access.hasAccess) throw new Error("Access denied");

    return await this.entryRepo.getByProjectId(
      projectId,
      limit,
      cursor,
      startDate,
      endDate
    );
  }

  async getTotalSpent(
    projectId: string,
    userId: string,
    email?: string
  ): Promise<number> {
    const access = await this.projectService.verifyAccess(
      projectId,
      userId,
      email
    );
    if (!access.hasAccess) throw new Error("Access denied");
    return await this.entryRepo.getProjectTotalSpent(projectId);
  }

  async createEntry(
    projectId: string,
    userId: string,
    userEmail: string,
    data: {
      category: BudgetEntry["category"];
      subCategory?: string;
      description: string;
      amount: number;
      date: string;
    },
    file?: { buffer: Buffer; name: string; type: string }
  ): Promise<BudgetEntry> {
    const access = await this.projectService.verifyAccess(
      projectId,
      userId,
      userEmail
    );
    if (!access.hasAccess) throw new Error("Access denied");

    if (access.role === "viewer") throw new Error("Viewers cannot add entries");

    let invoiceUrl: string | undefined;
    let invoiceFileName: string | undefined;
    let invoiceType: "image" | "pdf" | undefined;

    if (file) {
      const fileName = `invoices/${projectId}/${Date.now()}-${file.name}`;
      const bucket = adminStorage.bucket();
      const fileRef = bucket.file(fileName);

      let fileBuffer = file.buffer;
      let contentType = file.type;

      if (file.type.startsWith("image/")) {
        const result = await this.compressionService.compressImage(
          file.buffer,
          file.type
        );
        fileBuffer = result.buffer;
        contentType = result.contentType;
      } else if (file.type === "application/pdf") {
        fileBuffer = await this.compressionService.compressPdf(file.buffer);
      }

      await fileRef.save(fileBuffer, {
        metadata: { contentType },
      });

      await fileRef.makePublic();
      invoiceUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
      invoiceFileName = file.name;
      invoiceType = file.type.startsWith("image/") ? "image" : "pdf";
    }

    const entryData: Record<string, any> = {
      projectId,
      category: data.category,
      subCategory: data.subCategory || undefined,
      description: data.description,
      amount: data.amount,
      date: data.date,
      invoiceUrl: invoiceUrl || undefined,
      invoiceFileName: invoiceFileName || undefined,
      invoiceType: invoiceType || undefined,
      addedBy: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Remove undefined fields to prevent Firestore "Value for argument data is not a valid Firestore document" error
    Object.keys(entryData).forEach(
      (key) => entryData[key] === undefined && delete entryData[key]
    );

    return await this.entryRepo.create(entryData as Omit<BudgetEntry, "id">);
  }

  async updateEntry(
    projectId: string,
    entryId: string,
    userId: string,
    data: {
      category?: BudgetEntry["category"];
      subCategory?: string;
      description?: string;
      amount?: number;
      date?: string;
    },
    file?: { buffer: Buffer; name: string; type: string },
    email?: string
  ): Promise<BudgetEntry> {
    const access = await this.projectService.verifyAccess(
      projectId,
      userId,
      email
    );
    if (!access.hasAccess) throw new Error("Access denied");

    // Check if user is allowed to edit (owners/editors only)
    if (access.role === "viewer")
      throw new Error("Viewers cannot edit entries");

    const existingEntry = await this.entryRepo.getById(entryId);
    if (!existingEntry) throw new Error("Entry not found");

    // Check if entry belongs to this project
    if (existingEntry.projectId !== projectId)
      throw new Error("Entry does not belong to this project");

    let invoiceUrl = existingEntry.invoiceUrl;
    let invoiceFileName = existingEntry.invoiceFileName;
    let invoiceType = existingEntry.invoiceType;

    // Handle new file upload if provided
    if (file) {
      // Delete old file if exists
      if (existingEntry.invoiceUrl) {
        try {
          const bucket = adminStorage.bucket();
          const urlParts = existingEntry.invoiceUrl.split("/");
          const oldFileName = urlParts.slice(-3).join("/");
          // Check if file exists before deleting prevents error
          const oldFile = bucket.file(oldFileName);
          const [exists] = await oldFile.exists();
          if (exists) await oldFile.delete();
        } catch (err) {
          console.error("Error deleting old invoice file:", err);
        }
      }

      // Upload new file
      const fileName = `invoices/${projectId}/${Date.now()}-${file.name}`;
      const bucket = adminStorage.bucket();
      const fileRef = bucket.file(fileName);

      let fileBuffer = file.buffer;
      let contentType = file.type;

      if (file.type.startsWith("image/")) {
        const result = await this.compressionService.compressImage(
          file.buffer,
          file.type
        );
        fileBuffer = result.buffer;
        contentType = result.contentType;
      } else if (file.type === "application/pdf") {
        fileBuffer = await this.compressionService.compressPdf(file.buffer);
      }

      await fileRef.save(fileBuffer, {
        metadata: { contentType },
      });

      await fileRef.makePublic();
      invoiceUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
      invoiceFileName = file.name;
      invoiceType = file.type.startsWith("image/") ? "image" : "pdf";
    }

    const updateData: Partial<BudgetEntry> = {
      ...data,
      invoiceUrl: invoiceUrl || undefined,
      invoiceFileName: invoiceFileName || undefined,
      invoiceType: invoiceType || undefined,
      updatedAt: new Date().toISOString(),
    };

    // Remove undefined fields
    Object.keys(updateData).forEach(
      (key) =>
        updateData[key as keyof BudgetEntry] === undefined &&
        delete updateData[key as keyof BudgetEntry]
    );

    // Explicitly handle subCategory null/undefined logic if needed,
    // but BaseRepository.update handles partials.
    // However, if we want to UNSET subCategory, we might need to send null?
    // For now assuming update sends what is changed.

    return await this.entryRepo.update(entryId, updateData);
  }

  async deleteEntry(
    projectId: string,
    entryId: string,
    userId: string,
    email?: string
  ): Promise<void> {
    const access = await this.projectService.verifyAccess(
      projectId,
      userId,
      email
    );
    if (!access.hasAccess) throw new Error("Access denied");
    if (access.role === "viewer")
      throw new Error("Viewers cannot delete entries");

    const entry = await this.entryRepo.getById(entryId);
    if (!entry) throw new Error("Entry not found");

    if (entry.invoiceUrl) {
      try {
        const bucket = adminStorage.bucket();
        const urlParts = entry.invoiceUrl.split("/");
        const fileName = urlParts.slice(-3).join("/");
        await bucket.file(fileName).delete();
      } catch (err) {
        console.error("Error deleting invoice file:", err);
      }
    }

    await this.entryRepo.delete(entryId);
  }
}
