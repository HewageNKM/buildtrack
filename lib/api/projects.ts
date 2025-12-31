import api from "@/lib/axios";
import { Project, ProjectWithStats, CurrencyCode } from "@/types";

export const projectsApi = {
  list: async () => {
    const response = await api.get<{
      projects: ProjectWithStats[];
      total: number;
      owned: number;
      shared: number;
    }>("/projects");
    return response.data;
  },

  get: async (projectId: string) => {
    const response = await api.get<{ project: Project }>(
      `/projects/${projectId}`
    );
    return response.data.project;
  },

  create: async (data: {
    name: string;
    description: string;
    estimatedBudget: number;
    currency: CurrencyCode;
    startDate: string;
    endDate?: string;
  }) => {
    const response = await api.post("/projects", data);
    return response.data;
  },

  delete: async (projectId: string) => {
    await api.delete(`/projects/${projectId}`);
  },

  getTeam: async (projectId: string) => {
    const response = await api.get(`/projects/${projectId}/team`);
    return response.data;
  },
};
