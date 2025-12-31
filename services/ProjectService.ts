import { ProjectRepository } from "@/repositories/ProjectRepository";
import { Project, TeamMemberRole, TeamMember } from "@/types";

export class ProjectService {
  private projectRepo: ProjectRepository;

  constructor() {
    this.projectRepo = new ProjectRepository();
  }

  async createProject(
    userId: string,
    email: string,
    data: Partial<Project>
  ): Promise<Project> {
    const ownerMember: TeamMember = {
      userId,
      email,
      role: "owner",
      joinedAt: new Date().toISOString(),
    };

    const projectData = {
      ...data,
      userId,
      status: "active" as const,
      teamMembers: [ownerMember],
    };

    // Safe to cast as create handles omitting ID
    return await this.projectRepo.create(
      projectData as unknown as Omit<Project, "id">
    );
  }

  async getProjects(userId: string, email?: string) {
    return await this.projectRepo.getProjectsForUser(userId, email);
  }

  async getProject(projectId: string, userId: string): Promise<Project | null> {
    const project = await this.projectRepo.getById(projectId);
    if (!project) return null;

    const isOwner = project.userId === userId;
    const isMember = project.teamMembers?.some((m) => m.userId === userId);

    if (!isOwner && !isMember) return null;

    return project;
  }

  async updateProject(
    projectId: string,
    userId: string,
    data: Partial<Project>
  ): Promise<Project> {
    const project = await this.projectRepo.getById(projectId);
    if (!project) throw new Error("Project not found");

    if (project.userId !== userId) {
      throw new Error("Unauthorized: Only owner can update project");
    }

    // Filter allowed fields
    const safeData: Partial<Project> = {
      ...(data.name && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.estimatedBudget && { estimatedBudget: data.estimatedBudget }),
      ...(data.currency && { currency: data.currency }),
      ...(data.startDate && { startDate: data.startDate }),
      ...(data.endDate !== undefined && { endDate: data.endDate }),
    };

    return await this.projectRepo.update(projectId, safeData);
  }

  async deleteProject(projectId: string, userId: string): Promise<void> {
    const project = await this.projectRepo.getById(projectId);
    if (!project) throw new Error("Project not found");

    if (project.userId !== userId) {
      throw new Error("Unauthorized: Only owner can delete project");
    }

    await this.projectRepo.delete(projectId);
  }

  async verifyAccess(
    projectId: string,
    userId: string
  ): Promise<{
    hasAccess: boolean;
    role?: TeamMemberRole;
    isOwner: boolean;
  }> {
    const project = await this.projectRepo.getById(projectId);
    if (!project) return { hasAccess: false, isOwner: false };

    if (project.userId === userId) {
      return { hasAccess: true, role: "owner", isOwner: true };
    }

    const member = project.teamMembers?.find((m) => m.userId === userId);
    if (member) {
      return { hasAccess: true, role: member.role, isOwner: false };
    }

    return { hasAccess: false, isOwner: false };
  }
}
