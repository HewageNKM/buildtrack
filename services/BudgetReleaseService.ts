import { BudgetReleaseRepository } from "@/repositories/BudgetReleaseRepository";
import { ProjectRepository } from "@/repositories/ProjectRepository";
import { BudgetRelease } from "@/types";

export class BudgetReleaseService {
  private releaseRepo: BudgetReleaseRepository;
  private projectRepo: ProjectRepository;

  constructor() {
    this.releaseRepo = new BudgetReleaseRepository();
    this.projectRepo = new ProjectRepository();
  }

  async createRelease(
    projectId: string,
    userId: string,
    data: Omit<BudgetRelease, "id" | "createdAt" | "createdBy">,
    userEmail?: string
  ): Promise<BudgetRelease> {
    // 1. Verify project access (basic check)
    const project = await this.projectRepo.getById(projectId);
    if (!project) throw new Error("Project not found");

    if (project.userId !== userId) {
      // In a real app, check team permissions more granularly
      // For now, assuming only owner or editors can release funds

      const isMember = project.teamMembers?.some(
        (m) =>
          (m.userId === userId || (userEmail && m.email === userEmail)) &&
          (m.role === "owner" || m.role === "editor")
      );
      if (!isMember) {
        console.error("Release auth failed for user:", userId, userEmail);
        throw new Error("Unauthorized to release funds");
      }
    }

    // 2. Validate against Estimated Budget
    const currentReleases = await this.releaseRepo.getReleasesByProject(
      projectId
    );
    const totalReleased = currentReleases.reduce((sum, r) => sum + r.amount, 0);
    const newTotal = totalReleased + data.amount;

    if (newTotal > project.estimatedBudget) {
      throw new Error(
        `Cannot release funds. Total released (${newTotal}) would exceed estimated budget (${project.estimatedBudget}).`
      );
    }

    // 3. Create Release
    return await this.releaseRepo.create({
      ...data,
      projectId,
      createdBy: userId,
      createdAt: new Date().toISOString(),
    } as any);
  }

  async getProjectReleases(projectId: string): Promise<{
    releases: BudgetRelease[];
    totalReleased: number;
  }> {
    const releases = await this.releaseRepo.getReleasesByProject(projectId);
    const totalReleased = releases.reduce((sum, r) => sum + r.amount, 0);
    return { releases, totalReleased };
  }

  async deleteRelease(
    releaseId: string,
    projectId: string,
    userId: string,
    userEmail?: string
  ): Promise<void> {
    const project = await this.projectRepo.getById(projectId);
    if (!project) throw new Error("Project not found");

    // Only allow owner or authorized members
    if (project.userId !== userId) {
      const isPrivileged = project.teamMembers?.some(
        (m) =>
          (m.userId === userId || (userEmail && m.email === userEmail)) &&
          (m.role === "owner" || m.role === "editor")
      );
      if (!isPrivileged) throw new Error("Unauthorized");
    }

    await this.releaseRepo.delete(releaseId);
  }
}
