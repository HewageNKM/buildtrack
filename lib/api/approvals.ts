import api from "@/lib/axios";
import { BudgetEntry } from "@/types";

export interface ApprovalResult {
  success: boolean;
  entry: BudgetEntry;
  message: string;
}

export interface ApprovalStats {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}

export const approvalsApi = {
  list: async (
    projectId: string,
    includeStats = false
  ): Promise<{ pending: BudgetEntry[]; stats?: ApprovalStats }> => {
    const response = await api.get(
      `/projects/${projectId}/approvals?stats=${includeStats}`
    );
    return response.data;
  },

  approve: async (
    projectId: string,
    entryId: string
  ): Promise<ApprovalResult> => {
    const response = await api.post(
      `/projects/${projectId}/entries/${entryId}/approve`,
      { action: "approve" }
    );
    return response.data;
  },

  reject: async (
    projectId: string,
    entryId: string,
    rejectionReason?: string
  ): Promise<ApprovalResult> => {
    const response = await api.post(
      `/projects/${projectId}/entries/${entryId}/approve`,
      { action: "reject", rejectionReason }
    );
    return response.data;
  },
};
