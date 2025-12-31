import { projectsApi } from "./projects";
import { entriesApi } from "./entries";
import { teamApi } from "./team";

export const api = {
  projects: projectsApi,
  entries: entriesApi,
  team: teamApi,
};
