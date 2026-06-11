import api from "@/lib/axios";
import { EntryComment } from "@/types";

export const commentsApi = {
  list: async (projectId: string, entryId: string): Promise<EntryComment[]> => {
    const response = await api.get(
      `/projects/${projectId}/entries/${entryId}/comments`
    );
    return response.data;
  },

  create: async (
    projectId: string,
    entryId: string,
    content: string
  ): Promise<EntryComment> => {
    const response = await api.post(
      `/projects/${projectId}/entries/${entryId}/comments`,
      { content }
    );
    return response.data;
  },

  delete: async (
    projectId: string,
    entryId: string,
    commentId: string
  ): Promise<void> => {
    await api.delete(
      `/projects/${projectId}/entries/${entryId}/comments/${commentId}`
    );
  },
};
