import { ProjectRepository } from "@/repositories/ProjectRepository";
import { InviteRepository } from "@/repositories/InviteRepository";
import { ProjectService } from "./ProjectService";
import { TeamMemberRole, TeamMember } from "@/types";
import { adminAuth } from "@/lib/firebase/admin";

export class TeamService {
  private projectRepo: ProjectRepository;
  private inviteRepo: InviteRepository;
  private projectService: ProjectService;

  constructor() {
    this.projectRepo = new ProjectRepository();
    this.inviteRepo = new InviteRepository();
    this.projectService = new ProjectService();
  }

  async inviteMember(
    projectId: string,
    invitedByUserId: string,
    invitedByEmail: string,
    email: string,
    role: TeamMemberRole
  ) {
    const access = await this.projectService.verifyAccess(
      projectId,
      invitedByUserId
    );
    if (!access.isOwner) {
      throw new Error("Only project owner can invite members");
    }

    const project = await this.projectService.getProject(
      projectId,
      invitedByUserId
    );
    if (!project) throw new Error("Project not found");

    // Check if already a member
    if (
      project.teamMembers?.some(
        (m) => m.email.toLowerCase() === email.toLowerCase()
      )
    ) {
      throw new Error("User is already a team member");
    }

    // Try to find user
    let invitedUserId = "";
    try {
      const user = await adminAuth.getUserByEmail(email);
      invitedUserId = user.uid;
    } catch {
      // User not found
    }

    const newMember: TeamMember = {
      userId: invitedUserId,
      email: email.toLowerCase(),
      role,
      joinedAt: new Date().toISOString(),
    };

    await this.projectRepo.addTeamMember(projectId, newMember);

    // Create invite record
    await this.inviteRepo.create({
      projectId,
      projectName: project.name,
      invitedEmail: email.toLowerCase(),
      invitedBy: invitedByUserId,
      invitedByName: invitedByEmail, // Ideally, pass name
      role,
      status: invitedUserId ? "accepted" : "pending",
      createdAt: new Date().toISOString(),
    });

    return newMember;
  }

  async removeMember(
    projectId: string,
    currentUserId: string,
    memberIdOrEmail: string
  ) {
    const access = await this.projectService.verifyAccess(
      projectId,
      currentUserId
    );
    if (!access.isOwner) {
      throw new Error("Only project owner can remove members");
    }

    await this.projectRepo.removeTeamMember(projectId, memberIdOrEmail);
  }

  async updateRole(
    projectId: string,
    currentUserId: string,
    memberIdOrEmail: string,
    newRole: TeamMemberRole
  ) {
    const access = await this.projectService.verifyAccess(
      projectId,
      currentUserId
    );
    if (!access.isOwner) {
      throw new Error("Only project owner can update roles");
    }

    await this.projectRepo.updateMemberRole(
      projectId,
      memberIdOrEmail,
      newRole
    );
  }
}
