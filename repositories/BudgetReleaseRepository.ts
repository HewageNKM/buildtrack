import { BaseRepository } from "./BaseRepository";
import { BudgetRelease } from "@/types";

export class BudgetReleaseRepository extends BaseRepository<BudgetRelease> {
  constructor() {
    super("budget_releases");
  }

  async getTotalReleased(projectId: string): Promise<number> {
    const releases = await this.getReleasesByProject(projectId);
    return releases.reduce((sum, release) => sum + (release.amount || 0), 0);
  }
}
