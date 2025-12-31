import { adminDb } from "@/lib/firebase/admin";
import {
  DocumentData,
  Firestore,
  Query,
  CollectionReference,
} from "firebase-admin/firestore";

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
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as T));
  }

  async getById(id: string): Promise<T | null> {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as T;
  }

  async create(data: Omit<T, "id">): Promise<T> {
    const docRef = await this.collection.add({
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return { id: docRef.id, ...data } as T;
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    await this.collection.doc(id).update({
      ...data,
      updatedAt: new Date().toISOString(),
    });
    const updated = await this.getById(id);
    if (!updated) throw new Error("Document not found after update");
    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.collection.doc(id).delete();
  }
}
