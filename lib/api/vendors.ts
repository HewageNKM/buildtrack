import api from "@/lib/axios";
import { Vendor } from "@/types";

export const vendorsApi = {
  list: async (projectId: string): Promise<Vendor[]> => {
    const response = await api.get(`/projects/${projectId}/vendors`);
    return response.data;
  },

  create: async (
    projectId: string,
    data: Omit<Vendor, "id" | "projectId" | "createdAt" | "updatedAt">
  ): Promise<Vendor> => {
    const response = await api.post(`/projects/${projectId}/vendors`, data);
    return response.data;
  },

  update: async (
    projectId: string,
    vendorId: string,
    data: Partial<Vendor>
  ): Promise<Vendor> => {
    const response = await api.put(
      `/projects/${projectId}/vendors/${vendorId}`,
      data
    );
    return response.data;
  },

  delete: async (projectId: string, vendorId: string): Promise<void> => {
    await api.delete(`/projects/${projectId}/vendors/${vendorId}`);
  },
};
