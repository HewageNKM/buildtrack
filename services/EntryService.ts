import { EntryRepository } from "@/repositories/EntryRepository";
import { ProjectService } from "./ProjectService";
import { BudgetEntry } from "@/types";
import { adminStorage } from "@/lib/firebase/admin";

export class EntryService {
  private entryRepo: EntryRepository;
  private projectService: ProjectService;

  constructor() {
    this.entryRepo = new EntryRepository();
    this.projectService = new ProjectService();
  }

  async getEntries(projectId: string, userId: string): Promise<BudgetEntry[]> {
    const access = await this.projectService.verifyAccess(projectId, userId);
    if (!access.hasAccess) throw new Error("Access denied");

    return await this.entryRepo.getByProjectId(projectId);
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
    const access = await this.projectService.verifyAccess(projectId, userId);
    if (!access.hasAccess) throw new Error("Access denied");

    if (access.role === "viewer") throw new Error("Viewers cannot add entries");

    let invoiceUrl: string | undefined;
    let invoiceFileName: string | undefined;
    let invoiceType: "image" | "pdf" | undefined;

    if (file) {
      const fileName = `invoices/${projectId}/${Date.now()}-${file.name}`;
      const bucket = adminStorage.bucket();
      const fileRef = bucket.file(fileName);

      await fileRef.save(file.buffer, {
        metadata: { contentType: file.type },
      });

      await fileRef.makePublic();
      invoiceUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
      invoiceFileName = file.name;
      invoiceType = file.type.startsWith("image/") ? "image" : "pdf";
    }

    const entryData = {
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

    return await this.entryRepo.create(entryData);
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
    file?: { buffer: Buffer; name: string; type: string }
  ): Promise<BudgetEntry> {
    const access = await this.projectService.verifyAccess(projectId, userId);
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

      await fileRef.save(file.buffer, {
        metadata: { contentType: file.type },
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
    userId: string
  ): Promise<void> {
    const access = await this.projectService.verifyAccess(projectId, userId);
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
