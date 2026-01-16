import { PhaseRepository } from "@/repositories/PhaseRepository";
import { ProjectService } from "./ProjectService";
import { ProjectPhase } from "@/types";

export class PhaseService {
  private phaseRepo: PhaseRepository;
  private projectService: ProjectService;

  constructor() {
    this.phaseRepo = new PhaseRepository();
    this.projectService = new ProjectService();
  }

  async getPhases(
    projectId: string,
    userId: string,
    email?: string
  ): Promise<ProjectPhase[]> {
    const access = await this.projectService.verifyAccess(
      projectId,
      userId,
      email
    );
    if (!access.hasAccess) throw new Error("Access denied");

    return await this.phaseRepo.getByProjectId(projectId);
  }

  async addPhase(
    projectId: string,
    userId: string,
    email: string | undefined,
    data: Omit<
      ProjectPhase,
      "id" | "projectId" | "order" | "createdAt" | "updatedAt"
    >
  ): Promise<ProjectPhase> {
    const access = await this.projectService.verifyAccess(
      projectId,
      userId,
      email
    );
    if (!access.hasAccess) throw new Error("Access denied");
    if (access.role === "viewer")
      throw new Error("Viewers cannot manage phases");

    const order = await this.phaseRepo.getNextOrder(projectId);
    const phase: Omit<ProjectPhase, "id"> = {
      ...data,
      projectId,
      order,
      createdAt: "",
      updatedAt: "",
    };

    return await this.phaseRepo.create(projectId, phase);
  }

  async updatePhase(
    projectId: string,
    phaseId: string,
    userId: string,
    email: string | undefined,
    data: Partial<ProjectPhase>
  ): Promise<ProjectPhase> {
    const access = await this.projectService.verifyAccess(
      projectId,
      userId,
      email
    );
    if (!access.hasAccess) throw new Error("Access denied");
    if (access.role === "viewer")
      throw new Error("Viewers cannot manage phases");

    const phase = await this.phaseRepo.getById(projectId, phaseId);
    if (!phase) throw new Error("Phase not found");

    return await this.phaseRepo.update(projectId, phaseId, data);
  }

  async deletePhase(
    projectId: string,
    phaseId: string,
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
      throw new Error("Viewers cannot manage phases");

    await this.phaseRepo.delete(projectId, phaseId);
  }
}
