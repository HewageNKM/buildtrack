import api from "@/lib/axios";
import { AnalyticsData } from "@/services/ReportsService";

export const analyticsApi = {
  getAnalyticsData: async (projectId: string): Promise<AnalyticsData> => {
    const response = await api.get(`/projects/${projectId}/analytics`);
    return response.data;
  },
};
