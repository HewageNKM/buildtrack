import api from "@/lib/axios";
import { ProjectPhase } from "@/types";

export const phasesApi = {
  list: async (projectId: string): Promise<ProjectPhase[]> => {
    const response = await api.get(`/projects/${projectId}/phases`);
    return response.data;
  },

  create: async (
    projectId: string,
    data: Omit<
      ProjectPhase,
      "id" | "projectId" | "order" | "createdAt" | "updatedAt"
    >
  ): Promise<ProjectPhase> => {
    const response = await api.post(`/projects/${projectId}/phases`, data);
    return response.data;
  },

  update: async (
    projectId: string,
    phaseId: string,
    data: Partial<ProjectPhase>
  ): Promise<ProjectPhase> => {
    const response = await api.put(
      `/projects/${projectId}/phases/${phaseId}`,
      data
    );
    return response.data;
  },

  delete: async (projectId: string, phaseId: string): Promise<void> => {
    await api.delete(`/projects/${projectId}/phases/${phaseId}`);
  },
};
