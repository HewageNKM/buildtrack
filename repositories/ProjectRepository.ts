import { BaseRepository } from "./BaseRepository";
import { Project, TeamMember } from "@/types";

export class ProjectRepository extends BaseRepository<Project> {
  constructor() {
    super("projects");
  }

  async getProjectsForUser(
    userId: string,
    email?: string
  ): Promise<{ owned: Project[]; shared: Project[] }> {
    // Get owned projects
    const ownedSnapshot = await this.collection
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .get();

    const owned = ownedSnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as Project)
    );

    // Get shared projects (filtered in memory as Firestore array-contains object is limited)
    // Ideally, we'd have a separate 'memberships' collection for scalable queries
    const allSnapshot = await this.collection
      .orderBy("createdAt", "desc")
      .get();

    const shared: Project[] = [];

    if (email) {
      allSnapshot.docs.forEach((doc) => {
        const data = doc.data() as Project;
        if (data.userId === userId) return; // Skip owned

        const isMember = data.teamMembers?.some(
          (m) => m.userId === userId || m.email === email.toLowerCase()
        );

        if (isMember) {
          shared.push({ ...data, id: doc.id });
        }
      });
    }

    return { owned, shared };
  }

  async addTeamMember(projectId: string, member: TeamMember): Promise<void> {
    const project = await this.getById(projectId);
    if (!project) throw new Error("Project not found");

    const teamMembers = project.teamMembers || [];
    teamMembers.push(member);

    await this.update(projectId, { teamMembers });
  }

  async removeTeamMember(
    projectId: string,
    userIdOrEmail: string
  ): Promise<void> {
    const project = await this.getById(projectId);
    if (!project) throw new Error("Project not found");

    const teamMembers = project.teamMembers || [];
    const updatedMembers = teamMembers.filter(
      (m) => m.userId !== userIdOrEmail && m.email !== userIdOrEmail
    );

    await this.update(projectId, { teamMembers: updatedMembers });
  }

  async updateMemberRole(
    projectId: string,
    userIdOrEmail: string,
    role: TeamMember["role"]
  ): Promise<void> {
    const project = await this.getById(projectId);
    if (!project) throw new Error("Project not found");

    const teamMembers = project.teamMembers || [];
    const index = teamMembers.findIndex(
      (m) => m.userId === userIdOrEmail || m.email === userIdOrEmail
    );

    if (index === -1) throw new Error("Member not found");

    teamMembers[index].role = role;
    await this.update(projectId, { teamMembers });
  }
}
