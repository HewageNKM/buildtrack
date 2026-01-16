import { projectsApi } from "./projects";
import { entriesApi } from "./entries";
import { teamApi } from "./team";
import { releasesApi } from "./releases";
import { categoriesApi } from "./categories";
import { reportsApi } from "./reports";
import { commentsApi } from "./comments";
import { vendorsApi } from "./vendors";
import { phasesApi } from "./phases";
import { alertsApi } from "./alerts";
import { approvalsApi } from "./approvals";
import { recurringApi } from "./recurring";

export const api = {
  projects: projectsApi,
  entries: entriesApi,
  team: teamApi,
  releases: releasesApi,
  categories: categoriesApi,
  reports: reportsApi,
  comments: commentsApi,
  vendors: vendorsApi,
  phases: phasesApi,
  alerts: alertsApi,
  approvals: approvalsApi,
  recurring: recurringApi,
};
