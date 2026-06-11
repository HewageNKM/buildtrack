import { RecurringExpenseRepository } from "@/repositories/RecurringExpenseRepository";
import { EntryRepository } from "@/repositories/EntryRepository";
import { ProjectService } from "./ProjectService";
import { RecurringExpense, BudgetEntry } from "@/types";

export class RecurringExpenseService {
  private recurringRepo: RecurringExpenseRepository;
  private entryRepo: EntryRepository;
  private projectService: ProjectService;

  constructor() {
    this.recurringRepo = new RecurringExpenseRepository();
    this.entryRepo = new EntryRepository();
    this.projectService = new ProjectService();
  }

  async getRecurringExpenses(
    projectId: string,
    userId: string,
    email?: string,
  ): Promise<RecurringExpense[]> {
    const access = await this.projectService.verifyAccess(
      projectId,
      userId,
      email,
    );
    if (!access.hasAccess) throw new Error("Access denied");

    return await this.recurringRepo.getByProjectId(projectId);
  }

  async createRecurringExpense(
    projectId: string,
    userId: string,
    email: string | undefined,
    data: Omit<
      RecurringExpense,
      "id" | "projectId" | "createdBy" | "createdAt" | "updatedAt" | "isActive"
    >,
  ): Promise<RecurringExpense> {
    const access = await this.projectService.verifyAccess(
      projectId,
      userId,
      email,
    );
    if (!access.hasAccess) throw new Error("Access denied");
    if (access.role === "viewer")
      throw new Error("Viewers cannot create recurring expenses");

    const expense: Omit<RecurringExpense, "id"> = {
      ...data,
      projectId,
      createdBy: userId,
      isActive: true,
      createdAt: "",
      updatedAt: "",
    };

    return await this.recurringRepo.create(projectId, expense);
  }

  async updateRecurringExpense(
    projectId: string,
    expenseId: string,
    userId: string,
    email: string | undefined,
    data: Partial<RecurringExpense>,
  ): Promise<RecurringExpense> {
    const access = await this.projectService.verifyAccess(
      projectId,
      userId,
      email,
    );
    if (!access.hasAccess) throw new Error("Access denied");
    if (access.role === "viewer")
      throw new Error("Viewers cannot update recurring expenses");

    return await this.recurringRepo.update(projectId, expenseId, data);
  }

  async deleteRecurringExpense(
    projectId: string,
    expenseId: string,
    userId: string,
    email?: string,
  ): Promise<void> {
    const access = await this.projectService.verifyAccess(
      projectId,
      userId,
      email,
    );
    if (!access.hasAccess) throw new Error("Access denied");
    if (access.role === "viewer")
      throw new Error("Viewers cannot delete recurring expenses");

    await this.recurringRepo.delete(projectId, expenseId);
  }

  /**
   * Process due recurring expenses and create entries
   * This should be called by a scheduled job
   */
  async processDueExpenses(projectId: string): Promise<{ processed: number }> {
    const dueExpenses = await this.recurringRepo.getDueExpenses(projectId);
    let processed = 0;

    for (const expense of dueExpenses) {
      // Create a new entry
      const entryData: Omit<BudgetEntry, "id"> = {
        projectId,
        amount: expense.amount,
        date: expense.nextDueDate,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        addedBy: expense.createdBy,
        items: [
          {
            id: `${Date.now()}`,
            description: expense.name,
            amount: expense.amount,
            qty: 1,
            category: expense.category,
            subCategory: expense.subCategory,
          },
        ],
      };

      await this.entryRepo.create(entryData);

      // Calculate next due date
      const nextDueDate = this.calculateNextDueDate(
        expense.nextDueDate,
        expense.frequency,
      );

      // Update the recurring expense
      await this.recurringRepo.update(projectId, expense.id, {
        nextDueDate,
        lastProcessed: new Date().toISOString(),
      });

      processed++;
    }

    return { processed };
  }

  private calculateNextDueDate(
    currentDate: string,
    frequency: RecurringExpense["frequency"],
  ): string {
    const date = new Date(currentDate);

    switch (frequency) {
      case "weekly":
        date.setDate(date.getDate() + 7);
        break;
      case "monthly":
        date.setMonth(date.getMonth() + 1);
        break;
      case "quarterly":
        date.setMonth(date.getMonth() + 3);
        break;
      case "yearly":
        date.setFullYear(date.getFullYear() + 1);
        break;
    }

    return date.toISOString().split("T")[0];
  }
}
