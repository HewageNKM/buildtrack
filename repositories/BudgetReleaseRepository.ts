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
}
