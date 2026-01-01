import api from "@/lib/axios";
import { BudgetRelease } from "@/types";

export const releasesApi = {
  list: async (projectId: string) => {
    const response = await api.get<{
      releases: BudgetRelease[];
      totalReleased: number;
    }>(`/projects/${projectId}/releases`);
    return response.data;
  },

  create: async (
    projectId: string,
    data: { amount: number; date: string; note?: string }
  ) => {
    const response = await api.post<{ release: BudgetRelease }>(
      `/projects/${projectId}/releases`,
      data
    );
    return response.data.release;
  },

  delete: async (projectId: string, releaseId: string) => {
    await api.delete(`/projects/${projectId}/releases/${releaseId}`);
  },
};
