import { BaseRepository } from "./BaseRepository";
import { ProjectInvite } from "@/types";

export class InviteRepository extends BaseRepository<ProjectInvite> {
  constructor() {
    super("invites");
  }

  async getPendingByEmail(email: string): Promise<ProjectInvite[]> {
    const snapshot = await this.collection
      .where("invitedEmail", "==", email.toLowerCase())
      .where("status", "==", "pending")
      .get();

    return snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as ProjectInvite)
    );
  }

  async getByProjectId(projectId: string): Promise<ProjectInvite[]> {
    const snapshot = await this.collection
      .where("projectId", "==", projectId)
      .get();

    return snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as ProjectInvite)
    );
  }
}
