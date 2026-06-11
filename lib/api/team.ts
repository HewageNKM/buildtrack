import api from "@/lib/axios";
import { TeamMemberRole, ProjectInvite } from "@/types";

export const teamApi = {
  invite: async (projectId: string, email: string, role: TeamMemberRole) => {
    const response = await api.post(`/projects/${projectId}/team`, {
      email,
      role,
    });
    return response.data;
  },

  remove: async (projectId: string, userId: string) => {
    await api.delete(`/projects/${projectId}/team?userId=${userId}`);
  },

  updateRole: async (
    projectId: string,
    userId: string,
    role: TeamMemberRole
  ) => {
    await api.patch(`/projects/${projectId}/team`, {
      userId,
      role,
    });
  },

  getInvites: async () => {
    const response = await api.get<{ invites: ProjectInvite[] }>("/invites");
    return response.data.invites;
  },

  respondInvite: async (inviteId: string, action: "accept" | "decline") => {
    const response = await api.post("/invites", { inviteId, action });
    return response.data;
  },
};
