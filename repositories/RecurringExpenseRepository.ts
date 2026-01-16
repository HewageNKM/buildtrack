import { adminDb } from "@/lib/firebase/admin";
import { RecurringExpense } from "@/types";

export class RecurringExpenseRepository {
  private getCollection(projectId: string) {
    return adminDb
      .collection("projects")
      .doc(projectId)
      .collection("recurringExpenses");
  }

  async getByProjectId(projectId: string): Promise<RecurringExpense[]> {
    const snapshot = await this.getCollection(projectId)
      .where("isActive", "==", true)
      .orderBy("nextDueDate")
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as RecurringExpense[];
  }

  async getById(
    projectId: string,
    expenseId: string
  ): Promise<RecurringExpense | null> {
    const doc = await this.getCollection(projectId).doc(expenseId).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as RecurringExpense;
  }

  async create(
    projectId: string,
    data: Omit<RecurringExpense, "id">
  ): Promise<RecurringExpense> {
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
    } as RecurringExpense;
  }

  async update(
    projectId: string,
    expenseId: string,
    data: Partial<RecurringExpense>
  ): Promise<RecurringExpense> {
    const now = new Date().toISOString();
    await this.getCollection(projectId)
      .doc(expenseId)
      .update({
        ...data,
        updatedAt: now,
      });
    const updated = await this.getById(projectId, expenseId);
    if (!updated) throw new Error("Recurring expense not found after update");
    return updated;
  }

  async delete(projectId: string, expenseId: string): Promise<void> {
    await this.getCollection(projectId).doc(expenseId).update({
      isActive: false,
      updatedAt: new Date().toISOString(),
    });
  }

  async getDueExpenses(projectId: string): Promise<RecurringExpense[]> {
    const today = new Date().toISOString().split("T")[0];
    const snapshot = await this.getCollection(projectId)
      .where("isActive", "==", true)
      .where("nextDueDate", "<=", today)
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as RecurringExpense[];
  }
}
