import api from "@/lib/axios";
import { ProjectCategory } from "@/types";

export const categoriesApi = {
  list: async (projectId: string): Promise<ProjectCategory[]> => {
    const response = await api.get(`/projects/${projectId}/categories`);
    return response.data;
  },

  create: async (
    projectId: string,
    data: {
      name: string;
      type: "category" | "subcategory";
      parentId?: string;
      color?: string;
      hasSubCategories?: boolean;
    }
  ): Promise<ProjectCategory> => {
    const response = await api.post(`/projects/${projectId}/categories`, data);
    return response.data;
  },

  update: async (
    projectId: string,
    categoryId: string,
    data: {
      name?: string;
      color?: string;
      hasSubCategories?: boolean;
    }
  ): Promise<ProjectCategory> => {
    const response = await api.put(
      `/projects/${projectId}/categories/${categoryId}`,
      data
    );
    return response.data;
  },

  delete: async (projectId: string, categoryId: string): Promise<void> => {
    await api.delete(`/projects/${projectId}/categories/${categoryId}`);
  },
};
