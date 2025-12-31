import api from "@/lib/axios";
import { BudgetEntry, BudgetCategory } from "@/types";

export const entriesApi = {
  list: async (
    projectId: string,
    options?: {
      limit?: number;
      cursor?: { date: string; id: string };
      startDate?: string;
      endDate?: string;
    }
  ) => {
    let url = `/projects/${projectId}/entries`;
    const params = new URLSearchParams();

    if (options?.limit) params.append("limit", options.limit.toString());
    if (options?.cursor) {
      params.append("cursorDate", options.cursor.date);
      params.append("cursorId", options.cursor.id);
    }
    if (options?.startDate) params.append("startDate", options.startDate);
    if (options?.endDate) params.append("endDate", options.endDate);

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await api.get<{
      entries: BudgetEntry[];
      totalSpent: number;
      nextCursor?: { date: string; id: string } | null;
    }>(url);
    return response.data;
  },

  create: async (
    projectId: string,
    data: {
      category: BudgetCategory;
      subCategory?: string;
      description: string;
      amount: number;
      date: string;
      invoice?: File;
    }
  ) => {
    const formData = new FormData();
    formData.append("category", data.category);
    if (data.subCategory) {
      formData.append("subCategory", data.subCategory);
    }
    formData.append("description", data.description);
    formData.append("amount", data.amount.toString());
    formData.append("date", data.date);
    if (data.invoice) {
      formData.append("invoice", data.invoice);
    }

    const response = await api.post<{ entry: BudgetEntry }>(
      `/projects/${projectId}/entries`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data.entry;
  },

  update: async (
    projectId: string,
    entryId: string,
    data: {
      category?: BudgetCategory;
      subCategory?: string;
      description?: string;
      amount?: number;
      date?: string;
      invoice?: File;
    }
  ) => {
    const formData = new FormData();
    if (data.category) formData.append("category", data.category);
    if (data.subCategory) formData.append("subCategory", data.subCategory);
    if (data.description) formData.append("description", data.description);
    if (data.amount) formData.append("amount", data.amount.toString());
    if (data.date) formData.append("date", data.date);
    if (data.invoice) formData.append("invoice", data.invoice);

    const response = await api.put<{ entry: BudgetEntry }>(
      `/projects/${projectId}/entries?entryId=${entryId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data.entry;
  },

  delete: async (projectId: string, entryId: string) => {
    await api.delete(`/projects/${projectId}/entries?entryId=${entryId}`);
  },
};
