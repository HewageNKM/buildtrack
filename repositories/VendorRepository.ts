import { adminDb } from "@/lib/firebase/admin";
import { Vendor } from "@/types";

export class VendorRepository {
  private getCollection(projectId: string) {
    return adminDb.collection("projects").doc(projectId).collection("vendors");
  }

  async getByProjectId(projectId: string): Promise<Vendor[]> {
    const snapshot = await this.getCollection(projectId)
      .where("isActive", "==", true)
      .orderBy("name")
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Vendor[];
  }

  async getById(projectId: string, vendorId: string): Promise<Vendor | null> {
    const doc = await this.getCollection(projectId).doc(vendorId).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as Vendor;
  }

  async create(projectId: string, data: Omit<Vendor, "id">): Promise<Vendor> {
    const now = new Date().toISOString();
    const docRef = await this.getCollection(projectId).add({
      ...data,
      createdAt: now,
      updatedAt: now,
    });
    return { id: docRef.id, ...data, createdAt: now, updatedAt: now } as Vendor;
  }

  async update(
    projectId: string,
    vendorId: string,
    data: Partial<Vendor>
  ): Promise<Vendor> {
    const now = new Date().toISOString();
    await this.getCollection(projectId)
      .doc(vendorId)
      .update({
        ...data,
        updatedAt: now,
      });
    const updated = await this.getById(projectId, vendorId);
    if (!updated) throw new Error("Vendor not found after update");
    return updated;
  }

  async delete(projectId: string, vendorId: string): Promise<void> {
    // Soft delete
    await this.getCollection(projectId).doc(vendorId).update({
      isActive: false,
      updatedAt: new Date().toISOString(),
    });
  }
}
