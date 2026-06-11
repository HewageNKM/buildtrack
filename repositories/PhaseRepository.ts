import { adminDb } from "@/lib/firebase/admin";
import { ProjectPhase } from "@/types";

export class PhaseRepository {
  private getCollection(projectId: string) {
    return adminDb.collection("projects").doc(projectId).collection("phases");
  }

  async getByProjectId(projectId: string): Promise<ProjectPhase[]> {
    const snapshot = await this.getCollection(projectId).orderBy("order").get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as ProjectPhase[];
  }

  async getById(
    projectId: string,
    phaseId: string
  ): Promise<ProjectPhase | null> {
    const doc = await this.getCollection(projectId).doc(phaseId).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as ProjectPhase;
  }

  async create(
    projectId: string,
    data: Omit<ProjectPhase, "id">
  ): Promise<ProjectPhase> {
    const now = new Date().toISOString();
    const docRef = await this.getCollection(projectId).add({
      ...data,
      createdAt: now,
      updatedAt: now,
    });
    return {
      id: docRef.id,
      ...data,
      createdAt: now,
      updatedAt: now,
    } as ProjectPhase;
  }

  async update(
    projectId: string,
    phaseId: string,
    data: Partial<ProjectPhase>
  ): Promise<ProjectPhase> {
    const now = new Date().toISOString();
    await this.getCollection(projectId)
      .doc(phaseId)
      .update({
        ...data,
        updatedAt: now,
      });
    const updated = await this.getById(projectId, phaseId);
    if (!updated) throw new Error("Phase not found after update");
    return updated;
  }

  async delete(projectId: string, phaseId: string): Promise<void> {
    await this.getCollection(projectId).doc(phaseId).delete();
  }

  async getNextOrder(projectId: string): Promise<number> {
    const phases = await this.getByProjectId(projectId);
    if (phases.length === 0) return 1;
    return Math.max(...phases.map((p) => p.order)) + 1;
  }
}
