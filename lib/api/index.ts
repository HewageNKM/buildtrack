import { projectsApi } from "./projects";
import { entriesApi } from "./entries";
import { teamApi } from "./team";

import { releasesApi } from "./releases";
import { categoriesApi } from "./categories";

export const api = {
  projects: projectsApi,
  entries: entriesApi,
  team: teamApi,
  releases: releasesApi,
  categories: categoriesApi,
};
