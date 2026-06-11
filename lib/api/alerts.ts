import api from "@/lib/axios";
import { BudgetAlert } from "@/types";

export interface AlertCheckResult {
  alerts: BudgetAlert[];
  hasWarnings: boolean;
  hasCriticals: boolean;
  summary: {
    critical: number;
    warning: number;
    info: number;
    total: number;
  };
}

export const alertsApi = {
  check: async (thresholds?: {
    nearThreshold?: number;
    criticalThreshold?: number;
  }): Promise<AlertCheckResult> => {
    const params = new URLSearchParams();
    if (thresholds?.nearThreshold) {
      params.set("nearThreshold", thresholds.nearThreshold.toString());
    }
    if (thresholds?.criticalThreshold) {
      params.set("criticalThreshold", thresholds.criticalThreshold.toString());
    }
    const response = await api.get(`/alerts?${params.toString()}`);
    return response.data;
  },
};
