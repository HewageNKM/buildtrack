import { BaseRepository } from "./BaseRepository";
import { ProjectCategory } from "@/types";

export class CategoryRepository extends BaseRepository<ProjectCategory> {
  constructor() {
    super("categories");
  }

  async getByProjectId(projectId: string): Promise<ProjectCategory[]> {
    const snapshot = await this.collection
      .where("projectId", "==", projectId)
      .where("isDeleted", "==", false)
      .get();

    return snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as ProjectCategory)
    );
  }

  // Fetch all including deleted for potential restoration or history views
  async getAllByProjectId(projectId: string): Promise<ProjectCategory[]> {
    const snapshot = await this.collection
      .where("projectId", "==", projectId)
      .get();

    return snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as ProjectCategory)
    );
  }
}
