import api from "@/lib/axios";
import { RecurringExpense } from "@/types";

export const recurringApi = {
  list: async (projectId: string): Promise<RecurringExpense[]> => {
    const response = await api.get(`/projects/${projectId}/recurring`);
    return response.data;
  },

  create: async (
    projectId: string,
    data: Omit<
      RecurringExpense,
      "id" | "projectId" | "createdBy" | "createdAt" | "updatedAt" | "isActive"
    >
  ): Promise<RecurringExpense> => {
    const response = await api.post(`/projects/${projectId}/recurring`, data);
    return response.data;
  },

  update: async (
    projectId: string,
    expenseId: string,
    data: Partial<RecurringExpense>
  ): Promise<RecurringExpense> => {
    const response = await api.put(
      `/projects/${projectId}/recurring/${expenseId}`,
      data
    );
    return response.data;
  },

  delete: async (projectId: string, expenseId: string): Promise<void> => {
    await api.delete(`/projects/${projectId}/recurring/${expenseId}`);
  },
};
