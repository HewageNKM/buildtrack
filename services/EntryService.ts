import { EntryRepository } from "@/repositories/EntryRepository";
import { ProjectService } from "./ProjectService";
import { BudgetEntry, BudgetEntryItem } from "@/types";
import { CompressionService } from "./CompressionService";
import { StorageService } from "./StorageService";

export class EntryService {
  private entryRepo: EntryRepository;
  private projectService: ProjectService;
  private compressionService: CompressionService;
  private storageService: StorageService;

  constructor() {
    this.entryRepo = new EntryRepository();
    this.projectService = new ProjectService();
    this.compressionService = new CompressionService();
    this.storageService = new StorageService();
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

    const entries = await this.entryRepo.getByProjectId(
      projectId,
      limit,
      cursor,
      startDate,
      endDate
    );

    // Generate signed URLs for private files
    const entriesWithUrls = await Promise.all(
      entries.map(async (entry) => {
        if (entry.storagePath) {
          const url = await this.storageService.getSignedUrl(entry.storagePath);
          return url ? { ...entry, invoiceUrl: url } : entry;
        }
        return entry;
      })
    );

    return entriesWithUrls;
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
      items?: BudgetEntryItem[];
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

    let storagePath: string | undefined;
    let invoiceFileName: string | undefined;
    let invoiceType: "image" | "pdf" | undefined;

    if (file) {
      const fileName = `invoices/${Date.now()}-${file.name}`;

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

      await this.storageService.uploadFile(fileName, fileBuffer, contentType);

      // Do not make public, store storage path
      storagePath = fileName;
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
      items: data.items || undefined,
      invoiceUrl: undefined,
      storagePath: storagePath || undefined,
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
      note?: string; // Reason for update
      items?: BudgetEntryItem[];
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

    let storagePath = existingEntry.storagePath;
    let invoiceFileName = existingEntry.invoiceFileName;
    let invoiceType = existingEntry.invoiceType;

    // Handle new file upload if provided
    if (file) {
      // Delete old file if exists
      if (existingEntry.storagePath) {
        await this.storageService.deleteFile(existingEntry.storagePath);
      } else if (existingEntry.invoiceUrl) {
        // Fallback for old entries without storagePath
        try {
          const urlParts = existingEntry.invoiceUrl.split("/");
          const oldFileName = urlParts.slice(-3).join("/");
          await this.storageService.deleteFile(oldFileName);
        } catch (err) {
          console.error("Error deleting old invoice file:", err);
        }
      }

      // Upload new file
      const fileName = `invoices/${Date.now()}-${file.name}`;

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

      await this.storageService.uploadFile(fileName, fileBuffer, contentType);

      // Do not make public, store path
      storagePath = fileName;
      invoiceFileName = file.name;
      invoiceType = file.type.startsWith("image/") ? "image" : "pdf";
    }

    // Create version snapshot from CURRENT state (before update)
    const versionSnapshot: Partial<BudgetEntry> = {
      category: existingEntry.category,
      subCategory: existingEntry.subCategory,
      description: existingEntry.description,
      amount: existingEntry.amount,
      date: existingEntry.date,
      invoiceFileName: existingEntry.invoiceFileName,
      invoiceType: existingEntry.invoiceType,
      storagePath: existingEntry.storagePath,
      items: existingEntry.items,
    };

    const newVersion = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      changedBy: userId,
      note: data.note || "Update",
      snapshot: versionSnapshot,
    };

    const updatedHistory = [...(existingEntry.history || []), newVersion];

    const finalUpdateData: Partial<BudgetEntry> = {
      ...data,
      invoiceUrl: undefined,
      storagePath: storagePath || undefined,
      invoiceFileName: invoiceFileName || undefined,
      invoiceType: invoiceType || undefined,
      updatedAt: new Date().toISOString(),
      history: updatedHistory,
    };

    // Remove undefined fields
    Object.keys(finalUpdateData).forEach((key) => {
      if (key === "note") delete finalUpdateData[key as keyof BudgetEntry]; // Don't save note in top-level
      if (finalUpdateData[key as keyof BudgetEntry] === undefined)
        delete finalUpdateData[key as keyof BudgetEntry];
    });

    // Explicitly handle subCategory null/undefined logic if needed,
    // but BaseRepository.update handles partials.
    // However, if we want to UNSET subCategory, we might need to send null?
    // For now assuming update sends what is changed.

    return await this.entryRepo.update(entryId, finalUpdateData);
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

    if (entry.storagePath) {
      await this.storageService.deleteFile(entry.storagePath);
    } else if (entry.invoiceUrl) {
      try {
        const urlParts = entry.invoiceUrl.split("/");
        const fileName = urlParts.slice(-3).join("/");
        await this.storageService.deleteFile(fileName);
      } catch (err) {
        console.error("Error deleting invoice file:", err);
      }
    }

    await this.entryRepo.delete(entryId);
  }
}
