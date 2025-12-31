import { BaseRepository } from "./BaseRepository";
import { BudgetEntry } from "@/types";

export class EntryRepository extends BaseRepository<BudgetEntry> {
  constructor() {
    super("entries");
  }

  async getByProjectId(projectId: string): Promise<BudgetEntry[]> {
    const snapshot = await this.collection
      .where("projectId", "==", projectId)
      .orderBy("date", "desc")
      .get();

    return snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as BudgetEntry)
    );
  }

  async deleteByProjectId(projectId: string): Promise<void> {
    const entries = await this.getByProjectId(projectId);
    const batch = this.db.batch();

    entries.forEach((entry) => {
      const ref = this.collection.doc(entry.id);
      batch.delete(ref);
    });

    await batch.commit();
  }

  async getProjectTotalSpent(projectId: string): Promise<number> {
    const entries = await this.getByProjectId(projectId);
    return entries.reduce((sum, entry) => sum + (entry.amount || 0), 0);
  }
}
