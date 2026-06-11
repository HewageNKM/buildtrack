import api from "@/lib/axios";
import { ReportData, CategorySummary } from "@/services/ReportsService";

export interface ReportResponse {
  reportData: ReportData;
  categorySummary: CategorySummary[];
}

export const reportsApi = {
  getReportData: async (
    projectId: string,
    startDate?: string,
    endDate?: string
  ): Promise<ReportResponse> => {
    const params = new URLSearchParams();
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);

    const response = await api.get(
      `/projects/${projectId}/reports?${params.toString()}`
    );
    return response.data;
  },
};
