import { adminDb } from "@/lib/firebase/admin";
import { Firestore, CollectionReference } from "firebase-admin/firestore";

export abstract class BaseRepository<T extends { id: string }> {
  protected collectionName: string;
  protected db: Firestore;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
    this.db = adminDb;
  }

  protected get collection(): CollectionReference {
    return this.db.collection(this.collectionName);
  }

  async getAll(): Promise<T[]> {
    const snapshot = await this.collection.get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as T);
  }

  async getById(id: string): Promise<T | null> {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as T;
  }

  async create(data: Omit<T, "id">): Promise<T> {
    const cleanData = removeUndefined({
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    const docRef = await this.collection.add(cleanData);
    return { id: docRef.id, ...data } as T;
  }

  async createWithId(id: string, data: Omit<T, "id">): Promise<T> {
    const cleanData = removeUndefined({
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    await this.collection.doc(id).set(cleanData);
    return { id, ...data } as T;
  }

  getNewId(): string {
    return this.collection.doc().id;
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    const cleanData = removeUndefined({
      ...data,
      updatedAt: new Date().toISOString(),
    });

    await this.collection.doc(id).update(cleanData);
    const updated = await this.getById(id);
    if (!updated) throw new Error("Document not found after update");
    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.collection.doc(id).delete();
  }
}

function removeUndefined(obj: any): any {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((v) => removeUndefined(v));
  }

  if (obj instanceof Date) {
    return obj;
  }

  return Object.entries(obj).reduce((acc, [key, value]) => {
    const cleaned = removeUndefined(value);
    if (cleaned !== undefined) {
      acc[key] = cleaned;
    }
    return acc;
  }, {} as any);
}
