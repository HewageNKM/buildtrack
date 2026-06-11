import { BaseRepository } from "./BaseRepository";
import { BudgetRelease } from "@/types";

export class BudgetReleaseRepository extends BaseRepository<BudgetRelease> {
  constructor() {
    super("budget_releases");
  }

  async getReleasesByProject(projectId: string): Promise<BudgetRelease[]> {
    const snapshot = await this.collection
      .where("projectId", "==", projectId)
      .orderBy("date", "desc")
      .get();
    return snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as BudgetRelease)
    );
  }

  async getTotalReleased(projectId: string): Promise<number> {
    const releases = await this.getReleasesByProject(projectId);
    return releases.reduce((sum, release) => sum + (release.amount || 0), 0);
  }
}
