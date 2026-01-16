import { adminDb } from "@/lib/firebase/admin";
import { EntryComment } from "@/types";

export class CommentRepository {
  private getCommentsCollection(projectId: string, entryId: string) {
    return adminDb
      .collection("projects")
      .doc(projectId)
      .collection("entries")
      .doc(entryId)
      .collection("comments");
  }

  async getByEntryId(
    projectId: string,
    entryId: string
  ): Promise<EntryComment[]> {
    const snapshot = await this.getCommentsCollection(projectId, entryId)
      .orderBy("createdAt", "desc")
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as EntryComment[];
  }

  async create(
    projectId: string,
    entryId: string,
    data: Omit<EntryComment, "id">
  ): Promise<EntryComment> {
    const docRef = await this.getCommentsCollection(projectId, entryId).add({
      ...data,
      createdAt: new Date().toISOString(),
    });

    return { id: docRef.id, ...data } as EntryComment;
  }

  async delete(
    projectId: string,
    entryId: string,
    commentId: string
  ): Promise<void> {
    await this.getCommentsCollection(projectId, entryId)
      .doc(commentId)
      .delete();
  }
}
