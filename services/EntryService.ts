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
      category: any;
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
      description: data.description,
      amount: data.amount,
      date: data.date,
      invoiceUrl,
      invoiceFileName,
      invoiceType,
      addedBy: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return await this.entryRepo.create(entryData);
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
