import { BaseRepository } from "./BaseRepository";
import { BudgetEntry } from "@/types";

export class EntryRepository extends BaseRepository<BudgetEntry> {
  constructor() {
    super("entries");
  }

  async getByProjectId(
    projectId: string,
    limit?: number,
    lastVisible?: { date: string; id: string },
    startDate?: string,
    endDate?: string,
  ): Promise<BudgetEntry[]> {
    let query = this.collection.where("projectId", "==", projectId);

    if (startDate) {
      query = query.where("date", ">=", startDate);
    }

    if (endDate) {
      query = query.where("date", "<=", endDate);
    }

    query = query.orderBy("date", "desc").orderBy("__name__", "desc"); // Use document ID as secondary sort for stability

    if (lastVisible) {
      query = query.startAfter(lastVisible.date, lastVisible.id);
    }

    if (limit) {
      query = query.limit(limit);
    }

    const snapshot = await query.get();

    return snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as BudgetEntry,
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
    return entries.reduce((sum, entry) => {
      const entryTotal =
        entry.items && entry.items.length > 0
          ? entry.items.reduce(
              (itemSum, item) => itemSum + (item.amount || 0) * (item.qty || 1),
              0,
            )
          : entry.amount || 0;
      return sum + entryTotal;
    }, 0);
  }

  async getProjectStats(
    projectId: string,
  ): Promise<{ totalSpent: number; entryCount: number }> {
    const entries = await this.getByProjectId(projectId);
    const totalSpent = entries.reduce((sum, entry) => {
      const entryTotal =
        entry.items && entry.items.length > 0
          ? entry.items.reduce(
              (itemSum, item) => itemSum + (item.amount || 0) * (item.qty || 1),
              0,
            )
          : entry.amount || 0;
      return sum + entryTotal;
    }, 0);
    return { totalSpent, entryCount: entries.length };
  }
}
