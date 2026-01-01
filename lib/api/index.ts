import { projectsApi } from "./projects";
import { entriesApi } from "./entries";
import { teamApi } from "./team";

import { releasesApi } from "./releases";

export const api = {
  projects: projectsApi,
  entries: entriesApi,
  team: teamApi,
  releases: releasesApi,
};
